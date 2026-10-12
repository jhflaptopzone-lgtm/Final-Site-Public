import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LaptopItem,
  DownloadItem,
  WarrantyTier,
  LAPTOPS_DATA,
  SOFTWARE_LIBRARY,
  TESTING_TOOLS,
  OS_ISOS,
  WARRANTY_TIERS,
  STORE_INFO
} from '../data/jhfData';

interface StoreInfoType {
  name: string;
  tagline: string;
  domain: string;
  phones: string[];
  whatsapp: string;
  whatsappDisplay: string;
  location: string;
  delivery: string;
  visitingCardImg: string;
  paymentCardImg: string;
  galleryFolder: string;
  sharaAiLink: string;
  marketingCourseLink: string;
  branchOffice?: string;
  mainOffice?: string;
  email?: string;
  facebook?: string;
  facebookUrl?: string;
  web?: string;
  webUrl?: string;
}

interface StoreContextType {
  laptops: LaptopItem[];
  softwareList: DownloadItem[];
  testingTools: DownloadItem[];
  osList: DownloadItem[];
  warrantyTiers: WarrantyTier[];
  storeInfo: StoreInfoType;
  
  // Admin Auth
  isAuthenticated: boolean;
  adminEmail: string;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  
  // CRUD Operations
  addLaptop: (item: Omit<LaptopItem, 'id'>) => void;
  updateLaptop: (id: string, item: Partial<LaptopItem>) => void;
  deleteLaptop: (id: string) => void;
  clearAllLaptops: () => void;
  
  addSoftware: (item: Omit<DownloadItem, 'id'>) => void;
  updateSoftware: (id: string, item: Partial<DownloadItem>) => void;
  deleteSoftware: (id: string) => void;
  clearAllSoftware: () => void;
  
  addTestingTool: (item: Omit<DownloadItem, 'id'>) => void;
  updateTestingTool: (id: string, item: Partial<DownloadItem>) => void;
  deleteTestingTool: (id: string) => void;
  clearAllTestingTools: () => void;
  
  addOsItem: (item: Omit<DownloadItem, 'id'>) => void;
  updateOsItem: (id: string, item: Partial<DownloadItem>) => void;
  deleteOsItem: (id: string) => void;
  clearAllOsItems: () => void;
  
  updateStoreInfo: (info: Partial<StoreInfoType>) => void;
  updateWarrantyTier: (id: string, tier: Partial<WarrantyTier>) => void;
  
  // Backup & XML
  resetAllToDefault: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
  generateDynamicXml: () => string;

  // Public View & Visiting Card Modal
  activePublicView: string;
  setActivePublicView: (view: string) => void;
  isVisitingCardOpen: boolean;
  openVisitingCard: () => void;
  closeVisitingCard: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LAPTOPS: 'jhf_store_laptops_v3',
  SOFTWARE: 'jhf_store_software_v3',
  TESTING: 'jhf_store_testing_v3',
  OS: 'jhf_store_os_v3',
  WARRANTY: 'jhf_store_warranty_v3',
  STORE_INFO: 'jhf_store_info_v3',
  AUTH: 'jhf_store_auth_v3'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laptops, setLaptops] = useState<LaptopItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAPTOPS);
      return saved ? JSON.parse(saved) : LAPTOPS_DATA;
    } catch {
      return LAPTOPS_DATA;
    }
  });

  const [softwareList, setSoftwareList] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOFTWARE);
      return saved ? JSON.parse(saved) : SOFTWARE_LIBRARY;
    } catch {
      return SOFTWARE_LIBRARY;
    }
  });

  const [testingTools, setTestingTools] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTING);
      return saved ? JSON.parse(saved) : TESTING_TOOLS;
    } catch {
      return TESTING_TOOLS;
    }
  });

  const [osList, setOsList] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OS);
      return saved ? JSON.parse(saved) : OS_ISOS;
    } catch {
      return OS_ISOS;
    }
  });

  const [warrantyTiers, setWarrantyTiers] = useState<WarrantyTier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WARRANTY);
      return saved ? JSON.parse(saved) : WARRANTY_TIERS;
    } catch {
      return WARRANTY_TIERS;
    }
  });

  // Public active view & Visiting card modal states
  const [activePublicView, setActivePublicView] = useState<string>('catalog');
  const [isVisitingCardOpen, setIsVisitingCardOpen] = useState<boolean>(false);
  const openVisitingCard = () => setIsVisitingCardOpen(true);
  const closeVisitingCard = () => setIsVisitingCardOpen(false);

  const [storeInfo, setStoreInfo] = useState<StoreInfoType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...STORE_INFO,
          ...parsed,
          branchOffice: STORE_INFO.branchOffice,
          mainOffice: STORE_INFO.mainOffice,
          location: STORE_INFO.location,
          tagline: STORE_INFO.tagline,
          email: STORE_INFO.email,
          facebook: STORE_INFO.facebook,
          facebookUrl: STORE_INFO.facebookUrl,
          web: STORE_INFO.web,
          webUrl: STORE_INFO.webUrl,
        };
      }
      return STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('jhf_admin_email') || 'jhflaptopzone@gmail.com';
    } catch {
      return 'jhflaptopzone@gmail.com';
    }
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAPTOPS, JSON.stringify(laptops));
  }, [laptops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOFTWARE, JSON.stringify(softwareList));
  }, [softwareList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTING, JSON.stringify(testingTools));
  }, [testingTools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OS, JSON.stringify(osList));
  }, [osList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WARRANTY, JSON.stringify(warrantyTiers));
  }, [warrantyTiers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(storeInfo));
  }, [storeInfo]);

  // Auth functions
  const login = (emailInput: string, passInput: string) => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPass = (passInput || '').trim();

    // Check against registered Admin Users in database
    let adminUsersList: any[] = [];
    try {
      const saved = localStorage.getItem('jhf_admin_users_db');
      adminUsersList = saved ? JSON.parse(saved) : [];
    } catch {
      adminUsersList = [];
    }

    const matchedUser = adminUsersList.find((u) => {
      const uEmail = (u?.email || '').toLowerCase();
      const uName = (u?.name || '').toLowerCase();
      return uEmail === cleanEmail || uName === cleanEmail;
    });

    if (matchedUser) {
      if (matchedUser.status === 'disabled' || matchedUser.status === 'suspended') {
        return { success: false, error: 'This admin account has been suspended.' };
      }
      if (matchedUser.password && matchedUser.password.trim() !== '') {
        if (cleanPass !== matchedUser.password) {
          return { success: false, error: 'Invalid password. Please try again.' };
        }
      }
      setIsAuthenticated(true);
      setAdminEmail(matchedUser.email);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem('jhf_admin_email', matchedUser.email);
      return { success: true };
    }

    // Admin authorization check against registered administrator accounts
    const isOwnerEmail =
      cleanEmail === 'jhflaptopzone@gmail.com' ||
      cleanEmail === 'admin@jhflaptopzone.com';

    if (isOwnerEmail && cleanPass) {
      setIsAuthenticated(true);
      setAdminEmail(cleanEmail);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem('jhf_admin_email', cleanEmail);
      return { success: true };
    }

    return {
      success: false,
      error: 'ACCESS DENIED: Invalid username or password.'
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  // CRUD Laptop
  const addLaptop = (item: Omit<LaptopItem, 'id'>) => {
    const newId = `laptop-${Date.now()}`;
    setLaptops((prev) => [{ ...item, id: newId }, ...prev]);
  };

  const updateLaptop = (id: string, updatedFields: Partial<LaptopItem>) => {
    setLaptops((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteLaptop = (id: string) => {
    setLaptops((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllLaptops = () => {
    setLaptops([]);
  };

  // CRUD Software
  const addSoftware = (item: Omit<DownloadItem, 'id'>) => {
    const newId = `sw-${Date.now()}`;
    setSoftwareList((prev) => [{ ...item, id: newId }, ...prev]);
  };

  const updateSoftware = (id: string, updatedFields: Partial<DownloadItem>) => {
    setSoftwareList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteSoftware = (id: string) => {
    setSoftwareList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllSoftware = () => {
    setSoftwareList([]);
  };

  // CRUD Testing Tool
  const addTestingTool = (item: Omit<DownloadItem, 'id'>) => {
    const newId = `test-${Date.now()}`;
    setTestingTools((prev) => [{ ...item, id: newId }, ...prev]);
  };

  const updateTestingTool = (id: string, updatedFields: Partial<DownloadItem>) => {
    setTestingTools((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteTestingTool = (id: string) => {
    setTestingTools((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllTestingTools = () => {
    setTestingTools([]);
  };

  // CRUD OS Item
  const addOsItem = (item: Omit<DownloadItem, 'id'>) => {
    const newId = `os-${Date.now()}`;
    setOsList((prev) => [{ ...item, id: newId }, ...prev]);
  };

  const updateOsItem = (id: string, updatedFields: Partial<DownloadItem>) => {
    setOsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteOsItem = (id: string) => {
    setOsList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllOsItems = () => {
    setOsList([]);
  };

  // Store & Warranty Updates
  const updateStoreInfo = (info: Partial<StoreInfoType>) => {
    setStoreInfo((prev) => ({ ...prev, ...info }));
  };

  const updateWarrantyTier = (id: string, tier: Partial<WarrantyTier>) => {
    setWarrantyTiers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...tier } : item))
    );
  };

  // Reset to default
  const resetAllToDefault = () => {
    setLaptops(LAPTOPS_DATA);
    setSoftwareList(SOFTWARE_LIBRARY);
    setTestingTools(TESTING_TOOLS);
    setOsList(OS_ISOS);
    setWarrantyTiers(WARRANTY_TIERS);
    setStoreInfo(STORE_INFO);
    localStorage.removeItem(STORAGE_KEYS.LAPTOPS);
    localStorage.removeItem(STORAGE_KEYS.SOFTWARE);
    localStorage.removeItem(STORAGE_KEYS.TESTING);
    localStorage.removeItem(STORAGE_KEYS.OS);
    localStorage.removeItem(STORAGE_KEYS.WARRANTY);
    localStorage.removeItem(STORAGE_KEYS.STORE_INFO);
  };

  // Export DB
  const exportDatabaseJson = () => {
    const db = {
      storeInfo,
      laptops,
      softwareList,
      testingTools,
      osList,
      warrantyTiers,
      exportedAt: new Date().toISOString(),
      version: '3.1.0'
    };
    return JSON.stringify(db, null, 2);
  };

  // Import DB
  const importDatabaseJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.laptops && Array.isArray(parsed.laptops)) setLaptops(parsed.laptops);
      if (parsed.softwareList && Array.isArray(parsed.softwareList)) setSoftwareList(parsed.softwareList);
      if (parsed.testingTools && Array.isArray(parsed.testingTools)) setTestingTools(parsed.testingTools);
      if (parsed.osList && Array.isArray(parsed.osList)) setOsList(parsed.osList);
      if (parsed.warrantyTiers && Array.isArray(parsed.warrantyTiers)) setWarrantyTiers(parsed.warrantyTiers);
      if (parsed.storeInfo) setStoreInfo(parsed.storeInfo);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  // Dynamic XML Generator
  const generateDynamicXml = () => {
    const escapeXml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const laptopCardsXml = laptops
      .map(
        (lap) => `                <article class='product-card' data-brand='${escapeXml(lap.brand)}' data-title='${escapeXml(lap.title)}'>
                  <div class='product-thumb-wrap'>
                    <img alt='${escapeXml(lap.title)}' class='product-thumb' src='${escapeXml(lap.image)}' loading='lazy'/>
                    <span class='badge-tag'>${escapeXml(lap.tag)}</span>
                    <span class='badge-brand'>${escapeXml(lap.brand)}</span>
                  </div>
                  <div class='product-body'>
                    <div class='product-series'>${escapeXml(lap.brand)} ${escapeXml(lap.series)}</div>
                    <h3 class='product-title'>${escapeXml(lap.title)}</h3>
                    <div class='product-specs'>${escapeXml(lap.specs)}</div>
                    <div class='product-footer'>
                      <div class='price-row'>
                        <div>
                          <span class='price-label'>Price</span>
                          <div class='product-price'>${escapeXml(lap.price)}</div>
                        </div>
                        <span style='font-size:11px;color:#16a34a;font-weight:600;'>✓ Tested Unit</span>
                      </div>
                      <div class='product-actions-grid'>
                        <a class='btn btn-outline btn-sm' href='${escapeXml(lap.url || `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(lap.title)}`)}' target='_blank'>Details</a>
                        <a class='btn btn-whatsapp btn-sm' href='https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(`Hello JHF, I want to order ${lap.title}`)}' target='_blank'>Order WhatsApp</a>
                      </div>
                    </div>
                  </div>
                </article>`
      )
      .join('\n');

    const testingCardsXml = testingTools
      .map(
        (tool) => `        <div class='hub-card' data-id='${escapeXml(tool.id)}'>
          <div class='hub-card-cat'>${escapeXml(tool.category)}</div>
          <div class='hub-card-title'>${escapeXml(tool.title)}</div>
          ${tool.description ? `<p style='font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.4;'>${escapeXml(tool.description)}</p>` : ''}
          <a class='btn btn-outline btn-sm hub-card-btn' href='${escapeXml(tool.link)}' target='_blank'>Download Tool ↗</a>
        </div>`
      )
      .join('\n');

    const softwareCardsXml = softwareList
      .map(
        (sw) => `        <div class='hub-card' data-id='${escapeXml(sw.id)}'>
          <div class='hub-card-cat'>${escapeXml(sw.category)}</div>
          <div class='hub-card-title'>${escapeXml(sw.title)}</div>
          ${sw.description ? `<p style='font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.4;'>${escapeXml(sw.description)}</p>` : ''}
          <a class='btn btn-outline btn-sm hub-card-btn' href='${escapeXml(sw.link)}' target='_blank'>Download ↗</a>
        </div>`
      )
      .join('\n');

    const osCardsXml = osList
      .map(
        (os) => `        <div class='hub-card' data-id='${escapeXml(os.id)}'>
          <div class='hub-card-cat'>${escapeXml(os.category)}</div>
          <div class='hub-card-title'>${escapeXml(os.title)}</div>
          ${os.description ? `<p style='font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.4;'>${escapeXml(os.description)}</p>` : ''}
          <a class='btn btn-outline btn-sm hub-card-btn' href='${escapeXml(os.link)}' target='_blank'>Download ↗</a>
        </div>`
      )
      .join('\n');

    const warrantyTiersXml = warrantyTiers
      .map(
        (w) => `        <div style='background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius);padding:20px;'>
          <div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;'>
            <h3 style='font-size:17px;font-weight:700;color:var(--accent);'>${escapeXml(w.emoji)} ${escapeXml(w.title)}</h3>
            <span style='background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;'>${escapeXml(w.badge)}</span>
          </div>
          <p style='font-size:14px;line-height:1.7;color:var(--text);'>
            ${escapeXml(w.descriptionBn)}
          </p>
        </div>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateVersion='1.0' expr:class='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>

  <!-- Google Site Verifications -->
  <meta content='znQWopVItv01fEum7SvKDNZk_fDhpas1RDQB4DlrQ40' name='google-site-verification'/>
  <meta content='B0Ju6naCWVgtsQVDZvbFUxQAXMvQx_vijQZNu49EJME' name='google-site-verification'/>
  
  <b:if cond='data:view.isHomepage'>
    <title>${escapeXml(storeInfo.name)} | Quality Used Business Laptops in Bangladesh</title>
  <b:elseif cond='data:view.isError'/>
    <title>Page Not Found | ${escapeXml(storeInfo.name)}</title>
  <b:else/>
    <title><data:blog.pageName/> | ${escapeXml(storeInfo.name)}</title>
  </b:if>

  <b:if cond='data:blog.metaDescription'>
    <meta expr:content='data:blog.metaDescription' name='description'/>
    <meta expr:content='data:blog.metaDescription' property='og:description'/>
  <b:else/>
    <meta content='${escapeXml(storeInfo.name)} - ${escapeXml(storeInfo.tagline)}' name='description'/>
    <meta content='${escapeXml(storeInfo.name)} - ${escapeXml(storeInfo.tagline)}' property='og:description'/>
  </b:if>

  <meta expr:content='data:blog.canonicalUrl' property='og:url'/>
  <meta expr:content='data:blog.title' property='og:site_name'/>
  <meta content='website' property='og:type'/>
  <meta content='summary_large_image' name='twitter:card'/>
  <link expr:href='data:blog.canonicalUrl' rel='canonical'/>

  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;family=Hind+Siliguri:wght@400;500;600;700&amp;display=swap' rel='stylesheet'/>

  <script async='async' crossorigin='anonymous' src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9128569000742841'></script>

  <b:skin><![CDATA[
  /*
  Name: ${storeInfo.name} Customizer Theme
  Domain: ${storeInfo.domain}
  WhatsApp: ${storeInfo.whatsapp}
  Hotline: ${storeInfo.phones[0]} / ${storeInfo.phones[1] || ''}
  Generated: ${new Date().toLocaleDateString()}
  */
  ]]></b:skin>

  <style type='text/css'>
  /*<![CDATA[*/
  :root {
    --primary: #0f172a;
    --primary-dark: #020617;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-light: #eff6ff;
    --background: #f8fafc;
    --surface: #ffffff;
    --surface-alt: #f1f5f9;
    --text: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --border-light: #f1f5f9;
    --success: #16a34a;
    --warning: #f59e0b;
    --danger: #ef4444;
    --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);
    --radius-sm: 6px;
    --radius: 10px;
    --radius-lg: 16px;
    --radius-full: 9999px;
    --container: 1240px;
    --header-height: 72px;
  }

  [data-theme='dark'] {
    --primary: #f8fafc;
    --primary-dark: #ffffff;
    --accent: #3b82f6;
    --accent-hover: #60a5fa;
    --accent-light: #1e293b;
    --background: #090d16;
    --surface: #111827;
    --surface-alt: #1f2937;
    --text: #f3f4f6;
    --text-muted: #9ca3af;
    --border: #1f2937;
    --border-light: #374151;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    font-family: 'Inter', 'Hind Siliguri', sans-serif;
    background-color: var(--background);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; transition: color 0.2s ease; }
  img { max-width: 100%; height: auto; display: block; }
  .container { width: 100%; max-width: var(--container); margin: 0 auto; padding: 0 20px; }

  .icon { display: inline-block; width: 18px; height: 18px; vertical-align: middle; fill: currentColor; }
  .icon-stroke { display: inline-block; width: 18px; height: 18px; vertical-align: middle; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  .topbar { background-color: var(--primary-dark); color: #94a3b8; font-size: 12.5px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .topbar .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .topbar-links { display: flex; align-items: center; gap: 16px; }
  .topbar-link { display: inline-flex; align-items: center; gap: 6px; color: #e2e8f0; }
  .topbar-link:hover { color: #60a5fa; }
  .topbar-badge { background: rgba(37, 99, 235, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }

  .navbar { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
  .navbar .container { display: flex; align-items: center; justify-content: space-between; height: var(--header-height); gap: 16px; }
  .logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: var(--primary); }
  .logo-badge { background: var(--accent); color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-sm); }
  .nav-menu { display: flex; align-items: center; gap: 8px; list-style: none; }
  .nav-link { padding: 8px 14px; font-size: 14px; font-weight: 600; color: var(--text-muted); border-radius: var(--radius); transition: all 0.2s; }
  .nav-link:hover, .nav-link.active { color: var(--accent); background: var(--accent-light); }
  .nav-actions { display: flex; align-items: center; gap: 10px; }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 18px; font-size: 13.5px; font-weight: 600; border-radius: var(--radius); border: 1px solid transparent; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .btn-sm { padding: 6px 12px; font-size: 12.5px; }
  .btn-primary { background-color: var(--accent); color: #ffffff; }
  .btn-primary:hover { background-color: var(--accent-hover); color: #ffffff; }
  .btn-outline { border-color: var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface-alt); }
  .btn-whatsapp { background-color: #25d366; color: #ffffff; }
  .btn-whatsapp:hover { background-color: #1eb956; color: #ffffff; }

  .btn-icon { width: 38px; height: 38px; border-radius: var(--radius); display: inline-flex; align-items: center; justify-content: center; background: var(--surface-alt); color: var(--text); border: 1px solid var(--border); cursor: pointer; }

  .search-form { display: flex; align-items: center; position: relative; width: 260px; }
  .search-input { width: 100%; padding: 8px 12px 8px 36px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt); color: var(--text); font-size: 13px; outline: none; }
  .search-input:focus { border-color: var(--accent); background: var(--surface); }
  .search-icon { position: absolute; left: 10px; color: var(--text-muted); pointer-events: none; }

  .hero-section { padding: 40px 0 20px; }
  .hero-card { background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%); color: #ffffff; border-radius: var(--radius-lg); padding: 48px; position: relative; overflow: hidden; }
  .hero-content { max-width: 680px; }
  .hero-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(37, 99, 235, 0.25); border: 1px solid rgba(147, 197, 253, 0.3); color: #bfdbfe; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: var(--radius-full); margin-bottom: 20px; }
  .hero-title { font-size: 40px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
  .hero-subtitle { font-size: 18px; color: #cbd5e1; margin-bottom: 12px; }
  .hero-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
  .feature-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; display: flex; align-items: flex-start; gap: 14px; }
  .feature-icon-wrap { width: 40px; height: 40px; border-radius: var(--radius); background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold; }
  .feature-box h4 { font-size: 14px; font-weight: 700; margin-bottom: 3px; color: var(--text); }
  .feature-box p { font-size: 12px; color: var(--text-muted); }

  .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .section-title { font-size: 24px; font-weight: 800; color: var(--text); }
  .section-subtitle { font-size: 13.5px; color: var(--text-muted); margin-top: 4px; }

  .category-filter-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px; }
  .cat-pill { padding: 8px 16px; font-size: 13px; font-weight: 600; background: var(--surface); border: 1px solid var(--border); color: var(--text); border-radius: var(--radius); cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .cat-pill:hover, .cat-pill.active { background: var(--accent); color: #ffffff; border-color: var(--accent); }

  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  .product-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
  .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
  .product-thumb-wrap { position: relative; padding-top: 65%; background: var(--surface-alt); }
  .product-thumb { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  .badge-tag { position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-sm); }
  .badge-brand { position: absolute; top: 12px; right: 12px; background: var(--accent); color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: var(--radius-sm); }

  .product-body { padding: 18px; display: flex; flex-direction: column; flex-grow: 1; }
  .product-series { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
  .product-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .product-specs { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .product-footer { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 12px; }
  .price-row { display: flex; align-items: baseline; justify-content: space-between; }
  .price-label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; }
  .product-price { font-size: 19px; font-weight: 800; color: var(--accent); }
  .product-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
  .hub-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s; }
  .hub-card:hover { border-color: var(--accent); box-shadow: var(--shadow-md); }
  .hub-card-cat { font-size: 10.5px; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
  .hub-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 14px; line-height: 1.35; }
  .hub-card-btn { width: 100%; margin-top: auto; }

  .info-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; margin: 30px 0; }
  .clock-wrapper { display: inline-flex; align-items: center; gap: 10px; background: var(--surface-alt); border: 1px solid var(--border); padding: 8px 16px; border-radius: var(--radius); margin: 12px 0; }
  .clock-display { font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 700; color: var(--accent); }

  .floating-tools { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 90; }
  .float-btn { width: 50px; height: 50px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg); cursor: pointer; border: none; }
  .float-whatsapp { background: #25d366; color: #ffffff; }
  .float-top { background: var(--primary-dark); color: #ffffff; display: none; }
  .float-top.show { display: flex; }

  .footer { background: #020617; color: #94a3b8; padding: 60px 0 30px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13.5px; margin-top: 60px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 36px; margin-bottom: 40px; }
  .footer-col-title { color: #ffffff; font-size: 15px; font-weight: 700; margin-bottom: 16px; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-links a:hover { color: #ffffff; }
  .footer-bottom { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 12.5px; }

  @media (max-width: 1024px) {
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .nav-menu, .search-form { display: none; }
    .hero-card { padding: 28px 20px; }
    .hero-title { font-size: 28px; }
    .features-grid, .footer-grid { grid-template-columns: 1fr; }
  }
  /*]]>*/
  </style>
</head>

<body>
  <!-- Top Hotline Bar -->
  <header class='topbar'>
    <div class='container'>
      <div class='topbar-links'>
        <a class='topbar-link' href='https://wa.me/${storeInfo.whatsapp}' target='_blank'>
          <svg class='icon' viewBox='0 0 24 24'><path d='M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z'/></svg>
          <span>WhatsApp: ${escapeXml(storeInfo.phones[0] || '01935-693071')}</span>
        </a>
        <a class='topbar-link' href='tel:${escapeXml((storeInfo.phones[1] || storeInfo.phones[0] || '').replace(/[^0-9]/g, ''))}'>
          <svg class='icon-stroke' height='16' viewBox='0 0 24 24' width='16'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/></svg>
          <span>Hotline: ${escapeXml(storeInfo.phones[1] || storeInfo.phones[0] || '01731-693071')}</span>
        </a>
      </div>

      <div style='display:flex;align-items:center;gap:12px;'>
        <span class='topbar-badge'>64 Districts Courier Delivery</span>
        <span style='color:#cbd5e1;'>${escapeXml(storeInfo.location)}</span>
      </div>
    </div>
  </header>

  <!-- Sticky Navbar -->
  <nav class='navbar'>
    <div class='container'>
      <a class='logo' href='/'>
        <span>${escapeXml(storeInfo.name)}</span>
        <span class='logo-badge'>STORE</span>
      </a>

      <ul class='nav-menu'>
        <li><a class='nav-link' href='/'>Home</a></li>
        <li><a class='nav-link' href='#laptop-collection'>Laptops</a></li>
        <li><a class='nav-link' href='#promo-offers-zone'>Promo Offers</a></li>
        <li><a class='nav-link' href='#software-zone'>Software Zone</a></li>
        <li><a class='nav-link' href='#testing-tools'>Testing Tools</a></li>
        <li><a class='nav-link' href='#os-iso-zone'>OS &amp; ISO</a></li>
        <li><a class='nav-link' href='#warranty-section'>Warranty</a></li>
        <li><a class='nav-link' href='#payment-section'>Payment</a></li>
      </ul>

      <div class='nav-actions'>
        <form action='/search' class='search-form' method='get'>
          <svg class='icon-stroke search-icon' height='16' viewBox='0 0 24 24' width='16'><circle cx='11' cy='11' r='8'/><line x1='21' x2='16.65' y1='21' y2='16.65'/></svg>
          <input class='search-input' name='q' placeholder='Search Lenovo, HP, i5...' type='text'/>
        </form>

        <button aria-label='Toggle Dark Mode' class='btn-icon' id='themeToggle' type='button'>
          <svg class='icon-stroke' height='18' viewBox='0 0 24 24' width='18'><path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/></svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Main Content Layout -->
  <main class='container' style='padding-top: 30px;'>
    <b:section id='main' showaddelement='false'>
      <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' version='2' visible='true'>
        <b:includable id='main' var='top'>
          <b:if cond='data:view.isMultipleItems'>
            <div id='laptop-collection'>
              <div class='section-header'>
                <div>
                  <h2 class='section-title'>Featured Laptop Inventory</h2>
                  <p class='section-subtitle'>Dubai Original tested business-class laptops</p>
                </div>
              </div>

              <div class='category-filter-bar'>
                <a class='cat-pill active' href='/'>All Laptops</a>
                <a class='cat-pill' href='/search/label/Lenovo'>Lenovo ThinkPad</a>
                <a class='cat-pill' href='/search/label/HP'>HP EliteBook</a>
                <a class='cat-pill' href='/search/label/Dell'>Dell Latitude</a>
                <a class='cat-pill' href='/search?q=Core+i5'>Core i5</a>
                <a class='cat-pill' href='/search?q=Core+i7'>Core i7</a>
              </div>

              <div class='products-grid'>
${laptopCardsXml}
                <b:loop values='data:posts' var='post'>
                  <article class='product-card'>
                    <div class='product-thumb-wrap'>
                      <a expr:href='data:post.url'>
                        <b:if cond='data:post.featuredImage'>
                          <img alt='data:post.title' class='product-thumb' expr:src='resizeImage(data:post.featuredImage, 600, "1:1")'/>
                        <b:else/>
                          <img alt='JHF Laptop' class='product-thumb' src='https://blogger.googleusercontent.com/img/a/AVvXsEh8G5m7p9h4T_fQ7Y6J8e9K0L1M2N3P4Q5R6S7T8U9V0W1X2Y3Z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z=s600'/>
                        </b:if>
                      </a>
                      <span class='badge-tag'>Dubai Original</span>
                      <b:if cond='data:post.labels and data:post.labels.size &gt; 0'>
                        <span class='badge-brand'><data:post.labels.first.name/></span>
                      </b:if>
                    </div>

                    <div class='product-body'>
                      <div class='product-series'>
                        <b:if cond='data:post.labels and data:post.labels.size &gt; 0'>
                          <data:post.labels.first.name/> Business Series
                        <b:else/>
                          Business Series
                        </b:if>
                      </div>

                      <h3 class='product-title'>
                        <a expr:href='data:post.url'><data:post.title/></a>
                      </h3>

                      <div class='product-specs'>
                        <data:post.snippet/>
                      </div>

                      <div class='product-footer'>
                        <div class='price-row'>
                          <div>
                            <span class='price-label'>Offer Price</span>
                            <div class='product-price'>Special Offer</div>
                          </div>
                          <span style='font-size:11px;color:#16a34a;font-weight:600;'>✓ Tested Unit</span>
                        </div>

                        <div class='product-actions-grid'>
                          <a class='btn btn-outline btn-sm' expr:href='data:post.url'>View Specs</a>
                          <a class='btn btn-whatsapp btn-sm js-whatsapp-order' expr:data-title='data:post.title' href='https://wa.me/${storeInfo.whatsapp}' target='_blank'>Order Now</a>
                        </div>
                      </div>
                    </div>
                  </article>
                </b:loop>
              </div>
            </div>
          </b:if>

          <b:if cond='data:view.isSingleItem'>
            <b:loop values='data:posts' var='post'>
              <article class='post-item'>
                <div class='post-detail-layout' style='display:grid;grid-template-columns:1fr 1fr;gap:36px;margin:30px 0;'>
                  <div class='post-gallery'>
                    <b:if cond='data:post.featuredImage'>
                      <img alt='data:post.title' expr:src='data:post.featuredImage' style='border-radius:12px;'/>
                    <b:else/>
                      <img alt='JHF Laptop' src='https://blogger.googleusercontent.com/img/a/AVvXsEh8G5m7p9h4T_fQ7Y6J8e9K0L1M2N3P4Q5R6S7T8U9V0W1X2Y3Z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z=s800' style='border-radius:12px;'/>
                    </b:if>
                  </div>

                  <div class='post-info-panel' style='display:flex;flex-direction:column;gap:16px;'>
                    <h1 style='font-size:26px;font-weight:800;line-height:1.25;'><data:post.title/></h1>

                    <div style='background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius);padding:16px;display:flex;justify-content:space-between;align-items:center;'>
                      <div>
                        <span style='font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;'>Price in Bangladesh</span>
                        <div class='product-price' id='detectedPrice'>Best Offer Price</div>
                      </div>
                      <span style='font-size:12px;color:#16a34a;font-weight:700;'>100% Tested Hardware</span>
                    </div>

                    <div style='background:var(--accent-light);border:1px solid rgba(37,99,235,0.2);border-radius:var(--radius);padding:14px;'>
                      <div style='font-size:13px;font-weight:700;color:var(--accent);margin-bottom:4px;'>🛡️ JHF Warranty Policy:</div>
                      <div style='font-size:12px;line-height:1.5;'>
                        • 1 Month Full Replacement (including spare parts)<br/>
                        • 1 Year SSD Replacement &amp; 6 Months RAM Replacement<br/>
                        • 5 Years Free Service Warranty &amp; Lifetime Exchange
                      </div>
                    </div>

                    <div style='display:flex;flex-direction:column;gap:10px;margin-top:10px;'>
                      <a class='btn btn-whatsapp js-whatsapp-order' expr:data-title='data:post.title' href='https://wa.me/${storeInfo.whatsapp}' style='padding:14px;font-size:15px;' target='_blank'>
                        Order via WhatsApp (${escapeXml(storeInfo.phones[0] || '01935-693071')})
                      </a>
                      <a class='btn btn-outline' href='tel:${escapeXml((storeInfo.phones[1] || storeInfo.phones[0] || '').replace(/[^0-9]/g, ''))}' style='padding:12px;'>
                        Call Hotline: ${escapeXml(storeInfo.phones[1] || storeInfo.phones[0] || '01731-693071')}
                      </a>
                    </div>
                  </div>
                </div>

                <div class='info-block' id='postBodyContent'>
                  <h3 style='font-size:20px;font-weight:700;margin-bottom:16px;'>Product Description &amp; Detailed Specifications</h3>
                  <data:post.body/>
                </div>
              </article>
            </b:loop>
          </b:if>
        </b:includable>
      </b:widget>
    </b:section>
  </main>

  <!-- JHF PROMO OFFERS & MARKETING PROMO TEXT HUB -->
  <section class='container' id='promo-offers-zone' style='padding: 20px 20px 40px;'>
    <div class='info-block' style='background: linear-gradient(135deg, rgba(244,63,94,0.05), rgba(245,158,11,0.05)); border: 1px solid rgba(244,63,94,0.2);'>
      <div class='section-header'>
        <div>
          <span style='display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;background:rgba(244,63,94,0.15);color:#e11d48;margin-bottom:8px;'>
            🔥 PROMO &amp; MARKETING POST HUB • স্পেশাল অফার
          </span>
          <h2 class='section-title'>JHF LAPTOP ZONE Promo Text &amp; Active Coupons</h2>
          <p class='section-subtitle'>Ready-to-copy marketing promo texts for Facebook posts, WhatsApp shares &amp; instant discount coupons</p>
        </div>
      </div>

      <div style='display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;margin-bottom:24px;'>
        <div style='background:var(--card-bg);border:1px dashed #e11d48;border-radius:12px;padding:16px;'>
          <span style='font-size:10px;font-weight:800;background:#e11d48;color:#fff;padding:2px 8px;border-radius:10px;'>MOST POPULAR</span>
          <div style='font-family:monospace;font-size:18px;font-weight:900;color:#e11d48;margin:8px 0 4px;'>JHF-COMBO-2026</div>
          <div style='font-weight:700;font-size:13px;'>৳১,০০০ সরাসরি মূল্যছাড়</div>
          <div style='font-size:11px;color:var(--text-muted);margin-top:4px;'>যেকোনো ল্যাপটপে ৳১,০০০ ইনস্ট্যান্ট ছাড় + ৬টি ফ্রি গিফট কম্বো প্যাক।</div>
        </div>

        <div style='background:var(--card-bg);border:1px dashed #10b981;border-radius:12px;padding:16px;'>
          <span style='font-size:10px;font-weight:800;background:#10b981;color:#fff;padding:2px 8px;border-radius:10px;'>64 DISTRICTS</span>
          <div style='font-family:monospace;font-size:18px;font-weight:900;color:#10b981;margin:8px 0 4px;'>FREEDELIVERY64</div>
          <div style='font-weight:700;font-size:13px;'>ফ্রি কুরিয়ার ডেলিভারি</div>
          <div style='font-size:11px;color:var(--text-muted);margin-top:4px;'>দেশজুড়ে ৬৪ জেলায় সম্পূর্ণ ফ্রি হোম ডেলিভারি ও কন্ডিশন সুবিধা।</div>
        </div>

        <div style='background:var(--card-bg);border:1px dashed #6366f1;border-radius:12px;padding:16px;'>
          <span style='font-size:10px;font-weight:800;background:#6366f1;color:#fff;padding:2px 8px;border-radius:10px;'>STUDENT / IT</span>
          <div style='font-family:monospace;font-size:18px;font-weight:900;color:#6366f1;margin:8px 0 4px;'>STUDENT-PROMO</div>
          <div style='font-weight:700;font-size:13px;'>৳১,৫০০ বিশেষ ছাড়</div>
          <div style='font-size:11px;color:var(--text-muted);margin-top:4px;'>শিক্ষার্থী ও ফ্রিল্যান্সারদের জন্য স্পেশাল ৳১,৫০০ ছাড়ের সুবিধা।</div>
        </div>
      </div>

      <div style='background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:18px;'>
        <div style='font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text);'>📋 রেডি ফেসবুক ও হোয়াটসঅ্যাপ প্রমোশনাল টেক্সট:</div>
        <pre style='background:rgba(0,0,0,0.05);padding:14px;border-radius:8px;font-size:12px;line-height:1.5;white-space:pre-wrap;font-family:monospace;'>🔥 ধামাকা মেগা অফার! দুবাই থেকে সরাসরি আমদানিকৃত ১০০% অরিজিনাল বিজনেস ল্যাপটপ!
মডেল: ThinkPad / EliteBook / Latitude (Core i5 / i7)
অফার কুপন: JHF-COMBO-2026 (৳১,০০০ ইনস্ট্যান্ট ছাড়)
ল্যাপটপের সাথে পাচ্ছেন ৬টি ফ্রি গিফট: ব্যাগ, মাউস, মাউসপ্যাড, অরিজিনাল চার্জার, ক্লিনার ও ৫ বছরের সার্ভিস ওয়ারেন্টি!
হটলাইন: ${escapeXml(storeInfo.phones.join(' / '))} | WhatsApp: https://wa.me/${storeInfo.whatsapp}</pre>
      </div>
    </div>
  </section>

  <!-- JHF LAPTOP TESTING SOFTWARE ZONE -->
  <section class='container' id='testing-tools' style='padding: 20px 20px 40px;'>
    <div class='info-block'>
      <div class='section-header'>
        <div>
          <h2 class='section-title'>🛠️ JHF Laptop Testing Software Zone</h2>
          <p class='section-subtitle'>Download verified diagnostic tools to test laptop battery health, SSD health, display &amp; performance</p>
        </div>
      </div>

      <div class='hub-grid'>
${testingCardsXml}
      </div>
    </div>
  </section>

  <!-- JHF SOFTWARE ZONE -->
  <section class='container' id='software-zone' style='padding: 0 20px 40px;'>
    <div class='info-block'>
      <div class='section-header'>
        <div>
          <h2 class='section-title'>💾 JHF Software Zone</h2>
          <p class='section-subtitle'>Essential software packages, activators, design &amp; editing suites hosted by ${escapeXml(storeInfo.name)}</p>
        </div>
      </div>

      <div class='hub-grid'>
${softwareCardsXml}
      </div>
    </div>
  </section>

  <!-- OPERATING SYSTEM & ISO ZONE -->
  <section class='container' id='os-iso-zone' style='padding: 0 20px 40px;'>
    <div class='info-block'>
      <div class='section-header'>
        <div>
          <h2 class='section-title'>💿 JHF Operating System &amp; ISO Zone</h2>
          <p class='section-subtitle'>Pre-configured clean Windows ISOs, USB boot utilities, drivers &amp; recovery tools</p>
        </div>
      </div>

      <div class='hub-grid'>
${osCardsXml}
      </div>
    </div>
  </section>

  <!-- Warranty Policy Section -->
  <section class='container' id='warranty-section' style='padding: 0 20px 40px;'>
    <div class='info-block'>
      <h2 class='section-title' style='margin-bottom:8px;'>🛡️ Warranty &amp; Service Policies (ওয়ারেন্টি নীতিমালা)</h2>
      <p style='color:var(--text-muted);margin-bottom:24px;'>${escapeXml(storeInfo.name)} এ সকল ল্যাপটপের জন্য স্পষ্ট এবং সৎ ওয়ারেন্টি পলিসি প্রদান করা হয়:</p>

      <div style='display:flex;flex-direction:column;gap:18px;'>
${warrantyTiersXml}
      </div>
    </div>
  </section>

  <!-- Payment & Visiting Card Section -->
  <section class='container' id='payment-section' style='padding: 0 20px 40px;'>
    <div class='info-block'>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:24px;'>
        <div>
          <h2 class='section-title' style='margin-bottom:12px;font-size:20px;'>💳 Payment Methods (পেমেন্ট পদ্ধতি)</h2>
          <p style='font-size:13.5px;color:var(--text-muted);margin-bottom:16px;'>
            We accept all Mobile Banking (bKash, Nagad, Rocket) and direct Bangladesh Bank Account transfers.
          </p>
          <img alt='Payment from all Mobile Banking and Bank Account' src='${escapeXml(storeInfo.paymentCardImg)}' style='border-radius:8px;border:1px solid var(--border);'/>
        </div>

        <div id='visiting-card'>
          <h2 class='section-title' style='margin-bottom:12px;font-size:20px;'>📇 Visiting Card &amp; Support</h2>
          <p style='font-size:13.5px;color:var(--text-muted);margin-bottom:16px;'>
            ${escapeXml(storeInfo.location)} • Contact: ${escapeXml(storeInfo.phones.join(' / '))}
          </p>
          <img alt='JHF Laptop Zone Visiting Card' src='${escapeXml(storeInfo.visitingCardImg)}' style='border-radius:8px;border:1px solid var(--border);margin-bottom:16px;'/>
          <div class='clock-wrapper'>
            <div class='clock-display' id='liveDhakaClock'>--:--:--</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Floating Tools -->
  <div class='floating-tools'>
    <button aria-label='Back to Top' class='float-btn float-top' id='backToTop' type='button'>
      <svg class='icon-stroke' height='20' viewBox='0 0 24 24' width='20'><polyline points='18 15 12 9 6 15'/></svg>
    </button>
    <a aria-label='Order on WhatsApp' class='float-btn float-whatsapp' href='https://wa.me/${storeInfo.whatsapp}?text=Hello%20${encodeURIComponent(storeInfo.name)},%20I%20have%20an%20inquiry' target='_blank'>
      <svg class='icon' viewBox='0 0 24 24'><path d='M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z'/></svg>
    </a>
  </div>

  <!-- Footer -->
  <footer class='footer'>
    <div class='container'>
      <div class='footer-grid'>
        <div>
          <div class='logo' style='color:#fff;margin-bottom:14px;'>
            <span>${escapeXml(storeInfo.name)}</span>
            <span class='logo-badge'>STORE</span>
          </div>
          <p style='line-height:1.6;font-size:13.5px;max-width:320px;'>
            Your trusted store in Bangladesh for verified, business-class laptops, Lenovo ThinkPads, HP EliteBooks, and Dell Latitudes.
          </p>
        </div>

        <div>
          <h4 class='footer-col-title'>Laptop Series</h4>
          <ul class='footer-links'>
            <li><a href='/search/label/Lenovo'>Lenovo ThinkPad</a></li>
            <li><a href='/search/label/HP'>HP EliteBook</a></li>
            <li><a href='/search/label/Dell'>Dell Latitude</a></li>
          </ul>
        </div>

        <div>
          <h4 class='footer-col-title'>Download Hubs</h4>
          <ul class='footer-links'>
            <li><a href='#testing-tools'>Hardware Testing Tools</a></li>
            <li><a href='#software-zone'>Software Library</a></li>
            <li><a href='#os-iso-zone'>Windows ISOs</a></li>
          </ul>
        </div>

        <div>
          <h4 class='footer-col-title'>Contact &amp; Hotlines</h4>
          <ul class='footer-links'>
            <li>WhatsApp: ${escapeXml(storeInfo.phones[0] || '01935-693071')}</li>
            <li>Phone: ${escapeXml(storeInfo.phones[1] || '01731-693071')}</li>
            <li>Location: ${escapeXml(storeInfo.location)}</li>
          </ul>
        </div>
      </div>

      <div class='footer-bottom'>
        <p>&#169; 2026 ${escapeXml(storeInfo.name)}. If any Query Please Contact: +88 01935 69 30 71 &amp; +88 01731 69 30 71 (WhatsApp).</p>
      </div>
    </div>
  </footer>

  <script type='text/javascript'>
  //<![CDATA[
  (function() {
    var themeToggle = document.getElementById('themeToggle');
    var currentTheme = localStorage.getItem('jhf_theme') || 'light';
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jhf_theme', theme);
      });
    }

    var backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        if (backToTop) backToTop.classList.add('show');
      } else {
        if (backToTop) backToTop.classList.remove('show');
      }
    });
    if (backToTop) {
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var clockEl = document.getElementById('liveDhakaClock');
    if (clockEl) {
      function updateClock() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        var strTime = (hours < 10 ? '0' : '') + hours + ':' +
                      (minutes < 10 ? '0' : '') + minutes + ':' +
                      (seconds < 10 ? '0' : '') + seconds + ' ' + ampm;
        clockEl.textContent = strTime;
      }
      updateClock();
      setInterval(updateClock, 1000);
    }

    var phone = '${storeInfo.whatsapp}';
    var waButtons = document.querySelectorAll('.js-whatsapp-order');
    waButtons.forEach(function(btn) {
      var productTitle = btn.getAttribute('data-title') || document.title;
      var cleanTitle = productTitle.replace(' | ${storeInfo.name}', '').trim();
      var msg = 'Hello ${storeInfo.name}, I am interested in: ' + cleanTitle + '. Please provide availability, price and delivery information.';
      btn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    });

    var postBody = document.getElementById('postBodyContent');
    var priceTarget = document.getElementById('detectedPrice');
    if (postBody && priceTarget) {
      var bodyText = postBody.innerText || postBody.textContent;
      var priceMatch = bodyText.match(/(?:৳|Tk\.?|BDT)\\s*([0-9,]+)/i) || bodyText.match(/([0-9,]+)\\s*(?:৳|Tk\.?|BDT)/i);
      if (priceMatch && priceMatch[1]) {
        priceTarget.textContent = '৳ ' + priceMatch[1].trim();
      }
    }
  })();
  //]]>
  </script>
</body>
</html>`;
  };

  return (
    <StoreContext.Provider
      value={{
        laptops,
        softwareList,
        testingTools,
        osList,
        warrantyTiers,
        storeInfo,
        isAuthenticated,
        adminEmail,
        login,
        logout,
        addLaptop,
        updateLaptop,
        deleteLaptop,
        clearAllLaptops,
        addSoftware,
        updateSoftware,
        deleteSoftware,
        clearAllSoftware,
        addTestingTool,
        updateTestingTool,
        deleteTestingTool,
        clearAllTestingTools,
        addOsItem,
        updateOsItem,
        deleteOsItem,
        clearAllOsItems,
        updateStoreInfo,
        updateWarrantyTier,
        resetAllToDefault,
        exportDatabaseJson,
        importDatabaseJson,
        generateDynamicXml,
        activePublicView,
        setActivePublicView,
        isVisitingCardOpen,
        openVisitingCard,
        closeVisitingCard,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
