import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Package,
  PlusCircle,
  ShoppingCart,
  Boxes,
  Users,
  Shield,
  Download,
  BarChart3,
  Database,
  Server,
  Settings,
  X,
  ArrowRight,
  Terminal,
  Activity,
} from 'lucide-react';
import { AdminModule } from './AdminLayout';

interface CommandItem {
  id: string;
  label: string;
  category: 'Products' | 'Orders' | 'Security' | 'Downloads' | 'Finance' | 'System';
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: AdminModule) => void;
  onOpenCreateProduct?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCreateProduct,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'cmd-dashboard',
      label: 'Open Dashboard',
      category: 'System',
      icon: Terminal,
      shortcut: 'G D',
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'cmd-search-product',
      label: 'Search Product Catalog',
      category: 'Products',
      icon: Package,
      shortcut: 'G P',
      action: () => onNavigate('products'),
    },
    {
      id: 'cmd-create-product',
      label: 'Create New Product',
      category: 'Products',
      icon: PlusCircle,
      shortcut: 'N P',
      action: () => {
        onNavigate('products');
        if (onOpenCreateProduct) onOpenCreateProduct();
      },
    },
    {
      id: 'cmd-view-orders',
      label: 'View Orders',
      category: 'Orders',
      icon: ShoppingCart,
      shortcut: 'G O',
      action: () => onNavigate('orders'),
    },
    {
      id: 'cmd-open-inventory',
      label: 'Open Inventory Management',
      category: 'Products',
      icon: Boxes,
      shortcut: 'G I',
      action: () => onNavigate('inventory'),
    },
    {
      id: 'cmd-search-customer',
      label: 'Search Customer Directory',
      category: 'Orders',
      icon: Users,
      shortcut: 'G C',
      action: () => onNavigate('customers'),
    },
    {
      id: 'cmd-open-security',
      label: 'Open Security Center & SOC',
      category: 'Security',
      icon: Shield,
      shortcut: 'G S',
      action: () => onNavigate('security_center'),
    },
    {
      id: 'cmd-view-downloads',
      label: 'View Download Intelligence',
      category: 'Downloads',
      icon: Download,
      shortcut: 'G W',
      action: () => onNavigate('download_analytics'),
    },
    {
      id: 'cmd-open-analytics',
      label: 'Open Financial Analytics & Reports',
      category: 'Finance',
      icon: BarChart3,
      shortcut: 'G A',
      action: () => onNavigate('analytics'),
    },
    {
      id: 'cmd-backup-db',
      label: 'Backup & Restore Database',
      category: 'System',
      icon: Database,
      shortcut: 'G B',
      action: () => onNavigate('backup'),
    },
    {
      id: 'cmd-hosting-cpanel',
      label: 'Hosting & Server Control Panel (cPanel)',
      category: 'System',
      icon: Server,
      shortcut: 'G H',
      action: () => onNavigate('hosting_panel'),
    },
    {
      id: 'cmd-open-settings',
      label: 'Open Platform Settings',
      category: 'System',
      icon: Settings,
      shortcut: 'G ,',
      action: () => onNavigate('settings'),
    },
  ];

  const filtered = commands.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div
        className="w-full max-w-xl bg-[#0b0f16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(16, 185, 129, 0.1)',
        }}
      >
        {/* Top Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 gap-3 bg-[#080c12]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. Products, Security, Orders)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No matching command found. Try searching &quot;Orders&quot;, &quot;Product&quot;, or &quot;Security&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition font-mono text-xs ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800/80 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="text-[10px] text-slate-500 font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition ${
                        isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-[#080c12] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-emerald-500/80">JHF COMMAND CENTER</span>
        </div>
      </div>
    </div>
  );
};
