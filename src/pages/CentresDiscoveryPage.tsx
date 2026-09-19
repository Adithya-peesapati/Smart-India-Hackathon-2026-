import React, { useState, useEffect, useMemo } from 'react';
import { ProcurementCentre } from '../types';
import { centreService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  getAllIndianStates,
  getDistrictsByState,
  getAllDistricts,
} from '../data/indiaLocations';
import {
  Search,
  MapPin,
  Clock,
  Building,
  Wheat,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  Globe2,
} from 'lucide-react';

interface CentresDiscoveryPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialQuery?: string;
}

export const CentresDiscoveryPage: React.FC<CentresDiscoveryPageProps> = ({
  onNavigate,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedDistance, setSelectedDistance] = useState('All Distances');
  const [selectedStatus, setSelectedStatus] = useState('Any Status');
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);

  const allStates = useMemo(() => getAllIndianStates(), []);

  // Compute available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (selectedState && selectedState !== 'All States') {
      return getDistrictsByState(selectedState);
    }
    return getAllDistricts();
  }, [selectedState]);

  // Reset district if current district is not in selected state
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('All Districts');
  };

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const data = await centreService.getCentres({
        query: searchQuery,
        state: selectedState,
        district: selectedDistrict,
        status: selectedStatus,
      });
      setCentres(data);
    } catch (err) {
      console.error('Error loading centres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, [searchQuery, selectedState, selectedDistrict, selectedStatus]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Public_Sans']">
          Find a Procurement Centre
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse verified government mandis and PACS across all Indian States & Districts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by centre, crop, or location"
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* State Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              State / UT
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-slate-800 transition-all cursor-pointer truncate"
            >
              <option value="All States">All States & UTs ({allStates.length})</option>
              {allStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>District</span>
              {selectedState !== 'All States' && (
                <span className="text-[10px] text-emerald-700 font-normal lowercase">
                  ({availableDistricts.length} available)
                </span>
              )}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-slate-800 transition-all cursor-pointer truncate"
            >
              <option value="All Districts">
                {selectedState !== 'All States' ? `All Districts in ${selectedState}` : 'All Districts'}
              </option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Availability
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-slate-800 transition-all cursor-pointer"
            >
              <option value="Any Status">Any Status</option>
              <option value="active">Operational</option>
              <option value="seasonal_closed">Seasonal Closed</option>
            </select>
          </div>
        </div>

        {/* Filter Quick Pills */}
        {(selectedState !== 'All States' || selectedDistrict !== 'All Districts' || searchQuery) && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Active filters:</span>
            {selectedState !== 'All States' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
                State: {selectedState}
                <button
                  type="button"
                  onClick={() => handleStateChange('All States')}
                  className="hover:text-emerald-900 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedDistrict !== 'All Districts' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
                District: {selectedDistrict}
                <button
                  type="button"
                  onClick={() => setSelectedDistrict('All Districts')}
                  className="hover:text-emerald-900 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedState('All States');
                setSelectedDistrict('All Districts');
                setSelectedStatus('Any Status');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium underline ml-auto cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Searching procurement hubs across districts...
        </div>
      ) : centres.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 bg-white rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Public_Sans']">
            No procurement centres found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-4">
            Try adjusting your search criteria or selecting a different district/state.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedState('All States');
              setSelectedDistrict('All Districts');
              setSelectedStatus('Any Status');
            }}
            className="px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Dynamic Centre Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {centres.map((centre) => (
            <div
              key={centre.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-600 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {centre.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {centre.state}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-['Public_Sans'] mt-2 leading-snug">
                      {centre.name}
                    </h3>
                  </div>
                  <StatusBadge status={centre.activeStatus} size="sm" />
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {centre.address}, <strong className="text-slate-800 font-semibold">{centre.district}</strong>, {centre.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{centre.operatingHours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Daily Quota: <strong className="text-slate-900 font-semibold">{centre.dailyCapacityQuintals} Qtl</strong>
                    </span>
                  </div>
                </div>

                {/* Accepted Crops Badges */}
                <div className="pt-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Accepted Crops:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {centre.acceptedCrops.map((crop, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('centre-details', { centreId: centre.id })}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-center cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('book-slot', { centreId: centre.id })}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
