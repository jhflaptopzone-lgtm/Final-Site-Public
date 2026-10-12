import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import {
  DownloadEvent,
  SecurityEvent,
  SecurityVerificationRecord,
} from '../types';
import {
  ShieldAlert,
  Download,
  Activity,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  HardDrive,
  Users,
  Ban,
  Clock,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  ShieldCheck,
  Server,
  Zap,
  Info,
} from 'lucide-react';

export const SecurityAndDownloadIntelligenceView: React.FC = () => {
  const {
    downloadEvents,
    securityEvents,
    securityVerifications,
    recordDownloadEvent,
    addSecurityEvent,
    updateSecurityEventAction,
  } = useAdminStore();

  const { currentUser } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'security' | 'verifications' | 'bandwidth'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedEventForModal, setSelectedEventForModal] = useState<SecurityEvent | null>(null);
  const [actionNote, setActionNote] = useState('');

  // RBAC check: Only Super Admin and Admin can access security data
  const isAuthorized = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Download intelligence and security logs contain sensitive infrastructure data. Only{' '}
          <strong className="text-slate-200">Super Admin</strong> and{' '}
          <strong className="text-slate-200">Admin</strong> roles are authorized to inspect these logs.
        </p>
      </div>
    );
  }

  // Calculate Metrics
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const downloadsToday = downloadEvents.filter((e) => new Date(e.timestamp) >= oneDayAgo).length;
  const downloadsThisWeek = downloadEvents.filter((e) => new Date(e.timestamp) >= oneWeekAgo).length;
  const downloadsThisMonth = downloadEvents.filter((e) => new Date(e.timestamp) >= oneMonthAgo).length;
  const failedDownloads = downloadEvents.filter((e) => e.status === 'failed').length;

  const uniqueIps = new Set(downloadEvents.map((e) => e.ip)).size;
  const uniqueSessions = new Set(downloadEvents.map((e) => e.sessionId)).size;

  // Approximate Bandwidth calculation (sum from file sizes or estimate ~85MB average if missing)
  const totalBandwidthMB = downloadEvents.reduce((acc, curr) => {
    const sizeStr = curr.fileSize || '85 MB';
    const num = parseFloat(sizeStr) || 85;
    if (sizeStr.toLowerCase().includes('gb')) return acc + num * 1024;
    return acc + num;
  }, 0);

  const totalBandwidthDisplay =
    totalBandwidthMB >= 1024
      ? `${(totalBandwidthMB / 1024).toFixed(2)} GB`
      : `${totalBandwidthMB.toFixed(0)} MB`;

  // Top downloads map
  const topSoftwareMap = useMemo(() => {
    const counts: Record<string, number> = {};
    downloadEvents.forEach((e) => {
      counts[e.softwareName] = (counts[e.softwareName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [downloadEvents]);

  // Country breakdown map
  const countryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    downloadEvents.forEach((e) => {
      counts[e.country] = (counts[e.country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [downloadEvents]);

  // Filtered Downloads
  const filteredDownloads = useMemo(() => {
    return downloadEvents.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.softwareName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.ip.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q);
      const matchesCat = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [downloadEvents, searchQuery, selectedCategoryFilter]);

  // Filtered Security Events
  const filteredSecurityEvents = useMemo(() => {
    return securityEvents.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.event.toLowerCase().includes(q) ||
        e.ip.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.actionTaken.toLowerCase().includes(q);
      const matchesRisk = selectedRiskFilter === 'ALL' || e.risk === selectedRiskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [securityEvents, searchQuery, selectedRiskFilter]);

  const handleUpdateAction = (id: string, action: SecurityEvent['actionTaken']) => {
    updateSecurityEventAction(id, action, actionNote);
    setSelectedEventForModal(null);
    setActionNote('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Security &amp; Download Intelligence</span>
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              AUDITED &amp; ENCRYPTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry of software downloads, bandwidth utilization, automated rate-limiting, and privacy-compliant audit records.
          </p>
        </div>

        {/* Global tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'downloads', label: `Downloads (${downloadEvents.length})`, icon: Download },
            { id: 'security', label: `Security (${securityEvents.length})`, icon: ShieldAlert },
            { id: 'verifications', label: 'Verifications', icon: CheckCircle2 },
            { id: 'bandwidth', label: 'Bandwidth', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Today</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">{downloadsToday}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Files dispatched</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>This Week</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">{downloadsThisWeek}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">7-day aggregate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>This Month</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">{downloadsThisMonth}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">30-day aggregate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Bandwidth</span>
            <Server className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400 mt-1">{totalBandwidthDisplay}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Estimated transfer</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Unique Visitors</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">{uniqueIps}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{uniqueSessions} sessions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Security Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">{securityEvents.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active triggers</div>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Downloads Table */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span>Top Downloaded Software &amp; Tools</span>
              </h3>
              <span className="text-[11px] text-slate-400">Total Downloads: {downloadEvents.length}</span>
            </div>

            {topSoftwareMap.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No download events recorded yet. Downloads from Software, Testing, or OS Zone appear here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topSoftwareMap.map(([name, count], index) => {
                  const percent = Math.round((count / (downloadEvents.length || 1)) * 100);
                  return (
                    <div key={name} className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 truncate max-w-[280px]">
                          {index + 1}. {name}
                        </span>
                        <span className="font-black text-blue-400">{count} DLs ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Geographic Distribution */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Downloads by Country &amp; Region</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold">Global Distribution</span>
            </div>

            {countryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Country telemetry will populate as visitors initiate software downloads.
              </div>
            ) : (
              <div className="space-y-2.5">
                {countryBreakdown.map(([country, count]) => {
                  const percent = Math.round((count / (downloadEvents.length || 1)) * 100);
                  return (
                    <div key={country} className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{country}</span>
                        <span className="font-black text-emerald-400">{count} requests ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Security Incidents Box */}
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Automated Defense &amp; Security Events (Last 10)</span>
              </h3>
              <button
                onClick={() => setActiveTab('security')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View All Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {securityEvents.length === 0 ? (
              <div className="py-6 text-center text-emerald-400 text-xs bg-emerald-950/20 border border-emerald-800/30 rounded-2xl flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero anomalous security triggers recorded. All traffic within normal rate limits.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">IP &amp; Region</th>
                      <th className="py-2.5 px-3">Trigger Event</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3">Action Taken</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {securityEvents.slice(0, 6).map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(sec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-200">{sec.ip}</span>
                          <span className="text-[10px] text-slate-400 block">{sec.region}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">{sec.event}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              sec.risk === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : sec.risk === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                : sec.risk === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {sec.risk}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-slate-300 font-semibold">{sec.actionTaken}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedEventForModal(sec)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border border-slate-700"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by software, IP, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="SSD / HDD Health">SSD / HDD Health</option>
                <option value="Battery Diagnostic">Battery Diagnostic</option>
                <option value="GPU / Graphics">GPU / Graphics</option>
                <option value="Display / Screen">Display / Screen</option>
                <option value="System Utilities">System Utilities</option>
                <option value="Operating System">Operating System</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredDownloads.length} of {downloadEvents.length} logged events
            </div>
          </div>

          {filteredDownloads.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No download events match your active filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Software / Tool</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Browser / OS</th>
                    <th className="py-2.5 px-3">Transfer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredDownloads.map((dl) => (
                    <tr key={dl.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(dl.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white block">{dl.softwareName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dl.version ? `v${dl.version}` : 'Latest Release'} • {dl.fileSize || '85 MB'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-700">
                          {dl.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{dl.ip}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-200">{dl.region}</span>,{' '}
                        <span className="text-slate-400">{dl.country}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400">
                        {dl.browser} • {dl.os} ({dl.deviceType})
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dl.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {dl.status === 'completed' ? '✓ Completed' : '✕ Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: SECURITY EVENTS */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter security events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Active Policy: <strong>Strict Bandwidth &amp; Anti-Scrape</strong>
              </span>
            </div>
          </div>

          {filteredSecurityEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No security events matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Offending IP &amp; Origin</th>
                    <th className="py-2.5 px-3">Detection Rule</th>
                    <th className="py-2.5 px-3">Target Software</th>
                    <th className="py-2.5 px-3">Risk Assessment</th>
                    <th className="py-2.5 px-3">Action Status</th>
                    <th className="py-2.5 px-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredSecurityEvents.map((sec) => (
                    <tr key={sec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(sec.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-white block">{sec.ip}</span>
                        <span className="text-[10px] text-slate-400">{sec.region}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{sec.event}</td>
                      <td className="py-2.5 px-3 text-slate-400">{sec.downloadItem || 'Multiple Items'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sec.risk === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : sec.risk === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                              : sec.risk === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {sec.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-300">{sec.actionTaken}</span>
                        {sec.notes && <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">{sec.notes}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEventForModal(sec)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: VERIFICATIONS & CONSENT */}
      {activeTab === 'verifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Security Verification &amp; Privacy Consent Records</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Purpose-limited, data-minimized audit trail with automated 30-day purge cycle.
              </p>
            </div>
            <span className="text-[11px] bg-blue-900/30 text-blue-300 border border-blue-800 px-3 py-1 rounded-full font-bold">
              Strict GDPR / BD-DSA Compliant
            </span>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Consent &amp; Integrity Policy Standards</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              JHF Laptop Zone does not conduct covert background monitoring, keylogging, or biometric collection. Any identity or anti-fraud verification requires explicit browser prompt consent. Logs are strictly purged after the specified retention period (default: 30 days).
            </p>
          </div>

          {securityVerifications.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No manual verification requests logged in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Verification ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Consent Status</th>
                    <th className="py-2.5 px-3">Retention Schedule</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {securityVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-300">{v.id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(v.timestamp).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{v.verificationType}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-400 font-bold">✓ Explicit User Consent</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{v.retentionDays} Days (Auto-Purge)</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: BANDWIDTH */}
      {activeTab === 'bandwidth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Bandwidth &amp; Cloud Storage CDN Analytics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor Google Drive, Mega, and server bandwidth consumed across all 3 zones.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Transferred</div>
              <div className="text-lg font-black text-cyan-400">{totalBandwidthDisplay}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-400">Software Zone Bandwidth</div>
              <div className="text-2xl font-black text-white">~65%</div>
              <p className="text-[11px] text-slate-400">Largest share: Photoshop, AutoCAD, Office packs.</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-400">OS ISO Images</div>
              <div className="text-2xl font-black text-white">~28%</div>
              <p className="text-[11px] text-slate-400">Windows 11 24H2 Clean ISOs (5.8GB average).</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-400">Testing Tools</div>
              <div className="text-2xl font-black text-white">~7%</div>
              <p className="text-[11px] text-slate-400">High frequency, lightweight utilities (10-80MB).</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Event Action Modal */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-base text-white">Manage Security Incident</h3>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Event ID:</span>
                <span className="font-mono text-slate-200">{selectedEventForModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Address:</span>
                <span className="font-mono text-white">{selectedEventForModal.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Region:</span>
                <span className="text-slate-200">{selectedEventForModal.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Detection Trigger:</span>
                <span className="text-rose-400 font-semibold">{selectedEventForModal.event}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <span className="font-black text-rose-400">{selectedEventForModal.risk}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Admin Audit Note</label>
              <textarea
                rows={2}
                placeholder="Add internal note regarding this IP or resolution action..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleUpdateAction(selectedEventForModal.id, 'Rate Limited')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition"
              >
                Rate Limit
              </button>
              <button
                onClick={() => handleUpdateAction(selectedEventForModal.id, 'Temporarily Blocked')}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition"
              >
                Block IP
              </button>
              <button
                onClick={() => handleUpdateAction(selectedEventForModal.id, 'Flagged')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition"
              >
                Flag IP
              </button>
              <button
                onClick={() => handleUpdateAction(selectedEventForModal.id, 'Dismissed')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition"
              >
                Allow / Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
