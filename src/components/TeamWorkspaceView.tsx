import React, { useState } from 'react';
import { TeamVenture } from '../types';
import { Terminal, Send, CheckCircle2, Clock, GitBranch, GitPullRequest, Mic, MicOff, Users, Shield, Cpu, Play } from 'lucide-react';

interface TeamWorkspaceViewProps {
  team: TeamVenture;
  onOpenAssembler: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  role: string;
}

export const TeamWorkspaceView: React.FC<TeamWorkspaceViewProps> = ({ team, onOpenAssembler }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Tariq Hassan',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'Founder & AI Lead',
      text: 'Synced with the hackathon judges on our vLLM chunking strategy. If we offload the key-value cache to distributed RAM, we drop p99 latency by 68%.',
      time: '12:14 PM',
    },
    {
      id: 'm2',
      sender: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'Systems & CUDA',
      text: 'Pushed the raw Triton kernel benchmarks to branch `perf/kernel-opt`. The custom FP8 tensor core accumulation is running at 94% theoretical peak TFLOPs.',
      time: '12:18 PM',
    },
    {
      id: 'm3',
      sender: 'Lina Vance',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      role: 'Full-Stack Lead',
      text: 'Connected the WebGL radar dashboard with live WebSocket feeds from the inference node cluster. Visualizing tensor partitions in real time now!',
      time: '12:22 PM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '⚡ SYNAPSE BUILD RUNNER v3.1',
    '✓ Loaded 4 node cluster configs',
    '✓ Compiled triton_kv_cache.cu [0.84s]',
    '✓ All 24 formal verification invariants hold',
    '● Live cluster status: 4 peers connected (14ms ping)',
  ]);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Tariq Hassan (You)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'Founder & Lead',
      text: inputText.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate instant teammate response
    setTimeout(() => {
      const responses = [
        'Merged your latest changes. Testing the telemetry integration right away!',
        'Benchmark verified. Our score for the Autonomous AI track just jumped to 98.4.',
        'Great call on the state synchronization logic. Deploying to demo cluster.',
      ];
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        role: 'Systems & CUDA',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleRunBuild = () => {
    setIsCompiling(true);
    setTerminalOutput((prev) => [...prev, '$ cargo test --release --all-targets', 'Compiling synapse-core v0.1.0...']);
    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        'Running 18 unit tests and 4 integration benchmarks...',
        'test tensor::test_kv_chunking ... ok (0.002s)',
        'test consensus::test_peer_sync ... ok (0.014s)',
        '✓ ALL TESTS PASSED (0 warnings) - Ready for Submission',
      ]);
      setIsCompiling(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Team Top Header */}
      <div className="glass-panel rounded-2xl p-6 border border-[#2B322A] rim-light-top">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#B7F36B]/20 text-[#B7F36B] border border-[#B7F36B]/40">
                {team.track}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[#A0A99D] bg-[#A0A99D]/10 border border-[#A0A99D]/30">
                {team.prizePoolTarget}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#75D99A]/15 text-[#75D99A] border border-[#75D99A]/30">
                ROSTER ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-[#F4F6F1] tracking-tight">
              {team.title}
            </h1>
            <p className="text-xs text-[#D5DBD1] mt-1 max-w-2xl">
              {team.tagline}
            </p>
          </div>

          {/* Voice Channel Simulator & Repo Link */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsVoiceConnected(!isVoiceConnected)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-medium flex items-center gap-2 transition-all ${
                isVoiceConnected
                  ? 'bg-[#75D99A]/20 text-[#75D99A] border border-[#75D99A]/40 '
                  : 'bg-[#161A16] text-[#D5DBD1] border border-[#2B322A] hover:text-[#F4F6F1]'
              }`}
            >
              {isVoiceConnected ? (
                <>
                  <Mic className="w-4 h-4 animate-pulse text-[#75D99A]" />
                  Voice Connected (4 Active)
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  Join Team Voice Room
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#161A16] border border-[#2B322A] text-xs font-mono text-[#D5DBD1]">
              <GitBranch className="w-3.5 h-3.5 text-[#B7F36B]" />
              <span>{team.githubRepo || 'synapse-core/main'}</span>
            </div>
          </div>
        </div>

        {/* Milestone Sprint Bar */}
        <div className="mt-6 pt-5 border-t border-[#2B322A]">
          <div className="flex items-center justify-between text-xs font-mono text-[#A0A99D] mb-2">
            <span className="font-semibold text-[#F4F6F1]">Sprint Milestones</span>
            <span className="text-[#A0A99D] font-bold">Progress: 75% MVP Reached</span>
          </div>

          <div className="w-full bg-[#161A16] h-2 rounded-full overflow-hidden mb-3 border border-[#2B322A]">
            <div
              className="bg-[#B7F36B] h-full rounded-full transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#161A16] border border-[#2B322A] flex items-center gap-2 text-[#75D99A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. Architecture Spec</span>
            </div>
            <div className="p-2 rounded-lg bg-[#161A16] border border-[#2B322A] flex items-center gap-2 text-[#75D99A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Core Model Pipeline</span>
            </div>
            <div className="p-2 rounded-lg bg-[#161A16] border border-[#A0A99D]/30 flex items-center gap-2 text-[#A0A99D] ">
              <Clock className="w-4 h-4 shrink-0 animate-spin" />
              <span>3. Telemetry Integration</span>
            </div>
            <div className="p-2 rounded-lg bg-[#090B09] border border-dashed border-[#2B322A] flex items-center gap-2 text-[#697366]">
              <Shield className="w-4 h-4 shrink-0" />
              <span>4. Final Devpost Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main War Room Grid: Chat on Left, Roster & Terminal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat / Architecture Stream (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-[#2B322A] flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B322A] mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#B7F36B]" />
              <h3 className="font-display font-semibold text-[#F4F6F1] text-sm">
                Synapse War Room Channel #architecture
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#75D99A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#75D99A] animate-pulse" />
              Realtime Synchronized
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-9 h-9 rounded-xl object-cover border border-[#2B322A] shrink-0"
                />
                <div className="flex-1 bg-[#161A16]/80 rounded-xl p-3 border border-[#2B322A]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F4F6F1]">
                        {msg.sender}
                      </span>
                      <span className="text-[10px] font-mono text-[#A0A99D] bg-[#A0A99D]/10 px-1.5 py-0.2 rounded">
                        {msg.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#697366]">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#D5DBD1] leading-relaxed font-sans">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-[#2B322A] flex gap-2">
            <input
              type="text"
              placeholder="Send message to team war room (e.g. 'Pushed commit for latency benchmarks')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#090B09] text-[#F4F6F1] text-xs font-mono px-3 py-2 rounded-lg border border-[#2B322A] focus:outline-none focus:border-[#B7F36B]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#B7F36B] text-[#090B09] hover:bg-[#A5E653] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Transmit
            </button>
          </form>
        </div>

        {/* Right Side: Roster & Terminal Runner (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Roster Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-[#2B322A]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2B322A]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A0A99D] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#A0A99D]" />
                Roster Members ({team.members.length})
              </span>
              <button
                onClick={onOpenAssembler}
                className="text-[11px] font-mono text-[#B7F36B] hover:underline"
              >
                + Add Roles
              </button>
            </div>

            <div className="space-y-2.5">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl bg-[#161A16] border border-[#2B322A] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#2B322A]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#F4F6F1]">
                          {member.name}
                        </span>
                        {member.isLead && (
                          <span className="text-[9px] font-mono bg-[#B7F36B]/20 text-[#B7F36B] px-1 rounded border border-[#B7F36B]/30">
                            LEAD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#A0A99D]">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-[#75D99A] animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Synapse Terminal Test Runner */}
          <div className="glass-panel rounded-2xl p-5 border border-[#2B322A] flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#A0A99D] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#75D99A]" />
                Cluster Build Runner
              </span>
              <button
                onClick={handleRunBuild}
                disabled={isCompiling}
                className="px-2.5 py-1 rounded bg-[#75D99A]/15 border border-[#75D99A]/30 hover:bg-[#75D99A]/25 text-[#75D99A] text-[11px] font-mono flex items-center gap-1 transition-all"
              >
                <Play className="w-3 h-3" />
                {isCompiling ? 'Running...' : 'Run Test Suite'}
              </button>
            </div>

            <div className="flex-1 bg-[#090B09] rounded-xl p-3 border border-[#2B322A] font-mono text-[11px] overflow-y-auto space-y-1 scrollbar-thin">
              {terminalOutput.map((line, idx) => (
                <div
                  key={idx}
                  className={`${
                    line.startsWith('✓')
                      ? 'text-[#75D99A]'
                      : line.startsWith('$')
                      ? 'text-[#A0A99D] font-bold'
                      : line.startsWith('●')
                      ? 'text-[#B7F36B]'
                      : 'text-[#A0A99D]'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
