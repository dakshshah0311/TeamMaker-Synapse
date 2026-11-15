import React, { useState } from 'react';
import { TrackType, RoleCategory, TeamVenture, Candidate } from '../types';
import { X, Sparkles, Plus, Trash2, Cpu, Check, Users, ArrowRight } from 'lucide-react';

interface TeamAssemblerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatedTeam: (newTeam: TeamVenture) => void;
  candidates: Candidate[];
}

export const TeamAssemblerModal: React.FC<TeamAssemblerModalProps> = ({
  isOpen,
  onClose,
  onCreatedTeam,
  candidates,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [track, setTrack] = useState<TrackType>('Autonomous AI');
  const [prizePoolTarget, setPrizePoolTarget] = useState('$75,000 Grand Prize Track');
  const [criticalMissingRole, setCriticalMissingRole] = useState('CRITICAL: Lead Systems / Rust Architect');

  // Role slots
  const [roles, setRoles] = useState([
    { title: 'Founder & AI Lead', filled: true, assignedTo: 'You (Current Builder)' },
    { title: 'Lead Systems / Rust Architect', filled: false },
    { title: 'High-Craft UI/UX Engineer', filled: false },
    { title: 'ZK & Security Researcher', filled: false },
  ]);

  const [newRoleTitle, setNewRoleTitle] = useState('');

  // Selected tech stack
  const [selectedStack, setSelectedStack] = useState<string[]>([
    'Rust',
    'CUDA',
    'PyTorch',
    'Next.js',
  ]);

  const handleAddRole = () => {
    if (!newRoleTitle.trim()) return;
    setRoles([...roles, { title: newRoleTitle.trim(), filled: false }]);
    setNewRoleTitle('');
  };

  const handleRemoveRole = (index: number) => {
    if (index === 0) return; // keep founder
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleToggleTech = (tech: string) => {
    if (selectedStack.includes(tech)) {
      setSelectedStack(selectedStack.filter((t) => t !== tech));
    } else {
      setSelectedStack([...selectedStack, tech]);
    }
  };

  const handleAssemble = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTeam: TeamVenture = {
      id: `team-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'Next-generation distributed intelligence engine',
      description: description.trim() || 'Assembling an elite multidisciplinary squad for the hackathon frontier prize tracks.',
      track,
      prizePoolTarget,
      matchScore: 96,
      status: 'Forming',
      members: [
        {
          id: 'tm-you',
          name: 'Tariq Hassan',
          handle: '@tariqh',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          role: roles[0]?.title || 'Founder & Lead',
          isLead: true,
        },
      ],
      maxMembers: roles.length,
      criticalMissingRole: criticalMissingRole.trim() || undefined,
      requiredRoles: roles,
      techStack: selectedStack.map((name) => ({
        name,
        level: 'Mastery' as const,
        dotColor: name === 'Rust' || name === 'Next.js' ? 'cyan' : name === 'PyTorch' ? 'violet' : 'emerald',
      })),
      githubRepo: `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/core-repo`,
    };

    onCreatedTeam(newTeam);
    onClose();
  };

  // Preview matching candidates from candidates pool
  const matchingCandidates = candidates.filter(c => 
    c.skills.some(s => selectedStack.includes(s.name))
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#101310] border border-[#3A4337] rounded-2xl overflow-hidden shadow-xl rim-light-top max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2B322A] bg-[#161A16]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B7F36B]/20 border border-[#B7F36B]/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#B7F36B]" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-[#F4F6F1] tracking-tight">
                Venture Assembly Studio
              </h2>
              <p className="text-xs font-mono text-[#A0A99D]">
                Initialize new hackathon squad & register open role beacon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A0A99D] hover:text-[#F4F6F1] hover:bg-[#1C211C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleAssemble} className="p-6 overflow-y-auto space-y-6">
          {/* Venture Title & Track */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D5DBD1] mb-1.5">
                Venture Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HyperStark Autonomous Protocol"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161A16] text-[#F4F6F1] text-xs font-mono p-2.5 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B] focus:ring-1 focus:ring-[#B7F36B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D5DBD1] mb-1.5">
                Target Hackathon Track
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as TrackType)}
                className="w-full bg-[#161A16] text-[#F4F6F1] text-xs font-mono p-2.5 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B]"
              >
                <option value="Autonomous AI">Autonomous AI</option>
                <option value="DePIN & Distributed">DePIN & Distributed</option>
                <option value="Developer Tooling">Developer Tooling</option>
                <option value="Zero Knowledge & Crypto">Zero Knowledge & Crypto</option>
                <option value="BioTech & Climate">BioTech & Climate</option>
              </select>
            </div>
          </div>

          {/* Elevator Tagline */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#D5DBD1] mb-1.5">
              Elevator Tagline & Mission
            </label>
            <input
              type="text"
              placeholder="e.g. Decentralized sub-millisecond LLM KV-cache offloading with zero-knowledge batch proofs"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#161A16] text-[#F4F6F1] text-xs font-mono p-2.5 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B]"
            />
          </div>

          {/* Detailed Problem / Architecture Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#D5DBD1] mb-1.5">
              Architecture & Hackathon Thesis
            </label>
            <textarea
              rows={2}
              placeholder="Describe your technical architecture, models, or consensus mechanism..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161A16] text-[#F4F6F1] text-xs font-mono p-2.5 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B]"
            />
          </div>

          {/* Critical Missing Role Banner */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#F07878] mb-1.5">
              High-Priority Critical Role Alert (Rose Beacon)
            </label>
            <input
              type="text"
              placeholder="e.g. CRITICAL: Lead Systems / Rust Architect"
              value={criticalMissingRole}
              onChange={(e) => setCriticalMissingRole(e.target.value)}
              className="w-full bg-[#161A16] text-[#F4F6F1] text-xs font-mono p-2.5 rounded-lg border border-[#F07878]/30 focus:outline-none focus:border-[#F07878]"
            />
          </div>

          {/* Roster Slots Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#D5DBD1] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#B7F36B]" />
                Roster Slots Configuration ({roles.length} total)
              </label>
            </div>

            <div className="space-y-2 mb-3">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#161A16] border border-[#2B322A] text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        role.filled ? 'bg-[#75D99A]' : 'bg-[#F07878] animate-pulse'
                      }`}
                    />
                    <span className="text-[#F4F6F1] font-medium">{role.title}</span>
                    <span className="text-[#697366] text-[11px]">
                      {role.filled ? `• ${role.assignedTo}` : '• Open Slot'}
                    </span>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="p-1 text-[#697366] hover:text-[#F07878] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Role input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom role slot (e.g. Lead Triton Kernel Optimizer)"
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                className="flex-1 bg-[#090B09] text-[#F4F6F1] text-xs font-mono px-3 py-2 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B]"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-2 rounded-lg bg-[#1C211C] hover:bg-[#1C211C] text-[#F4F6F1] text-xs font-mono border border-[#2B322A] flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slot
              </button>
            </div>
          </div>

          {/* Tech Stack Chips Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#D5DBD1] mb-2">
              Required Tech Stack Signature
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Rust',
                'CUDA',
                'PyTorch',
                'Triton',
                'Next.js',
                'TypeScript',
                'Solidity',
                'Circom',
                'Go',
                'Wasm',
                'vLLM',
                'LangGraph',
              ].map((tech) => {
                const isSelected = selectedStack.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleToggleTech(tech)}
                    className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#B7F36B]/20 border border-[#B7F36B] text-[#F4F6F1] font-medium '
                        : 'bg-[#1C211C] border border-[#2B322A] text-[#A0A99D] hover:text-[#F4F6F1]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-[#B7F36B]' : 'bg-[#697366]'
                      }`}
                    />
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant Synapse Match Recommendations Preview */}
          {matchingCandidates.length > 0 && (
            <div className="p-4 rounded-xl bg-[#161A16] border border-[#2B322A]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-mono font-semibold text-[#F4F6F1] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A0A99D]" />
                  Instant Neural Radar Recommendations
                </span>
                <span className="text-[10px] font-mono text-[#75D99A]">
                  Auto-matched from telemetry mesh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {matchingCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-2.5 rounded-lg bg-[#090B09] border border-[#2B322A] flex items-center gap-2.5"
                  >
                    <img
                      src={cand.avatar}
                      alt={cand.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <span className="block text-xs font-medium text-[#F4F6F1] truncate">
                        {cand.name}
                      </span>
                      <span className="block text-[10px] font-mono text-[#A0A99D]">
                        {cand.matchScore}% Match • {cand.primaryRole}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#2B322A] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A0A99D]">
              Roster lock status: Registered on Genesis Mesh
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-mono text-[#D5DBD1] hover:text-[#F4F6F1] border border-[#2B322A] hover:bg-[#1C211C] transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653] flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Broadcast Venture to Mesh
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
