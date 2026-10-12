import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Terminal,
  Lock,
  Eye,
  AlertTriangle,
  Globe,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  UserX,
  Radio,
  Cpu,
} from 'lucide-react';

interface SecurityCommandCenterViewProps {
  initialSubTab?: 'center' | 'ip' | 'risk' | 'audit';
}

export const SecurityCommandCenterView: React.FC<SecurityCommandCenterViewProps> = ({
  initialSubTab = 'center',
}) => {
  const { auditLogs, clearAuditLogs } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const [activeSubTab, setActiveSubTab] = useState<'center' | 'ip' | 'risk' | 'audit'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [liveTerminalTick, setLiveTerminalTick] = useState(0);

  // Periodic heartbeat animation for terminal
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTerminalTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Mocked live telemetry streams for IP activity
  const activeSessions = [
    {
      id: 'sess-01',
      user: currentUser?.email || 'admin@jhflaptopzone.com',
      role: currentUser?.role || 'Super Admin',
      ip: '103.205.140.22',
      location: 'Dhaka, Bangladesh',
      isp: 'Fiber@Home / Grameenphone',
      browser: 'Chrome 128 / Windows 11 Pro',
      status: 'Active (Current Session)',
      statusColor: 'text-emerald-400',
      lastPing: '2s ago',
      riskScore: 0,
    },
    {
      id: 'sess-02',
      user: 'service@jhflaptopzone.com',
      role: 'Service Engineer',
      ip: '103.145.118.89',
      location: 'Gazipur, Bangladesh',
      isp: 'AmberIT Dedicated',
      browser: 'Firefox 130 / Ubuntu Linux',
      status: 'Active',
      statusColor: 'text-emerald-400',
      lastPing: '14s ago',
      riskScore: 5,
    },
    {
      id: 'sess-03',
      user: 'Anonymous Crawler',
      role: 'Guest / Scanner',
      ip: '185.220.101.5',
      location: 'Frankfurt, Germany (Tor Exit)',
      isp: 'Datacenter Hosting',
      browser: 'Python-requests/2.31.0',
      status: 'Blocked by Rate Limiter',
      statusColor: 'text-rose-400',
      lastPing: '2m ago',
      riskScore: 95,
    },
    {
      id: 'sess-04',
      user: 'Guest Checkout Session',
      role: 'Public Visitor',
      ip: '27.147.202.14',
      location: 'Chittagong, Bangladesh',
      isp: 'Banglalink Mobile 4G',
      browser: 'Safari Mobile / iOS 17.5',
      status: 'Browsing Store',
      statusColor: 'text-blue-400',
      lastPing: '45s ago',
      riskScore: 2,
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ip && log.ip.includes(searchQuery));
    const matchesSeverity = severityFilter === 'ALL' || (log.severity || 'info').toUpperCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* High-Tech Cyber Command Header */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle matrix scanline glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/50">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-widest text-white uppercase font-mono">
                  JHF CYBER COMMAND CENTER
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE DEFENSE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Session Sentinel &bull; RBAC Enforcer &bull; Threat Intelligence &bull; 5-Min Inactivity Auto-Lock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>FIREWALL: STRICT</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 / AES-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto gap-1">
        {[
          { id: 'center', label: 'Security Center', icon: Activity },
          { id: 'ip', label: 'IP Activity & Geolocation', icon: Globe },
          { id: 'risk', label: 'Risk Monitor & Rate Limiter', icon: AlertTriangle },
          { id: 'audit', label: `Audit Activity Logs (${auditLogs.length})`, icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 font-mono transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SECURITY CENTER OVERVIEW */}
      {activeSubTab === 'center' && (
        <div className="space-y-6">
          {/* Security KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase">System Integrity</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                100% SECURE
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Zero unhandled breaches</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Active Admin Sessions</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">02 ACTIVE</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">TLS session token verified</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Auto-Logout Sentinel</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">300s (5 MIN)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Activity heartbeat resetting</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Blocked Malicious Probes</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">14 ATTACK BLOCKS</div>
              <div className="text-[10px] text-rose-500/80 font-mono mt-0.5">WAF / honeypot tripped</div>
            </div>
          </div>

          {/* Real-Time Cyber Terminal Log Feed */}
          <div className="bg-black border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></div>
                <span className="text-emerald-400 font-bold ml-2">jhf-cyber-sentinel@node-01:~# tail -f /var/log/jhf_security.log</span>
              </div>
              <span className="text-slate-500">POLL: 1000ms</span>
            </div>

            <div className="p-4 space-y-1.5 text-[11px] max-h-72 overflow-y-auto bg-black/95 text-emerald-400">
              <div className="text-slate-500">// JHF Laptop Zone Enterprise Defense Daemon v4.2.1 initialized</div>
              <div>[SEC-AUTH-OK] 2026-09-14T04:12:01Z Admin token validated for {currentUser?.email || 'admin@jhflaptopzone.com'} (Role: {currentUser?.role || 'admin'})</div>
              <div className="text-blue-400">[INACTIVITY-GUARD] Heartbeat verified. Active session reset timer at 300s window.</div>
              <div className="text-amber-400">[RATE-LIMIT] Public catalog query rate: 12 req/min (Nominal threshold: 120 req/min).</div>
              <div className="text-rose-400">[SHIELD-DROP] IP 185.220.101.5 attempted SQL injection signature '/api/catalog?brand=1%27OR%271%27=%271' -&gt; HTTP 403 FORBIDDEN.</div>
              <div>[DATA-CENTER] isDummy isolation layer: Verified 12 collections. Live business data partition protected.</div>
              <div>[SERVICE-ZONE] Micro-soldering lab records synced with SHA-256 state check.</div>
              <div className="text-emerald-300 font-bold">
                &gt; SYSTEM DEFENSE LEVEL: 100% NOMINAL. ZERO INTRUSIONS DETECTED. _
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IP ACTIVITY & GEOLOCATION */}
      {activeSubTab === 'ip' && (
        <div className="space-y-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white font-mono">Live Ingress IP Activity &amp; Geolocation Map</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time socket connections to JHF Laptop Zone administrative and customer portals.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">User / Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Geolocation</th>
                  <th className="py-3 px-4">Network / ISP</th>
                  <th className="py-3 px-4">User Agent</th>
                  <th className="py-3 px-4 text-center">Threat Score</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                {activeSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{sess.user}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sess.role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-400 font-bold">{sess.ip}</td>
                    <td className="py-3 px-4">{sess.location}</td>
                    <td className="py-3 px-4 text-slate-400">{sess.isp}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">{sess.browser}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sess.riskScore > 50 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {sess.riskScore} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      <span className={sess.statusColor}>{sess.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RISK MONITOR */}
      {activeSubTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white font-mono">Automated Threat Mitigation &amp; Rate Limiter Rules</h3>
            <p className="text-xs text-slate-400 mt-0.5">Multi-tier safeguards protecting login forms, checkout endpoints, and inventory databases.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Brute-Force Login Lockout</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ENFORCED</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Accounts lock for 15 minutes after 5 consecutive failed credential attempts. IP is added to honeypot jail.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span>5-Minute Inactivity Auto-Logout</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ACTIVE</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Browser activity listeners automatically terminate administrative credentials after 300s of idle time.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span>CSRF &amp; State Token Verification</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">VERIFIED</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                State mutating actions (stock adjustment, user permission update, payment recording) require signed authorization headers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4 font-sans">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit actions, user emails, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    severityFilter === sev
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}

              <button
                onClick={clearAuditLogs}
                className="px-3 py-1 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800/40 transition ml-2"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 font-mono">IP Address</th>
                  <th className="py-3 px-4 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                    <td className="py-3 px-4 text-blue-400">{log.user}</td>
                    <td className="py-3 px-4 text-slate-300">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ip || '103.205.140.22'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {log.severity || 'info'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
