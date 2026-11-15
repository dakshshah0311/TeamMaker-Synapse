import React from 'react';
import { TrackType, RoleCategory } from '../types';
import { Search, Filter, SlidersHorizontal, Check, Zap } from 'lucide-react';

interface FilterRibbonProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTrack: TrackType | 'All';
  onTrackChange: (track: TrackType | 'All') => void;
  selectedRole: RoleCategory | 'All';
  onRoleChange: (role: RoleCategory | 'All') => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  syncOnly: boolean;
  onSyncOnlyToggle: () => void;
  sortBy: 'match' | 'wins' | 'commits';
  onSortChange: (sort: 'match' | 'wins' | 'commits') => void;
}

const TRACKS: (TrackType | 'All')[] = [
  'All',
  'Autonomous AI',
  'DePIN & Distributed',
  'Developer Tooling',
  'Zero Knowledge & Crypto',
  'BioTech & Climate',
];

const ROLES: (RoleCategory | 'All')[] = [
  'All',
  'Systems & Rust',
  'ML / AI Research',
  'Full-Stack Web',
  'Smart Contracts',
  'Product & UX Craft',
];

export const FilterRibbon: React.FC<FilterRibbonProps> = ({
  searchQuery,
  onSearchChange,
  selectedTrack,
  onTrackChange,
  selectedRole,
  onRoleChange,
  minScore,
  onMinScoreChange,
  syncOnly,
  onSyncOnlyToggle,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="mb-6 space-y-4 rounded-xl border border-[#2B322A] bg-[#101310] p-4 sm:p-5">
      {/* Search Bar & Secondary Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A0A99D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search people, skills, or technologies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#090B09] text-[#F4F6F1] text-xs font-mono pl-9 pr-4 py-2 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B] focus:ring-2 focus:ring-[#B7F36B]/20 placeholder:text-[#697366] transition-all"
          />
        </div>

        {/* Sync Readiness Toggle + Score Slider + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Synchronous Ready Filter */}
          <button
            onClick={onSyncOnlyToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
              syncOnly
                ? 'bg-[#B7F36B]/10 border-[#B7F36B]/40 text-[#B7F36B]'
                : 'bg-[#161A16] border-[#2B322A] text-[#A0A99D] hover:text-[#F4F6F1]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${syncOnly ? 'bg-[#75D99A]' : 'bg-[#697366]'}`} />
            Sync Ready Only
          </button>

          {/* Min Fit Slider */}
          <div className="flex items-center gap-2 bg-[#161A16] px-3 py-1.5 rounded-lg border border-[#2B322A] text-xs font-mono">
            <span className="text-[#A0A99D] text-[11px]">Min Fit:</span>
            <input
              type="range"
              min="70"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-20 accent-[#B7F36B] cursor-pointer"
            />
            <span className="text-[#A0A99D] font-bold">{minScore}%</span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-[#161A16] p-0.5 rounded-lg border border-[#2B322A] text-xs font-mono">
            <button
              onClick={() => onSortChange('match')}
              className={`px-2 py-1 rounded transition-colors ${
                sortBy === 'match'                 ? 'bg-[#B7F36B] text-[#090B09] font-semibold' : 'text-[#A0A99D] hover:text-[#F4F6F1]'
              }`}
            >
              Top Fit
            </button>
            <button
              onClick={() => onSortChange('wins')}
              className={`px-2 py-1 rounded transition-colors ${
                sortBy === 'wins'                 ? 'bg-[#B7F36B] text-[#090B09] font-semibold' : 'text-[#A0A99D] hover:text-[#F4F6F1]'
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => onSortChange('commits')}
              className={`px-2 py-1 rounded transition-colors ${
                sortBy === 'commits'                 ? 'bg-[#B7F36B] text-[#090B09] font-semibold' : 'text-[#A0A99D] hover:text-[#F4F6F1]'
              }`}
            >
              Commits
            </button>
          </div>
        </div>
      </div>

      {/* Track Pills Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span         className="mr-1 shrink-0 text-[11px] font-mono text-[#A0A99D]">
          Tracks:
        </span>
        {TRACKS.map((track) => (
          <button
            key={track}
            onClick={() => onTrackChange(track)}
            className={`px-3 py-1 rounded-full text-xs font-mono shrink-0 transition-all ${
              selectedTrack === track
                ? 'bg-[#B7F36B]/10 border border-[#B7F36B]/50 text-[#B7F36B] font-medium'
                : 'bg-[#161A16] border border-[#2B322A] text-[#A0A99D] hover:text-[#F4F6F1] hover:border-[#4A5447]'
            }`}
          >
            {track}
          </button>
        ))}
      </div>

      {/* Role Pills Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span         className="mr-1 shrink-0 text-[11px] font-mono text-[#A0A99D]">
          Roles:
        </span>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`px-3 py-1 rounded-full text-xs font-mono shrink-0 transition-all ${
              selectedRole === role
                ? 'bg-[#B7F36B]/10 border border-[#B7F36B]/50 text-[#B7F36B] font-medium'
                : 'bg-[#161A16] border border-[#2B322A] text-[#A0A99D] hover:text-[#F4F6F1] hover:border-[#4A5447]'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
};
