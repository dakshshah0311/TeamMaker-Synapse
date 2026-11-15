import React from 'react';
import { TeamVenture } from '../types';
import { MatchScoreRing } from './MatchScoreRing';
import { AlertCircle, Users, ExternalLink, Zap, Terminal } from 'lucide-react';

interface TeamCardProps {
  team: TeamVenture;
  onJoinRequest: (teamId: string) => void;
  onInspectTeam: (team: TeamVenture) => void;
  hasRequested?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onJoinRequest,
  onInspectTeam,
  hasRequested = false,
}) => {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-[#161A16] p-5 transition-colors duration-200 ${
        team.criticalMissingRole
          ? 'border-[#2B322A] hover:border-[#F07878]/50'
          : 'border-[#2B322A] hover:border-[#4A5447]'
      }`}
    >
      <div>
        {/* Top Header: Track, Prize Target, Match Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30">
                {team.track}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#A0A99D] bg-[#A0A99D]/10 border border-[#A0A99D]/25">
                {team.prizePoolTarget}
              </span>
            </div>
            <h3 className="font-display font-bold text-[#F4F6F1] text-lg tracking-tight group-hover:text-[#B7F36B] transition-colors">
              {team.title}
            </h3>
          </div>

          <div className="flex flex-col items-center">
            <MatchScoreRing score={team.matchScore} size={48} strokeWidth={4} />
            <span className="text-[9px] font-mono text-[#A0A99D] uppercase tracking-wider mt-0.5">
              TEAM FIT
            </span>
          </div>
        </div>

        {/* Tagline & Description */}
        <p className="text-xs font-semibold text-[#F4F6F1] mb-1.5">
          {team.tagline}
        </p>
        <p className="text-xs text-[#A0A99D] leading-relaxed line-clamp-2 mb-4">
          {team.description}
        </p>

        {/* Critical Missing Role Alert if present (Rose Alert) */}
        {team.criticalMissingRole && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#F07878]/10 border border-[#F07878]/30 flex items-center gap-2 text-xs font-mono text-[#F07878] ">
            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-[#F07878]" />
            <span className="font-semibold">{team.criticalMissingRole}</span>
          </div>
        )}

        {/* Current Roster and Open Slots */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A0A99D] mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#A0A99D]" />
              ROSTER SLOTS ({team.members.length}/{team.maxMembers})
            </span>
            <span className="text-[10px] text-[#A0A99D]">
              {team.maxMembers - team.members.length} open
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {team.requiredRoles.map((role, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                  role.filled
                    ? 'bg-[#1C211C] border-[#2B322A] text-[#D5DBD1]'
                    : 'bg-[#101310] border-dashed border-[#3A4337] text-[#A0A99D]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    role.filled ? 'bg-[#75D99A]' : 'bg-[#F07878] animate-pulse'
                  }`}
                />
                <div className="truncate">
                  <span className="block truncate font-medium text-[11px]">
                    {role.title}
                  </span>
                  <span className="block text-[9px] text-[#697366] truncate">
                    {role.filled ? role.assignedTo : 'OPEN SLOT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Required */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {team.techStack.map((skill) => (
            <span
              key={skill.name}
              className="inline-flex items-center gap-1.5 rounded border border-[#2B322A] bg-[#1C211C] px-2 py-0.5 text-xs font-mono text-[#D5DBD1]"
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-t border-[#2B322A] pt-3">
        <button
          onClick={() => onInspectTeam(team)}
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-xs text-[#D5DBD1] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
        >
          <Terminal className="w-3.5 h-3.5 text-[#A0A99D]" />
          War Room Preview
        </button>

        <button
          onClick={() => onJoinRequest(team.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            hasRequested
              ? 'bg-[#75D99A]/20 text-[#75D99A] border border-[#75D99A]/40'
              : 'bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {hasRequested ? 'Request Transmitted ✓' : 'Join Venture Team'}
        </button>
      </div>
    </div>
  );
};
