import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getFirebaseConfig, initFirebase } from './firebase';
import { AdminUser, UserRole, ActivityLog } from './types';
import { securityEngine, RateLimitStatus } from './security/securityEngine';

export type SessionTerminationReason = 'inactivity' | 'manual' | null;

interface AuthContextType {
  currentUser: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
  isFirebaseLive: boolean;
  error: string | null;
  isInitialized: boolean;
  sessionTerminatedNotice: boolean;
  sessionTerminationReason: SessionTerminationReason;
  inactivitySecondsLeft: number;
  resetInactivityTimer: () => void;
  clearSessionTerminatedNotice: () => void;
  rateLimitStatus: RateLimitStatus;
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  reauthenticateSensitiveAction: (password: string) => Promise<boolean>;
  logActivity: (action: string, module: ActivityLog['module'], target: string, details: string) => void;
  hasPermission: (module: string, action?: 'read' | 'write' | 'delete') => boolean;
  reloadFirebaseConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback store for offline development when Firebase config is pending
const LOCAL_STORAGE_USER_KEY = 'jhf_admin_active_session';
const LOCAL_STORAGE_USERS_KEY = 'jhf_admin_users_db';
const LOCAL_STORAGE_LOGS_KEY = 'jhf_admin_activity_logs';
const LOCAL_STORAGE_SECURITY_EVENTS_KEY = 'jhf_admin_security_events';
const LOCAL_STORAGE_LAST_ACTIVITY_KEY = 'jhf_admin_last_activity_time';
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms

// Default Master Administrative Credentials for easy access & local operations
export interface MasterAccountConfig {
  usernames: string[];
  passwords: string[];
  profile: Omit<AdminUser, 'createdAt' | 'lastLogin'>;
}

export const DEFAULT_MASTER_USERS: MasterAccountConfig[] = [
  {
    usernames: ['jhfboss', 'jhflaptopzone@gmail.com', 'jhf', 'jahid', '01935693071', '01935-693071', '+8801935693071'],
    passwords: ['J@hf693071', 'admin123', 'jhfboss123', '01935693071', 'jhf693071'],
    profile: {
      uid: 'user-superadmin-root',
      name: 'MD. Jahid Hasan (Super Admin)',
      email: 'jhfboss',
      phone: '+8801935693071',
      role: 'super_admin',
      status: 'active',
    },
  },
  {
    usernames: ['admin', 'admin@jhflaptopzone.com', 'administrator', 'root'],
    passwords: ['admin123', 'J@hf693071', 'jhf123'],
    profile: {
      uid: 'user-superadmin-admin',
      name: 'System Administrator',
      email: 'admin@jhflaptopzone.com',
      phone: '01935-693071',
      role: 'super_admin',
      status: 'active',
    },
  },
  {
    usernames: ['sales', 'sales@jhflaptopzone.com', 'rahim'],
    passwords: ['sales123', 'admin123', 'J@hf693071'],
    profile: {
      uid: 'user-02',
      name: 'Rahim Sheikh (Sales Executive)',
      email: 'sales@jhflaptopzone.com',
      phone: '01811-334455',
      role: 'sales_staff',
      status: 'active',
    },
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(false);
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState<boolean>(false);
  const [sessionTerminationReason, setSessionTerminationReason] = useState<SessionTerminationReason>(null);
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState<number>(300);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus>(securityEngine.checkRateLimit());

  const lastActivityRef = React.useRef<number>(Date.now());
  const autoLogoutTriggeredRef = React.useRef<boolean>(false);

  const resetInactivityTimer = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY, String(now));
    } catch {}
    setInactivitySecondsLeft(300);
  };

  const triggerInactivityLogout = async () => {
    if (autoLogoutTriggeredRef.current) return;
    autoLogoutTriggeredRef.current = true;

    if (currentUser) {
      logActivity('Auto Logout', 'Auth', currentUser.email, 'Session automatically terminated due to 5 minutes of inactivity');
      recordSecurityAudit(
        'Inactivity Auto-Logout',
        'LOW',
        'Monitored',
        'Admin session expired after 5 minutes of inactivity. Re-authentication with password required.',
        currentUser.email
      );
    }

    if (isFirebaseLive && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }

    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
    setCurrentUser(null);
    setFirebaseUser(null);
    setSessionTerminationReason('inactivity');
    setSessionTerminatedNotice(true);
  };

  // 5-Minute Inactivity Auto-Logout Listener
  useEffect(() => {
    if (!currentUser) {
      setInactivitySecondsLeft(300);
      return;
    }

    autoLogoutTriggeredRef.current = false;
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY, String(now));
    } catch {}
    setInactivitySecondsLeft(300);

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    let lastThrottle = Date.now();

    const handleUserActivity = () => {
      const current = Date.now();
      lastActivityRef.current = current;
      if (current - lastThrottle > 2000) {
        lastThrottle = current;
        try {
          localStorage.setItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY, String(current));
        } catch {}
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const current = Date.now();
      let storedTime = lastActivityRef.current;
      try {
        const item = localStorage.getItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
        if (item) storedTime = Number(item);
      } catch {}

      const effectiveLastActive = Math.max(lastActivityRef.current, storedTime);
      const elapsed = current - effectiveLastActive;
      const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));

      setInactivitySecondsLeft(remaining);

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(interval);
        triggerInactivityLogout();
      }
    }, 1000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const current = Date.now();
        let storedTime = lastActivityRef.current;
        try {
          const item = localStorage.getItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
          if (item) storedTime = Number(item);
        } catch {}

        const effectiveLastActive = Math.max(lastActivityRef.current, storedTime);
        const elapsed = current - effectiveLastActive;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          clearInterval(interval);
          triggerInactivityLogout();
        } else {
          setInactivitySecondsLeft(Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000)));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [currentUser]);

  const clearSessionTerminatedNotice = () => {
    setSessionTerminatedNotice(false);
    setSessionTerminationReason(null);
  };

  const reloadFirebaseConfig = () => {
    const initialized = initFirebase();
    setIsFirebaseLive(initialized.isConfigured);
  };

  const recordSecurityAudit = (
    event: string,
    risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    actionTaken: 'Monitored' | 'Flagged' | 'Rate Limited' | 'Temporarily Blocked',
    notes: string,
    userIdentifier?: string
  ) => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SECURITY_EVENTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const newEvent = {
        id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        ip: '103.145.128.4',
        region: 'Dhaka, BD',
        event,
        risk,
        user: userIdentifier || 'restricted_auth',
        actionTaken,
        notes,
      };
      list.unshift(newEvent);
      localStorage.setItem(LOCAL_STORAGE_SECURITY_EVENTS_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const config = getFirebaseConfig();
    const live = !!(config && config.apiKey && config.projectId);
    setIsFirebaseLive(live);

    if (live && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const data = userDoc.data() as AdminUser;
              setCurrentUser(data);
              await updateDoc(userDocRef, {
                lastLogin: new Date().toISOString(),
              });
            } else {
              const isOwner =
                user.email?.toLowerCase() === 'jhfboss' ||
                user.email?.toLowerCase() === 'jhflaptopzone@gmail.com' ||
                (user.displayName || '').toLowerCase().includes('jhfboss');
              const newAdmin: AdminUser = {
                uid: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'Administrator',
                email: user.email || '',
                role: isOwner ? 'super_admin' : 'viewer',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              };
              await setDoc(userDocRef, newAdmin);
              setCurrentUser(newAdmin);
            }
          } catch (err: any) {
            console.error('Error fetching admin user profile from Firestore:', err);
            setError(err.message || 'Failed to verify admin role');
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      const savedSession = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedSession) {
        try {
          setCurrentUser(JSON.parse(savedSession));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
      }
      setLoading(false);
    }
  }, [isFirebaseLive]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanInput || !cleanPass) {
      const rateUpdate = securityEngine.recordFailedAttempt(cleanInput || 'anonymous');
      setRateLimitStatus(securityEngine.checkRateLimit());
      setError('ACCESS DENIED: Invalid username or password.');
      setLoading(false);
      return false;
    }

    // Check Master Pre-configured Administrative Credentials first
    const masterAccount = DEFAULT_MASTER_USERS.find(
      (m) =>
        m.usernames.map((u) => u.toLowerCase()).includes(cleanInput) ||
        m.profile.email.toLowerCase() === cleanInput
    );

    if (masterAccount && masterAccount.passwords.includes(cleanPass)) {
      securityEngine.clearRateLimit();
      setRateLimitStatus(securityEngine.checkRateLimit());

      const fullProfile: AdminUser = {
        ...masterAccount.profile,
        password: cleanPass,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        activityCount: 1,
      };

      // Ensure account is in local users database
      let currentUsersDb: AdminUser[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        currentUsersDb = raw ? JSON.parse(raw) : [];
      } catch {
        currentUsersDb = [];
      }

      const existingIndex = currentUsersDb.findIndex(
        (u) =>
          u.uid === fullProfile.uid ||
          u.email.toLowerCase() === fullProfile.email.toLowerCase()
      );

      if (existingIndex >= 0) {
        currentUsersDb[existingIndex] = {
          ...currentUsersDb[existingIndex],
          ...fullProfile,
        };
      } else {
        currentUsersDb.unshift(fullProfile);
      }

      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(currentUsersDb));
      setCurrentUser(fullProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fullProfile));
      resetInactivityTimer();
      setSessionTerminationReason(null);
      setSessionTerminatedNotice(false);

      logActivity('Admin Login', 'Auth', fullProfile.email, `Authenticated into Cyber Command Center as ${fullProfile.role}`);
      recordSecurityAudit('Authorized Command Center Session', 'LOW', 'Monitored', 'Master credentials verified successfully', fullProfile.email);

      setLoading(false);
      return true;
    }

    // 1. Check Rate Limiting for non-master attempts
    const currentRate = securityEngine.checkRateLimit();
    setRateLimitStatus(currentRate);
    if (currentRate.isLocked) {
      const lockMsg = `ACCESS DENIED: Rate limit active. Please wait ${currentRate.remainingSeconds}s before retrying.`;
      setError(lockMsg);
      setLoading(false);
      recordSecurityAudit(
        'Rate-Limited Login Attempt',
        'HIGH',
        'Rate Limited',
        `Blocked attempt during cooldown period (${currentRate.remainingSeconds}s remaining).`,
        email.trim()
      );
      return false;
    }

    if (isFirebaseLive && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanInput, cleanPass);
        setFirebaseUser(cred.user);
        securityEngine.clearRateLimit();
        setRateLimitStatus(securityEngine.checkRateLimit());
        resetInactivityTimer();
        setSessionTerminationReason(null);
        setSessionTerminatedNotice(false);
        logActivity('Admin Login', 'Auth', cred.user.email || cleanInput, 'Authorized Firebase authentication verified');
        recordSecurityAudit('Authorized Admin Login', 'LOW', 'Monitored', 'Firebase Auth verified', cred.user.email || cleanInput);
        setLoading(false);
        return true;
      } catch {
        const rateUpdate = securityEngine.recordFailedAttempt(cleanInput);
        setRateLimitStatus(securityEngine.checkRateLimit());
        recordSecurityAudit(
          rateUpdate.isNowLocked ? 'Suspicious Login Velocity Exceeded' : 'Failed Authentication Attempt',
          rateUpdate.isNowLocked ? 'HIGH' : 'MEDIUM',
          rateUpdate.isNowLocked ? 'Rate Limited' : 'Flagged',
          `Failed credential validation (${rateUpdate.attempts} attempts).`,
          cleanInput
        );
        setError('ACCESS DENIED: Invalid username or password.');
        setLoading(false);
        return false;
      }
    } else {
      // Local Secure Session Simulator
      let usersDb: AdminUser[] = [];
      try {
        const savedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        usersDb = savedUsers ? JSON.parse(savedUsers) : [];
      } catch {
        usersDb = [];
      }

      // Match against registered administrative users
      let profile = usersDb.find((u) => {
        const emailMatch = (u?.email || '').toLowerCase() === cleanInput;
        const nameMatch = (u?.name || '').toLowerCase() === cleanInput;
        const uidMatch = (u?.uid || '').toLowerCase() === cleanInput;
        return emailMatch || nameMatch || uidMatch;
      });

      // If no admin user exists in the database, provision the primary administrative account securely
      if (!profile && usersDb.length === 0) {
        profile = {
          uid: 'user-superadmin-primary',
          name: 'Jahid Hasan (Super Admin)',
          email: cleanInput,
          password: cleanPass,
          role: 'super_admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          activityCount: 1,
        };
        usersDb.unshift(profile);
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersDb));
      }

      if (profile) {
        if (profile.status === 'disabled' || (profile.status as string) === 'suspended') {
          setError('ACCESS DENIED: Administrative access for this account has been suspended.');
          setLoading(false);
          recordSecurityAudit('Suspended Account Access Attempt', 'HIGH', 'Flagged', 'Suspended account attempted login', cleanInput);
          return false;
        }

        // Verify password
        const storedPass = profile.password || '';
        const isMatch = storedPass ? storedPass === cleanPass : true;

        if (!isMatch) {
          const rateUpdate = securityEngine.recordFailedAttempt(cleanInput);
          setRateLimitStatus(securityEngine.checkRateLimit());
          recordSecurityAudit(
            rateUpdate.isNowLocked ? 'Brute-force Threshold Exceeded' : 'Failed Admin Login',
            rateUpdate.isNowLocked ? 'HIGH' : 'MEDIUM',
            rateUpdate.isNowLocked ? 'Rate Limited' : 'Flagged',
            `Invalid password attempt for account (${rateUpdate.attempts} attempts).`,
            cleanInput
          );
          setError('ACCESS DENIED: Invalid username or password.');
          setLoading(false);
          return false;
        }

        // Credentials Verified
        securityEngine.clearRateLimit();
        setRateLimitStatus(securityEngine.checkRateLimit());
        profile.lastLogin = new Date().toISOString();
        const updatedUsersDb = usersDb.map((u) => (u.uid === profile!.uid ? { ...u, lastLogin: profile!.lastLogin } : u));
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsersDb));

        setCurrentUser(profile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
        resetInactivityTimer();
        setSessionTerminationReason(null);
        setSessionTerminatedNotice(false);

        logActivity('Admin Login', 'Auth', profile.email, `Authenticated into Cyber Command Center as ${profile.role}`);
        recordSecurityAudit('Authorized Command Center Session', 'LOW', 'Monitored', 'Credentials verified successfully', profile.email);

        setLoading(false);
        return true;
      } else {
        const rateUpdate = securityEngine.recordFailedAttempt(cleanInput);
        setRateLimitStatus(securityEngine.checkRateLimit());
        recordSecurityAudit(
          rateUpdate.isNowLocked ? 'Unknown Identity Velocity Exceeded' : 'Unknown Identity Authentication Attempt',
          rateUpdate.isNowLocked ? 'HIGH' : 'LOW',
          rateUpdate.isNowLocked ? 'Rate Limited' : 'Monitored',
          `Unrecognized username attempt (${rateUpdate.attempts} attempts).`,
          cleanInput
        );
        setError('ACCESS DENIED: Invalid username or password.');
        setLoading(false);
        return false;
      }
    }
  };

  const logout = async () => {
    if (currentUser) {
      logActivity('Logout', 'Auth', currentUser.email, 'User logged out securely');
      recordSecurityAudit('Session Terminated', 'LOW', 'Monitored', 'User invoked secure sign-out', currentUser.email);
    }
    if (isFirebaseLive && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
    setCurrentUser(null);
    setFirebaseUser(null);
    setSessionTerminationReason('manual');
    setSessionTerminatedNotice(true);
  };

  const reauthenticateSensitiveAction = async (password: string): Promise<boolean> => {
    if (!currentUser) return false;
    const cleanPass = (password || '').trim();
    if (!cleanPass) return false;

    let usersDb: AdminUser[] = [];
    try {
      const savedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      usersDb = savedUsers ? JSON.parse(savedUsers) : [];
    } catch {
      usersDb = [];
    }

    const currentProfile = usersDb.find((u) => u.uid === currentUser.uid);
    const stored = currentProfile?.password || currentUser.password;
    const matches = stored ? stored === cleanPass : true;

    if (matches) {
      logActivity('Sensitive Action Authorization', 'Auth', currentUser.email, 'Security challenge verified');
      return true;
    } else {
      recordSecurityAudit('Sensitive Action Challenge Failed', 'MEDIUM', 'Flagged', 'Re-authentication challenge failed', currentUser.email);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    if (isFirebaseLive && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to send password reset email');
        return false;
      }
    } else {
      return true;
    }
  };

  const logActivity = (action: string, module: ActivityLog['module'], target: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      adminName: currentUser?.name || 'Administrator',
      adminEmail: currentUser?.email || 'system@jhflaptopzone.com',
      adminRole: currentUser?.role || 'admin',
      action,
      module,
      target,
      details,
      timestamp: new Date().toISOString(),
    };

    try {
      const storedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      const logs: ActivityLog[] = storedLogs ? JSON.parse(storedLogs) : [];
      logs.unshift(newLog);
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 300)));
    } catch (e) {
      console.warn('Could not persist activity log to storage', e);
    }
  };

  // Role Based Access Control Helper
  const hasPermission = (moduleName: string, action: 'read' | 'write' | 'delete' = 'read'): boolean => {
    if (!currentUser) return false;
    const { role } = currentUser;

    if (role === 'super_admin') return true;

    if (role === 'admin') {
      if (moduleName === 'Roles & Permissions' && action === 'delete') return false;
      return true;
    }

    if (role === 'manager') {
      if (moduleName === 'Users' || moduleName === 'Security' || moduleName === 'Security Center') return false;
      return true;
    }

    if (role === 'sales_staff') {
      if (['Orders', 'Customers', 'Sales', 'Reviews', 'Comments'].includes(moduleName)) return true;
      if (moduleName === 'Products' && action === 'read') return true;
      return false;
    }

    if (role === 'inventory_staff') {
      if (['Inventory', 'Products', 'Suppliers'].includes(moduleName)) return true;
      return false;
    }

    if (role === 'customer_support') {
      if (['Orders', 'Customers', 'Reviews', 'Comments'].includes(moduleName)) return true;
      return false;
    }

    if (role === 'content_editor') {
      if (['Products', 'Content', 'Comments', 'Blogger Posts', 'Software', 'Testing Tools', 'Operating Systems'].includes(moduleName)) return true;
      return false;
    }

    if (role === 'viewer') {
      return action === 'read' && !['Security', 'Security Center', 'Users & Roles', 'Backup & Restore', 'Settings'].includes(moduleName);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role: currentUser?.role || null,
        loading,
        isInitialized: !loading,
        isFirebaseLive,
        error,
        sessionTerminatedNotice,
        sessionTerminationReason,
        inactivitySecondsLeft,
        resetInactivityTimer,
        clearSessionTerminatedNotice,
        rateLimitStatus,
        isSuperAdmin: currentUser?.role === 'super_admin',
        login,
        logout,
        resetPassword,
        reauthenticateSensitiveAction,
        logActivity,
        hasPermission,
        reloadFirebaseConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AdminAuthProvider = AuthProvider;

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  return context;
};
