import React, { useState } from 'react';
import { Candidate } from '../types';
import { Radio, Crosshair, Sparkles, Filter, Users, Wifi } from 'lucide-react';

interface RadarVisualizerProps {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onBroadcastBeacon: () => void;
  isBroadcasting: boolean;
}

export const RadarVisualizer: React.FC<RadarVisualizerProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onBroadcastBeacon,
  isBroadcasting,
}) => {
  const [hoveredCandidate, setHoveredCandidate] = useState<Candidate | null>(null);
  const [radarZoom, setRadarZoom] = useState<'all' | 'high-match'>('all');

  // Filter candidates based on zoom level
  const displayedCandidates = radarZoom === 'high-match' 
    ? candidates.filter(c => c.matchScore >= 90)
    : candidates;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ML / AI Research':
        return '#B7F36B';
      case 'Systems & Rust':
        return '#A0A99D';
      case 'Full-Stack Web':
        return '#75D99A';
      case 'Smart Contracts':
        return '#E9BB69';
      case 'Product & UX Craft':
        return '#F07878';
      default:
        return '#B7F36B';
    }
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#2B322A] bg-[#101310] p-4 sm:p-5">
      {/* Top Telemetry Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#2B322A] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#B7F36B]/15 border border-[#B7F36B]/30">
            <Radio className="w-4 h-4 text-[#B7F36B] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#75D99A] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F4F6F1] tracking-tight text-sm">
                Teammate radar
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[#A0A99D]/10 text-[#A0A99D] border border-[#A0A99D]/25">
                SWEEP LIVE
              </span>
            </div>
            <p className="text-xs text-[#A0A99D]">
              Skill fit and availability across your network
            </p>
          </div>
        </div>

        {/* Radar Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#161A16] p-0.5 rounded-lg border border-[#2B322A] text-xs font-mono">
            <button
              onClick={() => setRadarZoom('all')}
              className={`px-2.5 py-1 rounded transition-all ${
                radarZoom === 'all'
                  ? 'bg-[#B7F36B] text-[#090B09]'
                  : 'text-[#A0A99D] hover:text-[#F4F6F1]'
              }`}
            >
              Full Mesh ({candidates.length})
            </button>
            <button
              onClick={() => setRadarZoom('high-match')}
              className={`px-2.5 py-1 rounded transition-all ${
                radarZoom === 'high-match'
                  ? 'bg-[#B7F36B] text-[#090B09]'
                  : 'text-[#A0A99D] hover:text-[#F4F6F1]'
              }`}
            >
              ≥90% Affinity ({candidates.filter(c => c.matchScore >= 90).length})
            </button>
          </div>

          <button
            onClick={onBroadcastBeacon}
            disabled={isBroadcasting}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isBroadcasting
                ? 'bg-[#A0A99D]/20 text-[#A0A99D] border border-[#A0A99D]/50 animate-pulse'
                : 'bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isBroadcasting ? 'Broadcasting Beacon...' : 'Broadcast Synapse Beacon'}
          </button>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Circular Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative aspect-square w-full max-w-[380px] overflow-hidden rounded-full border border-[#2B322A] bg-[#090B09] flex items-center justify-center">
            {/* Concentric Match Affinity Rings */}
            <div className="absolute inset-0 rounded-full border border-[#2B322A]" />
            <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#B7F36B]/20" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-[#2B322A]" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-dashed border-[#A0A99D]/25" />
            <div className="absolute w-[20%] h-[20%] rounded-full border border-[#B7F36B]/40 bg-[#B7F36B]/5" />

            {/* Radar Coordinates Axes */}
            <div className="absolute w-full h-px bg-[#2B322A]" />
            <div className="absolute h-full w-px bg-[#2B322A]" />
            <div className="absolute w-full h-px rotate-45 bg-[#2B322A]/50" />
            <div className="absolute w-full h-px -rotate-45 bg-[#2B322A]/50" />

            {/* Ring Labels */}
            <span className="absolute top-2 text-[10px] font-mono text-[#697366]">100% Core</span>
            <span className="absolute top-10 text-[9px] font-mono text-[#697366]">85% Sync</span>
            <span className="absolute top-20 text-[9px] font-mono text-[#697366]">70% Zone</span>

            {/* Revolving Sweep Beam */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none animate-radar-sweep origin-center"
              style={{
                background: 'conic-gradient(from 0deg, rgba(183, 243, 107, 0.14) 0deg, rgba(183, 243, 107, 0.04) 42deg, transparent 58deg, transparent 360deg)',
              }}
            />

            {/* Broadcast Beacon Ripples when active */}
            {isBroadcasting && (
              <>
                <div className="absolute w-12 h-12 rounded-full border border-[#A0A99D] animate-ping" />
                <div className="absolute w-36 h-36 rounded-full border border-[#B7F36B] animate-ping duration-1000" />
                <div className="absolute w-64 h-64 rounded-full border border-[#75D99A] animate-ping duration-1500" />
              </>
            )}

            {/* Center Anchor Point (Current User / Team Core) */}
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#B7F36B] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#090B09] flex items-center justify-center">
                <Crosshair className="w-3.5 h-3.5 text-[#F4F6F1]" />
              </div>
            </div>

            {/* Candidate Radar Blips */}
            {displayedCandidates.map((cand) => {
              // Convert polar to cartesian
              // radar is 340/380px wide. Radius = 150px
              const maxRadius = 125;
              const r = cand.radarCoords.distance * maxRadius;
              const angleRad = (cand.radarCoords.angle * Math.PI) / 180;
              const x = r * Math.cos(angleRad);
              const y = r * Math.sin(angleRad);

              const isSelected = selectedCandidate?.id === cand.id;
              const isHovered = hoveredCandidate?.id === cand.id;
              const dotColor = getRoleColor(cand.primaryRole);

              return (
                <div
                  key={cand.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  onMouseEnter={() => setHoveredCandidate(cand)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                  onClick={() => onSelectCandidate(cand)}
                  className="absolute cursor-pointer z-20 group transition-transform duration-300 hover:scale-125"
                >
                  {/* Blip Outer Ring */}
                  <div
                    className={`relative w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#B7F36B] ring-offset-2 ring-offset-[#090B09] scale-125'
                        : isHovered
                        ? 'ring-2 ring-[#A0A99D]'
                        : ''
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full  animate-pulse"
                      style={{ backgroundColor: dotColor, color: dotColor }}
                    />
                    {/* Synchronous readiness emerald ping */}
                    {cand.syncReadiness && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#75D99A] " />
                    )}
                  </div>

                  {/* Micro hover tag */}
                  <div className="absolute left-4 top-1/2 z-30 flex -translate-y-1/2 pointer-events-none items-center gap-1.5 whitespace-nowrap rounded border border-[#2B322A] bg-[#161A16] px-2 py-1 font-mono text-[11px] text-[#F4F6F1] opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="font-semibold">{cand.name.split(' ')[0]}</span>
                    <span className="text-[#A0A99D] font-bold">{cand.matchScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radar Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] font-mono text-[#A0A99D]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B7F36B]" /> AI/ML
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A0A99D]" /> Systems / Rust
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#75D99A]" /> Full-Stack
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E9BB69]" /> ZK / Crypto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F07878]" /> UX Craft
            </span>
            <span className="flex items-center gap-1.5 border-l border-[#2B322A] pl-2">
              <span className="w-2 h-2 rounded-full bg-[#75D99A] animate-ping" /> Sync Ready
            </span>
          </div>
        </div>

        {/* Selected / Hovered Candidate Telemetry Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full rounded-xl border border-[#2B322A] bg-[#161A16] p-4">
          {(() => {
            const active = hoveredCandidate || selectedCandidate || candidates[0];
            if (!active) return null;

            return (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={active.avatar}
                      alt={active.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#2B322A] shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[#F4F6F1] font-semibold text-base tracking-tight font-display">
                          {active.name}
                        </h4>
                        <span className="text-xs font-mono text-[#A0A99D]">
                          {active.handle}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 text-xs text-[#A0A99D] font-mono font-medium">
                        {active.primaryRole}
                      </span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#B7F36B] to-[#A0A99D]">
                      {active.matchScore}%
                    </div>
                    <span className="text-[10px] font-mono text-[#A0A99D] uppercase tracking-wider">
                      Synapse Fit
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D5DBD1] line-clamp-2 leading-relaxed">
                  {active.bio}
                </p>

                {/* Tech Stack Badges (JetBrains Mono tags with micro dot indicator) */}
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#A0A99D] mb-1.5">
                    Verified Skill Signature
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1C211C] border border-[#2B322A] text-xs font-mono text-[#F4F6F1]"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            skill.dotColor === 'cyan'
                              ? 'bg-[#A0A99D]'
                              : skill.dotColor === 'emerald'
                              ? 'bg-[#75D99A]'
                              : 'bg-[#B7F36B]'
                          }`}
                        />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telemetry Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2B322A]">
                  <div className="bg-[#1C211C] p-2 rounded-lg border border-[#2B322A]">
                    <span className="text-[10px] font-mono text-[#A0A99D] block">
                      COMMIT CADENCE
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#F4F6F1]">
                      {active.metrics.githubCommits} commits / yr
                    </span>
                  </div>
                  <div className="bg-[#1C211C] p-2 rounded-lg border border-[#2B322A]">
                    <span className="text-[10px] font-mono text-[#A0A99D] block">
                      HACKATHON WINS
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#75D99A]">
                      {active.metrics.hackathonsWon} First Places
                    </span>
                  </div>
                </div>

                {/* Sync status & Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active.syncReadiness ? 'bg-[#75D99A] animate-pulse' : 'bg-[#697366]'
                      }`}
                    />
                    <span className={active.syncReadiness ? 'text-[#75D99A]' : 'text-[#A0A99D]'}>
                      {active.syncReadiness ? 'Synchronous Ready' : 'Asynchronous Focus'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectCandidate(active)}
                    className="rounded-lg bg-[#B7F36B] px-3.5 py-1.5 text-xs font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653]"
                  >
                    Inspect Profile & Invite
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};
