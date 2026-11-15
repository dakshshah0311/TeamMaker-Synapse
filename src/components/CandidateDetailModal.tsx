import React, { useState } from 'react';
import { Candidate } from '../types';
import { MatchScoreRing } from './MatchScoreRing';
import { X, MapPin, Clock, Award, ShieldCheck, GitCommit, Zap, Send, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onInvite: (candidateId: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onInvite,
}) => {
  if (!candidate) return null;

  const [customPitch, setCustomPitch] = useState(
    `Hey ${candidate.name.split(' ')[0]}, we are assembling a team for the Autonomous AI track. We saw your ${candidate.skills[0]?.name || 'systems'} work and want to invite you to collaborate as our ${candidate.primaryRole} lead!`
  );
  const [inviteSent, setInviteSent] = useState(candidate.invited || false);

  const handleSendInvite = () => {
    onInvite(candidate.id);
    setInviteSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#101310] border border-[#3A4337] rounded-2xl overflow-hidden shadow-xl rim-light-top max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-[#2B322A] bg-[#161A16]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#B7F36B]/20 text-[#B7F36B] border border-[#B7F36B]/30">
              SYNAPSE VERIFIED PROFILE
            </span>
            <span className="text-xs font-mono text-[#A0A99D]">
              {candidate.metrics.verifiedProof}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A0A99D] hover:text-[#F4F6F1] hover:bg-[#1C211C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hero Profile Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#3A4337] shadow-xl"
                />
                {candidate.syncReadiness && (
                  <span
                    title="Synchronous Ready"
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#75D99A] border-2 border-[#101310] "
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-[#F4F6F1] tracking-tight">
                    {candidate.name}
                  </h2>
                  <span className="text-sm font-mono text-[#A0A99D]">
                    {candidate.handle}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#A0A99D] font-semibold mt-0.5">
                  {candidate.primaryRole}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#A0A99D] font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#697366]" />
                    {candidate.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#697366]" />
                    {candidate.timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Affinity Ring */}
            <div className="flex items-center gap-3 bg-[#161A16] p-3 rounded-xl border border-[#2B322A]">
              <MatchScoreRing score={candidate.matchScore} size={54} strokeWidth={5} />
              <div>
                <span className="text-xs font-mono font-bold text-[#F4F6F1] block">
                  {candidate.matchScore}% Synergy Fit
                </span>
                <span className="text-[10px] font-mono text-[#75D99A] block">
                  Top 2% Hackathon Affinity
                </span>
              </div>
            </div>
          </div>

          {/* Headline & Bio */}
          <div className="bg-[#161A16]/70 p-4 rounded-xl border border-[#2B322A] space-y-2">
            <h4 className="text-sm font-semibold text-[#F4F6F1]">
              {candidate.headline}
            </h4>
            <p className="text-xs text-[#D5DBD1] leading-relaxed">
              {candidate.bio}
            </p>
          </div>

          {/* Telemetry Metrics & Verification Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0A99D] mb-3 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#B7F36B]" />
              Telemetry & Proven Velocity
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#161A16] p-3 rounded-xl border border-[#2B322A]">
                <span className="text-[10px] font-mono text-[#A0A99D] block uppercase">
                  Annual Commits
                </span>
                <span className="text-base font-mono font-bold text-[#F4F6F1] mt-1 flex items-center gap-1">
                  <GitCommit className="w-4 h-4 text-[#A0A99D]" />
                  {candidate.metrics.githubCommits}
                </span>
              </div>

              <div className="bg-[#161A16] p-3 rounded-xl border border-[#2B322A]">
                <span className="text-[10px] font-mono text-[#A0A99D] block uppercase">
                  Hackathons Won
                </span>
                <span className="text-base font-mono font-bold text-[#75D99A] mt-1 flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#75D99A]" />
                  {candidate.metrics.hackathonsWon} First
                </span>
              </div>

              <div className="bg-[#161A16] p-3 rounded-xl border border-[#2B322A]">
                <span className="text-[10px] font-mono text-[#A0A99D] block uppercase">
                  Velocity Rank
                </span>
                <span className="text-xs font-mono font-bold text-[#B7F36B] mt-1.5 block truncate">
                  {candidate.metrics.speedRating}
                </span>
              </div>

              <div className="bg-[#161A16] p-3 rounded-xl border border-[#2B322A]">
                <span className="text-[10px] font-mono text-[#A0A99D] block uppercase">
                  Sync Readiness
                </span>
                <span className={`text-xs font-mono font-bold mt-1.5 block ${candidate.syncReadiness ? 'text-[#75D99A]' : 'text-[#A0A99D]'}`}>
                  {candidate.syncReadiness ? 'Synchronous Active' : 'Async Preferred'}
                </span>
              </div>
            </div>
          </div>

          {/* Verified Technical Stack Badges */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0A99D] mb-2">
              Verified Technical Stack & Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1C211C] border border-[#2B322A] text-xs font-mono text-[#F4F6F1]"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      skill.dotColor === 'cyan'
                        ? 'bg-[#A0A99D]'
                        : skill.dotColor === 'emerald'
                        ? 'bg-[#75D99A]'
                        : 'bg-[#B7F36B]'
                    }`}
                  />
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-[10px] text-[#A0A99D] border-l border-[#2B322A] pl-1.5">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Tracks */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0A99D] mb-2">
              Target Hackathon Tracks
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.tracks.map((track) => (
                <span
                  key={track}
                  className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30"
                >
                  {track}
                </span>
              ))}
            </div>
          </div>

          {/* Synapse Invite Transmission Box */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#161A16] to-[#090B09] border border-[#2B322A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#F4F6F1] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#B7F36B]" />
                Synapse Invite Message Pitch
              </span>
              <span className="text-[10px] font-mono text-[#A0A99D]">
                Encrypted via mesh beacon
              </span>
            </div>

            <textarea
              rows={3}
              value={customPitch}
              onChange={(e) => setCustomPitch(e.target.value)}
              className="w-full bg-[#101310] text-[#F4F6F1] text-xs font-mono p-3 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B] focus:ring-1 focus:ring-[#B7F36B]"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-mono text-[#D5DBD1] hover:text-[#F4F6F1] border border-[#2B322A] hover:bg-[#1C211C] transition-all"
              >
                Close
              </button>

              <button
                onClick={handleSendInvite}
                disabled={inviteSent}
                className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  inviteSent
                    ? 'bg-[#75D99A]/20 text-[#75D99A] border border-[#75D99A]/50 cursor-default'
                    : 'bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653]'
                }`}
              >
                {inviteSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Invitation Transmitted!
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Transmit Synapse Invite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
