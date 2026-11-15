import React from 'react';
import { Candidate } from '../types';
import { MatchScoreRing } from './MatchScoreRing';
import { MapPin, Clock, Award, ShieldCheck, UserPlus, Check, ChevronRight } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onInspect: (candidate: Candidate) => void;
  onInvite: (candidateId: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onInspect,
  onInvite,
}) => {
  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-[#2B322A] bg-[#161A16] p-5 transition-colors duration-200 hover:border-[#4A5447]">
      {/* Top row: Avatar, Info, and Match Score Ring */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="relative">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="h-12 w-12 rounded-xl border border-[#2B322A] object-cover"
              />
              {candidate.syncReadiness && (
                <span
                  title="Synchronous Ready"
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#75D99A] border-2 border-[#090B09] "
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-[#F4F6F1] text-base tracking-tight group-hover:text-[#B7F36B] transition-colors">
                  {candidate.name}
                </h3>
                <span className="text-xs font-mono text-[#A0A99D]">
                  {candidate.handle}
                </span>
              </div>
              <p className="text-xs font-mono text-[#A0A99D] mt-0.5 font-medium">
                {candidate.primaryRole}
              </p>
            </div>
          </div>

          {/* Match Score Ring */}
          <div className="flex flex-col items-center">
            <MatchScoreRing score={candidate.matchScore} size={48} strokeWidth={4} />
            <span className="text-[9px] font-mono text-[#A0A99D] uppercase tracking-wider mt-0.5">
              SYNAPSE FIT
            </span>
          </div>
        </div>

        {/* Headline */}
        <p className="mb-2 line-clamp-1 text-xs font-medium text-[#D5DBD1]">
          {candidate.headline}
        </p>

        {/* Bio snippet */}
        <p className="text-xs text-[#A0A99D] line-clamp-2 leading-relaxed mb-4">
          {candidate.bio}
        </p>

        {/* Verified Badges & Commits telemetry */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono text-[#A0A99D]">
          <span className="inline-flex items-center gap-1 text-[#D5DBD1]">
            <MapPin className="w-3 h-3 text-[#697366]" />
            {candidate.location}
          </span>
          <span className="inline-flex items-center gap-1 text-[#D5DBD1]">
            <Clock className="w-3 h-3 text-[#697366]" />
            {candidate.timezone}
          </span>
          <span className="inline-flex items-center gap-1 text-[#75D99A] font-semibold bg-[#75D99A]/10 px-1.5 py-0.5 rounded border border-[#75D99A]/20">
            <Award className="w-3 h-3" />
            {candidate.metrics.hackathonsWon} Wins
          </span>
          <span className="inline-flex items-center gap-1 text-[#A0A99D] font-mono text-[10px]">
            <ShieldCheck className="w-3 h-3 text-[#A0A99D]" />
            {candidate.metrics.verifiedProof}
          </span>
        </div>

        {/* Developer Stack Badges (JetBrains Mono with micro-dots) */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {candidate.skills.map((skill) => (
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

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-[#2B322A] pt-3">
        <button
          onClick={() => onInspect(candidate)}
          className="flex items-center gap-1 rounded px-2 py-1 font-mono text-xs text-[#D5DBD1] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
        >
          Inspect Matrix <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onInvite(candidate.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            candidate.invited
              ? 'bg-[#75D99A]/20 text-[#75D99A] border border-[#75D99A]/40'
              : 'bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653]'
          }`}
        >
          {candidate.invited ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Invited
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              Invite to Team
            </>
          )}
        </button>
      </div>
    </article>
  );
};
