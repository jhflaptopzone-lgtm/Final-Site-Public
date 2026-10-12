import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminAuthProvider } from './admin/authContext';
import { AdminStoreProvider } from './admin/adminStore';
import { CustomerProvider } from './context/CustomerContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminPanel as EnterpriseAdminPanel } from './admin/AdminPanel';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LaptopCatalog } from './components/LaptopCatalog';
import { ReconditionZoneCustomerView } from './components/ReconditionZoneCustomerView';
import { PromoSection } from './components/PromoSection';
import { SoftwareZone } from './components/SoftwareZone';
import { TestingToolsZone } from './components/TestingToolsZone';
import { OperatingSystemZone } from './components/OperatingSystemZone';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { WarrantyZone } from './components/WarrantyZone';
import { PaymentAndVisitingCardZone } from './components/PaymentAndVisitingCardZone';
import { XmlTemplateViewer } from './components/XmlTemplateViewer';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { ToastNotificationStack } from './components/ToastNotificationStack';
import { LaptopDetailModal } from './components/LaptopDetailModal';
import { CustomerOrderModal, OrderItemData } from './components/CustomerOrderModal';
import { MessageSquare, PhoneCall, Copy, Check, ArrowUp, Sparkles, FolderGit2, Settings } from 'lucide-react';

function AppContent() {
  const { storeInfo, isAuthenticated, generateDynamicXml } = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'xml' | 'admin'>('preview');
  const [xmlContent, setXmlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // States for modals triggered by global components (e.g. AI Assistant or Promo Hub)
  const [aiSelectedLaptop, setAiSelectedLaptop] = useState<any>(null);
  const [aiOrderingLaptop, setAiOrderingLaptop] = useState<OrderItemData | null>(null);
  const [activePromoCode, setActivePromoCode] = useState<string>('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<'privacy' | 'cookies' | 'data' | 'terms'>('privacy');

  const handleOrderWithPromo = (laptop: any, promoCode: string) => {
    setActivePromoCode(promoCode);
    setAiOrderingLaptop({
      id: laptop.id,
      title: laptop.title,
      brand: laptop.brand,
      code: laptop.code || laptop.sku || 'JHF-LP',
      price: laptop.numericPrice || laptop.price,
      image: laptop.image,
      specs: laptop.specs,
    });
  };

  useEffect(() => {
    // Generate dynamic XML based on store state
    const dynamicXml = generateDynamicXml();
    setXmlContent(dynamicXml);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [generateDynamicXml]);

  const handleCopyXml = () => {
    const currentXml = generateDynamicXml();
    navigator.clipboard.writeText(currentXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenAdminLogin = () => {
    setActiveView('admin');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {activeView === 'admin' ? (
        /* Full-Control Enterprise Administration System */
        <EnterpriseAdminPanel onSwitchToWebsite={() => setActiveView('preview')} />
      ) : (
        <>
          {/* Public Store Navigation */}
          <Navbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            activeView={activeView}
            setActiveView={setActiveView}
            onCopyXml={handleCopyXml}
            copied={copied}
            onOpenAdminLogin={handleOpenAdminLogin}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
            {activeView === 'xml' ? (
              /* XML Code Viewer Mode */
              <XmlTemplateViewer xmlContent={generateDynamicXml()} />
            ) : (
              /* Live Interactive Website Preview */
              <>
                {/* Hero & Trust Badges */}
                <HeroSection />

                {/* 1. Laptop Catalog with Specs Modal & Ordering */}
                <LaptopCatalog />

                {/* 1.1 JHF Recondition Zone (Pre-Owned / Used Laptops Catalog) */}
                <ReconditionZoneCustomerView />

                {/* 1.2 JHF Promo Offers & Marketing Promo Text Zone */}
                <PromoSection onOrderWithPromo={handleOrderWithPromo} />

                {/* 2. JHF Software Zone */}
                <SoftwareZone />

                {/* 3. JHF Laptop Testing Software Zone */}
                <TestingToolsZone />

                {/* 4. JHF Operating System Zone */}
                <OperatingSystemZone />

                {/* 5. JHF Customer Reviews & Ratings */}
                <CustomerReviewsSection />

                {/* 6. JHF Warranty Policies (3-Tiers) */}
                <WarrantyZone />

                {/* 7. Payment & Visiting Card */}
                <PaymentAndVisitingCardZone />
              </>
            )}
          </main>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg flex items-center justify-center transition"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}

            <a
              href={`https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
                'Hello JHF LAPTOP ZONE! I have an inquiry about a laptop / software / warranty.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-full shadow-xl flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
              aria-label="Chat on WhatsApp"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">WhatsApp Us</span>
            </a>
          </div>

          {/* Footer */}
          <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 border-t border-slate-800 text-xs">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              
              <div>
                <div className="font-extrabold text-white text-base mb-3 flex items-center gap-2">
                  <span>{storeInfo.name}</span>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    STORE
                  </span>
                </div>
                <p className="leading-relaxed text-slate-400 mb-4">
                  Your trusted shop in Bangladesh for verified used business laptops, Lenovo ThinkPads, HP EliteBooks, and Dell Latitudes with honest warranty terms.
                </p>
                <div className="text-slate-300 font-semibold">
                  {storeInfo.location} • {storeInfo.delivery}
                </div>
              </div>

              <div>
                <div className="font-bold text-white mb-3">Shop Categories</div>
                <ul className="space-y-2">
                  <li><a href="#laptops-catalog" onClick={() => setActiveView('preview')} className="hover:text-white transition">Lenovo ThinkPad Series</a></li>
                  <li><a href="#laptops-catalog" onClick={() => setActiveView('preview')} className="hover:text-white transition">HP EliteBook Series</a></li>
                  <li><a href="#laptops-catalog" onClick={() => setActiveView('preview')} className="hover:text-white transition">Dell Latitude Series</a></li>
                  <li><a href="#laptops-catalog" onClick={() => setActiveView('preview')} className="hover:text-white transition">Core i5 &amp; Core i7 Laptops</a></li>
                  <li><a href={storeInfo.galleryFolder} target="_blank" rel="noreferrer" className="hover:text-white transition">Photo Gallery Folder</a></li>
                </ul>
              </div>

              <div>
                <div className="font-bold text-white mb-3">Download Hubs &amp; Tools</div>
                <ul className="space-y-2">
                  <li><a href="#software-zone" onClick={() => setActiveView('preview')} className="hover:text-white transition">JHF Software Zone</a></li>
                  <li><a href="#testing-zone" onClick={() => setActiveView('preview')} className="hover:text-white transition">JHF Laptop Testing Tools</a></li>
                  <li><a href="#os-zone" onClick={() => setActiveView('preview')} className="hover:text-white transition">JHF Operating System Zone</a></li>
                  <li><a href="#customer-reviews-section" onClick={() => setActiveView('preview')} className="hover:text-white transition">Customer Reviews &amp; Ratings</a></li>
                  <li><a href="#warranty-zone" onClick={() => setActiveView('preview')} className="hover:text-white transition">Warranty &amp; Service Policy</a></li>
                  <li><a href="#payment-section" onClick={() => setActiveView('preview')} className="hover:text-white transition">Payment Methods &amp; QR</a></li>
                </ul>

                <div className="font-bold text-white mt-5 mb-2">Privacy &amp; Governance</div>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  <li>
                    <button
                      onClick={() => {
                        setPrivacyTab('privacy');
                        setPrivacyModalOpen(true);
                      }}
                      className="hover:text-blue-400 transition text-left"
                    >
                      Privacy Policy &amp; Data Rights
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setPrivacyTab('cookies');
                        setPrivacyModalOpen(true);
                      }}
                      className="hover:text-blue-400 transition text-left"
                    >
                      Cookie &amp; Tracking Notice
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setPrivacyTab('data');
                        setPrivacyModalOpen(true);
                      }}
                      className="hover:text-blue-400 transition text-left"
                    >
                      Download &amp; Security Data
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setPrivacyTab('terms');
                        setPrivacyModalOpen(true);
                      }}
                      className="hover:text-blue-400 transition text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-bold text-white mb-3">Offices &amp; Contact</div>
                <div className="space-y-2 text-xs mb-4">
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-blue-400">Main Office:</span>
                    <span className="text-slate-300 leading-tight">Sonali Trade, Shop No : 1001 &amp; 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-emerald-400">Branch Office:</span>
                    <span className="text-slate-300">Baroipara Bazar, Chandra, Gazipur</span>
                  </div>
                  <div className="pt-1 text-slate-300 space-y-0.5">
                    <div>Mobile: <strong className="text-white">01935-693071 , 01731-693071</strong></div>
                    <div>Email: <a href="mailto:jhflaptopzone@gmail.com" className="text-amber-400 hover:underline">jhflaptopzone@gmail.com</a></div>
                    <div>Facebook: <a href="https://www.facebook.com/jhflaptopzone" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">fb.com/jhflaptopzone</a></div>
                    <div>Web: <a href="https://www.jhflaptopzone.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">www.jhflaptopzone.com</a></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleOpenAdminLogin}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition text-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Enterprise Admin Panel</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-slate-500 text-xs">
              © 2026 JHF Laptop Zone (www.jhflaptopzone.com) • Best Laptop Buy , Sell &amp; Accessories Importer, Traders &amp; Suppliers • Mobile: 01935-693071, 01731-693071.
            </div>
          </footer>

          {/* Global Interactive Customer Modals & Feedback Stack */}
          <ToastNotificationStack />
          <TrackOrderModal />
          <AiAssistantModal
            onOpenOrderModal={(lp) => {
              setAiOrderingLaptop({
                id: lp.id,
                title: lp.title || lp.name,
                brand: lp.brand || 'Laptop',
                code: lp.sku || 'JHF-LP',
                price: lp.numericPrice || lp.price || (lp.offerPrice || lp.sellPrice),
                image: lp.image || lp.images?.[0],
                specs: lp.specs || `${lp.processor || ''} • ${lp.ram || ''} • ${lp.storage || ''}`,
              });
            }}
            onOpenSpecsModal={(lp) => setAiSelectedLaptop(lp)}
          />

          {/* Specs modal for laptop opened via AI Assistant */}
          <LaptopDetailModal
            laptop={aiSelectedLaptop}
            onClose={() => setAiSelectedLaptop(null)}
            onOrderNow={(lp) => {
              setAiSelectedLaptop(null);
              setAiOrderingLaptop({
                id: lp.id,
                title: lp.title,
                brand: lp.brand,
                code: lp.sku || 'JHF-LP',
                price: lp.numericPrice || lp.price,
                image: lp.image,
                specs: lp.specs,
              });
            }}
          />

          {/* Order modal for laptop opened via AI Assistant or Promo Hub */}
          <CustomerOrderModal
            laptop={aiOrderingLaptop}
            isOpen={!!aiOrderingLaptop}
            onClose={() => {
              setAiOrderingLaptop(null);
              setActivePromoCode('');
            }}
            sourceZone={activePromoCode ? 'Quick Order' : 'Quick Order'}
            initialPromoCode={activePromoCode}
          />

          {/* Privacy, Cookie & Data Governance Modal */}
          <PrivacyCenterModal
            isOpen={privacyModalOpen}
            onClose={() => setPrivacyModalOpen(false)}
            initialTab={privacyTab}
          />
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AdminAuthProvider>
        <AdminStoreProvider>
          <LanguageProvider>
            <CustomerProvider>
              <AppContent />
            </CustomerProvider>
          </LanguageProvider>
        </AdminStoreProvider>
      </AdminAuthProvider>
    </StoreProvider>
  );
}
