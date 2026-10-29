import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Check,
  Database,
  CheckCheck,
  Building2,
  Trash2,
  Filter,
  Clock,
  Eye,
  MapPin,
  ArrowUpDown,
  X
} from 'lucide-react';
import { PATIENTS_DATABASE, PatientRecord } from '../../data/patients';
import { UrgencyBadge } from '../../components/common/UrgencyBadge';
import { PatientDetailsModal } from '../../components/common/PatientDetailsModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useSearchParams } from 'react-router-dom';

type SortOption = 'URGENCY' | 'WAITING' | 'NAME' | 'AGE';

export const AshaPatients: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { isOnline, isServerReachable } = useNetwork();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [patients, setPatients] = useState<PatientRecord[]>(PATIENTS_DATABASE);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CACHED' | 'NUAPADA' | 'URGENT'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('URGENCY');
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Sync search state when URL searchParam changes
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearch(query);
    }
  }, [searchParams]);

  // Patient Details Modal State
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isConnected = isOnline && isServerReachable;

  const handleOpenDetails = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.trim()) {
      setSearchParams({ search: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchParams({});
    setActiveFilter('ALL');
    setSortBy('URGENCY');
  };

  const toggleCache = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Avoid opening details modal
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isCached;
          showToast(
            nextState
              ? `${name} cached in IndexedDB for offline field visit`
              : `${name} removed from device storage`,
            nextState ? 'success' : 'info'
          );
          return { ...p, isCached: nextState };
        }
        return p;
      })
    );
  };

  const handleDownloadVillagePack = () => {
    if (!isConnected) {
      showToast(
        language === 'or'
          ? 'ନେଟୱର୍କ ସଂଯୋଗ ନାହିଁ। ନୂତନ ରେକର୍ଡ ଡାଉନଲୋଡ୍ କରିବାକୁ ଇଣ୍ଟରନେଟ୍ ଆବଶ୍ୟକ।'
          : 'Cannot download new records while offline. Please connect to internet first.',
        'warning'
      );
      return;
    }

    setIsDownloadingAll(true);
    setTimeout(() => {
      setPatients((prev) => prev.map((p) => ({ ...p, isCached: true })));
      setIsDownloadingAll(false);
      showToast(
        language === 'or'
          ? 'ନୂଆପଡ଼ା ଗ୍ରାମର ସମସ୍ତ ରୋଗୀଙ୍କ ତଥ୍ୟ ଅଫଲାଇନ୍ ପାଇଁ ସାଇତା ହେଲା!'
          : 'Village Field Visit Pack saved to local IndexedDB!',
        'success'
      );
    }, 1000);
  };

  // Filter logic
  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.fullNameOdia.includes(search) ||
      p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(search.toLowerCase());

    if (activeFilter === 'CACHED') return matchesSearch && p.isCached;
    if (activeFilter === 'NUAPADA') return matchesSearch && p.village.includes('Nuapada');
    if (activeFilter === 'URGENT') return matchesSearch && (p.urgency === 'URGENT' || p.urgency === 'EMERGENCY');
    return matchesSearch;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'URGENCY') {
      const rank = { EMERGENCY: 3, URGENT: 2, ROUTINE: 1 };
      return rank[b.urgency] - rank[a.urgency];
    }
    if (sortBy === 'WAITING') {
      // Numerical extraction from "X mins"
      const getMins = (w: string) => parseInt(w.replace(/\D/g, '')) || 0;
      return getMins(b.waitingTime) - getMins(a.waitingTime);
    }
    if (sortBy === 'NAME') {
      return a.fullName.localeCompare(b.fullName);
    }
    if (sortBy === 'AGE') {
      return b.age - a.age;
    }
    return 0;
  });

  const cachedCount = patients.filter((p) => p.isCached).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-subtleBorder shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amberOrange-50 text-amberOrange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amberOrange-600" />
              <span>Nuapada Sector • Sub-Center Registry</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ରୋଗୀ ତାଲିକା ଓ ଅଫଲାଇନ୍ ରେଜିଷ୍ଟ୍ରି' : 'Patient Directory & Offline Registry'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
            {language === 'or'
              ? 'ଗ୍ରାମ ପରିଦର୍ଶନ ପୂର୍ବରୁ ଆବଶ୍ୟକୀୟ ରୋଗୀଙ୍କ ତଥ୍ୟ ଫୋନ୍‌ରେ ସାଇତନ୍ତୁ ଏବଂ କ୍ଲିନିକାଲ୍ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ।'
              : 'Review patient triage queues, inspect clinical history, and cache records for offline field visits.'}
          </p>
        </div>

        {/* 1-Tap Village Pack Download Button */}
        <button
          type="button"
          onClick={handleDownloadVillagePack}
          disabled={isDownloadingAll || cachedCount === patients.length}
          className="inline-flex items-center justify-center gap-2 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {cachedCount === patients.length ? (
            <>
              <CheckCheck className="w-4 h-4 text-white" />
              <span>{language === 'or' ? 'ସମସ୍ତ ତଥ୍ୟ ସାଇତା ହୋଇଛି' : 'All Village Data Cached'}</span>
            </>
          ) : isDownloadingAll ? (
            <>
              <Download className="w-4 h-4 animate-bounce" />
              <span>{language === 'or' ? 'ଡାଉନଲୋଡ୍ ଚାଲିଛି...' : 'Downloading Pack...'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{language === 'or' ? 'ନୂଆପଡ଼ା ପ୍ୟାକ୍ ଡାଉନଲୋଡ୍' : 'Download Village Field Pack'}</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Storage Indicator Callout */}
      <div className="bg-surface p-4 rounded-2xl border border-subtleBorder shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-amberOrange-600 shrink-0" />
          <span className="text-secondaryText">
            Local Vault: <strong className="text-primaryText">{cachedCount} of {patients.length}</strong> patient records permanently persisted in IndexedDB
          </span>
        </div>

        <div className="flex items-center gap-2 text-secondaryText">
          <span className="inline-block w-2 h-2 rounded-full bg-forestGreen-500" />
          <span>Storage Quota: 1.4 MB / 50 MB Allocated</span>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Controls */}
      <div className="bg-surface p-4 rounded-2xl border border-subtleBorder shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                language === 'or'
                  ? 'ରୋଗୀଙ୍କ ନାମ, ଗ୍ରାମ, ଲକ୍ଷଣ କିମ୍ବା OD-P କୋଡ୍ ସର୍ଚ୍ଚ କରନ୍ତୁ...'
                  : 'Search by patient name, complaint, village, or OD-P code...'
              }
              className="w-full pl-10 pr-10 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs sm:text-sm text-primaryText placeholder-secondaryText focus:bg-white focus:outline-none focus:border-amberOrange-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-2.5 p-0.5 text-secondaryText hover:text-primaryText"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-secondaryText font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-secondaryText" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold text-primaryText bg-canvas border border-subtleBorder rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amberOrange-500"
            >
              <option value="URGENCY">Urgency (Emergency First)</option>
              <option value="WAITING">Waiting Time (Longest)</option>
              <option value="NAME">Name (A - Z)</option>
              <option value="AGE">Age (Oldest First)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-subtleBorder">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-secondaryText shrink-0" />
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-[#17191C] text-white shadow-2xs'
                  : 'bg-canvas text-secondaryText border border-subtleBorder hover:bg-subtleBorder/50'
              }`}
            >
              All ({patients.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('URGENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'URGENT'
                  ? 'bg-amberOrange-600 text-white shadow-2xs'
                  : 'bg-canvas text-secondaryText border border-subtleBorder hover:bg-subtleBorder/50'
              }`}
            >
              <span>Urgent &amp; Emergency</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('CACHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeFilter === 'CACHED'
                  ? 'bg-forestGreen-500 text-white shadow-2xs'
                  : 'bg-canvas text-secondaryText border border-subtleBorder hover:bg-subtleBorder/50'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Saved on Device ({cachedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('NUAPADA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === 'NUAPADA'
                  ? 'bg-primaryText text-white shadow-2xs'
                  : 'bg-canvas text-secondaryText border border-subtleBorder hover:bg-subtleBorder/50'
              }`}
            >
              Nuapada Sector
            </button>
          </div>

          <span className="text-xs text-secondaryText font-medium">
            Showing <strong className="text-primaryText">{sorted.length}</strong> of {patients.length} patients
          </span>
        </div>
      </div>

      {/* 4. Structured Patient Records Table or Empty State */}
      {sorted.length === 0 ? (
        <EmptyState
          title="No patients found"
          description={`No patient records matched "${search}" with the active filters. Try adjusting your search query or reset filters.`}
          actionLabel="Reset Search & Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="bg-surface border border-subtleBorder rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-subtleBorder text-secondaryText font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 min-w-[220px]">Patient Profile</th>
                  <th className="p-4 min-w-[150px]">Location &amp; Facility</th>
                  <th className="p-4 min-w-[240px]">Chief Complaint &amp; Vitals</th>
                  <th className="p-4 min-w-[130px]">Waiting Time</th>
                  <th className="p-4 min-w-[140px]">Triage Urgency</th>
                  <th className="p-4 min-w-[130px]">Local Vault</th>
                  <th className="p-4 min-w-[150px] text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtleBorder">
                {sorted.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => handleOpenDetails(patient)}
                    className="hover:bg-canvas/60 transition-colors cursor-pointer group"
                  >
                    {/* Patient Profile */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#17191C] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:border group-hover:border-amberOrange-500/50 transition-colors">
                          <span className="text-amberOrange-500">
                            {patient.fullName.substring(0, 1)}
                          </span>
                          <span>{patient.fullName.split(' ')[1]?.[0] || ''}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-primaryText text-sm group-hover:text-amberOrange-600 transition-colors truncate">
                              {patient.fullName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] bg-canvas text-primaryText px-2 py-0.5 rounded border border-subtleBorder font-semibold">
                              {patient.patientCode}
                            </span>
                            <span className="text-[11px] text-secondaryText">
                              {patient.age}y • {patient.gender === 'FEMALE' ? 'F' : 'M'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location & Facility */}
                    <td className="p-4">
                      <span className="text-primaryText font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amberOrange-600 shrink-0" />
                        <span className="truncate">{patient.village}</span>
                      </span>
                      <span className="text-[11px] text-secondaryText block truncate mt-0.5">
                        {patient.subCenter}
                      </span>
                    </td>

                    {/* Chief Complaint & Vitals Preview */}
                    <td className="p-4">
                      <p className="text-primaryText font-medium leading-snug line-clamp-2 max-w-sm">
                        {patient.chiefComplaint}
                      </p>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-secondaryText mt-1">
                        <span>BP: <strong className="text-primaryText">{patient.vitals.bp}</strong></span>
                        <span>•</span>
                        <span>SpO2: <strong className="text-forestGreen-500">{patient.vitals.spo2}%</strong></span>
                        <span>•</span>
                        <span className={patient.vitals.tempF > 100 ? 'text-crimsonRed-500 font-bold' : ''}>
                          {patient.vitals.tempF}°F
                        </span>
                      </div>
                    </td>

                    {/* Waiting Time / Last Visit */}
                    <td className="p-4">
                      <span className="text-secondaryText text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-secondaryText shrink-0" />
                        <span>{patient.waitingTime}</span>
                      </span>
                      <span className="text-[10px] text-secondaryText/70 block mt-0.5">
                        Last: {patient.lastVisitDate}
                      </span>
                    </td>

                    {/* Clearly Separated Urgency Badge (Never Overlaps) */}
                    <td className="p-4">
                      <div className="flex items-center">
                        <UrgencyBadge urgency={patient.urgency} patient={patient} />
                      </div>
                    </td>

                    {/* Local Storage State Tag */}
                    <td className="p-4">
                      {patient.isCached ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-forestGreen-500 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Saved on Device</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-canvas text-secondaryText border border-subtleBorder px-2 py-0.5 rounded-full">
                          <span>Server Only</span>
                        </span>
                      )}
                    </td>

                    {/* Clinical Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(patient);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-subtleBorder text-xs font-semibold bg-surface hover:bg-canvas text-primaryText shadow-2xs hover:border-amberOrange-500/40 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amberOrange-600" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleCache(e, patient.id, patient.fullName)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            patient.isCached
                              ? 'bg-canvas text-secondaryText border-subtleBorder hover:bg-red-50 hover:text-crimsonRed-500 hover:border-red-200'
                              : 'bg-amberOrange-50 text-amberOrange-700 border-amberOrange-200 hover:bg-amberOrange-100'
                          }`}
                          title={patient.isCached ? 'Remove from device storage' : 'Save to device for offline use'}
                        >
                          {patient.isCached ? <Trash2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Patient Details & Urgency Explanation Modal */}
      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};
