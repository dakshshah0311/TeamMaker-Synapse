import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { Candidate, TeamVenture, TrackType, RoleCategory, AccountProfile } from './types';
import { INITIAL_CANDIDATES, INITIAL_VENTURES, INITIAL_HACKATHON, INITIAL_ACTIVITY_LOGS } from './data/mockData';
import { Navbar, ActiveTab } from './components/Navbar';
import { AuthActionResult, AuthModal, AuthModalMode } from './components/AuthModal';
import { ProfilePage, ProfileUpdates } from './components/ProfilePage';
import { HackathonBanner } from './components/HackathonBanner';
import { RadarVisualizer } from './components/RadarVisualizer';
import { CandidateCard } from './components/CandidateCard';
import { TeamCard } from './components/TeamCard';
import { FilterRibbon } from './components/FilterRibbon';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { TeamAssemblerModal } from './components/TeamAssemblerModal';
import { TeamWorkspaceView } from './components/TeamWorkspaceView';
import { Radio, Users, Sparkles, Activity, CheckCircle, Wifi, Compass, Layers } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [teams, setTeams] = useState<TeamVenture[]>(INITIAL_VENTURES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [inspectModalCandidate, setInspectModalCandidate] = useState<Candidate | null>(null);
  const [isAssemblerOpen, setIsAssemblerOpen] = useState(false);
  const [activeWorkspaceTeam, setActiveWorkspaceTeam] = useState<TeamVenture>(INITIAL_VENTURES[0]);

  // Telemetry & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<TrackType | 'All'>('All');
  const [selectedRole, setSelectedRole] = useState<RoleCategory | 'All'>('All');
  const [minScore, setMinScore] = useState<number>(75);
  const [syncOnly, setSyncOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'wins' | 'commits'>('match');

  // User state
  const [userSyncReady, setUserSyncReady] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [requestedTeamIds, setRequestedTeamIds] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authProfile, setAuthProfile] = useState<AccountProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        if (error) showToast(`Unable to restore your session: ${error.message}`);
        setAuthUser(data.session?.user ?? null);
      } catch (error) {
        if (active) {
          showToast(`Unable to restore your session: ${error instanceof Error ? error.message : 'Please try again.'}`);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    void restoreSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [showToast]);

  useEffect(() => {
    if (!authUser) {
      setAuthProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);
    const metadata = authUser.user_metadata ?? {};
    const fallbackProfile: AccountProfile = {
      id: authUser.id,
      name: String(metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Synapse Member'),
      email: authUser.email || '',
      username: String(metadata.username || ''),
      bio: '',
      skills: [],
      techStack: [],
      avatarUrl: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined,
    };
    setAuthProfile(fallbackProfile);

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, username, bio, skills, tech_stack, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        if (!active) return;
        if (error) {
          showToast(`Unable to load your profile: ${error.message}`);
          return;
        }
        if (data) {
          let avatarUrl: string | undefined;
          let avatarStoragePath: string | undefined;
          if (data.avatar_url && !/^https?:\/\//i.test(data.avatar_url)) {
            const storedAvatarPath = data.avatar_url;
            avatarStoragePath = storedAvatarPath;
            const { data: signedImage, error: avatarError } = await supabase.storage
              .from('profile-avatars')
              .createSignedUrl(storedAvatarPath, 60 * 60);
            if (!active) return;
            if (avatarError) {
              showToast(`Unable to load your profile picture: ${avatarError.message}`);
            } else {
              avatarUrl = signedImage.signedUrl;
            }
          } else {
            avatarUrl = data.avatar_url || undefined;
          }
          setAuthProfile({
            ...fallbackProfile,
            name: data.name || fallbackProfile.name,
            email: data.email || fallbackProfile.email,
            username: data.username || fallbackProfile.username,
            bio: data.bio || '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            techStack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
            avatarStoragePath,
            avatarUrl,
          });
        } else {
          setAuthProfile(fallbackProfile);
        }
      } catch (error) {
        if (active) {
          showToast(`Unable to load your profile: ${error instanceof Error ? error.message : 'Please try again.'}`);
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    void loadProfile();

    return () => {
      active = false;
    };
  }, [authUser, showToast]);

  const handleSaveProfile = async (
    updates: ProfileUpdates,
    avatarFile: File | null
  ): Promise<AccountProfile> => {
    if (!authUser || !authProfile) throw new Error('Sign in before editing your profile.');

    let uploadedAvatarPath = '';
    if (avatarFile) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(avatarFile.type)) {
        throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
      }
      if (avatarFile.size > 5 * 1024 * 1024) {
        throw new Error('Profile pictures must be 5 MB or smaller.');
      }
      const extensionByType: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      uploadedAvatarPath = `${authUser.id}/${crypto.randomUUID()}.${extensionByType[avatarFile.type]}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(uploadedAvatarPath, avatarFile, {
          cacheControl: '3600',
          contentType: avatarFile.type,
          upsert: false,
        });
      if (uploadError) throw new Error(`Unable to upload profile picture: ${uploadError.message}`);
    }

    const storedAvatar = uploadedAvatarPath
      || authProfile.avatarStoragePath
      || authProfile.avatarUrl
      || null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          name: updates.name,
          email: authUser.email || '',
          username: updates.username,
          bio: updates.bio,
          skills: updates.skills,
          tech_stack: updates.techStack,
          avatar_url: storedAvatar,
        }, { onConflict: 'id' })
        .select('id, name, email, username, bio, skills, tech_stack, avatar_url')
        .single();
      if (error) throw new Error(`Unable to save profile: ${error.message}`);

      let avatarUrl: string | undefined;
      let avatarStoragePath: string | undefined;
      if (data.avatar_url && !/^https?:\/\//i.test(data.avatar_url)) {
        const storedAvatarPath = data.avatar_url;
        avatarStoragePath = storedAvatarPath;
        const { data: signedImage, error: avatarError } = await supabase.storage
          .from('profile-avatars')
          .createSignedUrl(storedAvatarPath, 60 * 60);
        if (avatarError) {
          showToast(`Profile saved, but the picture preview could not be loaded: ${avatarError.message}`);
        } else {
          avatarUrl = signedImage.signedUrl;
        }
      } else {
        avatarUrl = data.avatar_url || undefined;
      }

      const savedProfile: AccountProfile = {
        id: data.id,
        name: data.name,
        email: data.email || authUser.email || '',
        username: data.username || '',
        bio: data.bio || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        techStack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
        avatarStoragePath,
        avatarUrl,
      };
      setAuthProfile(savedProfile);

      if (uploadedAvatarPath && authProfile.avatarStoragePath?.startsWith(`${authUser.id}/`)) {
        const { error: removeError } = await supabase.storage
          .from('profile-avatars')
          .remove([authProfile.avatarStoragePath]);
        if (removeError) showToast(`Profile saved, but the previous picture could not be removed: ${removeError.message}`);
      }
      return savedProfile;
    } catch (error) {
      if (uploadedAvatarPath) {
        const { error: cleanupError } = await supabase.storage
          .from('profile-avatars')
          .remove([uploadedAvatarPath]);
        if (cleanupError) {
          throw new Error(`${error instanceof Error ? error.message : 'Unable to save profile.'} The uploaded picture could not be cleaned up: ${cleanupError.message}`);
        }
      }
      throw error;
    }
  };

  const handleSignup = async ({
    fullName,
    username,
    email,
    password,
  }: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<AuthActionResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
          username,
        },
      },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Supabase did not return a user for this registration.' };

    return {
      message: data.session
        ? 'Your account is ready. Welcome to TeamForge Synapse.'
        : 'Your account was created. Check your email to confirm it before signing in.',
    };
  };

  const handleLogin = async (email: string, password: string): Promise<AuthActionResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Supabase did not return a user for this login.' };

    return {
      message: 'You are signed in to TeamForge Synapse.',
    };
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Unable to log out: ${error.message}`);
      return;
    }
    showToast('You have been logged out.');
  };

  // Broadcast Beacon Simulation
  const handleBroadcastBeacon = () => {
    setIsBroadcasting(true);
    showToast('📡 Neural Beacon Broadcasted! Scanning 412 active hackathon peers...');

    setTimeout(() => {
      setIsBroadcasting(false);
      showToast('⚡ 3 new high-affinity candidates matched your project signature (98%, 95%, 92%)');
      // add to activity logs
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          text: 'Your Synapse Beacon detected 3 candidates with >92% skill complementarity',
          time: 'Just now',
          type: 'beacon',
        },
        ...prev,
      ]);
    }, 2500);
  };

  // Invite candidate
  const handleInviteCandidate = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, invited: true } : c))
    );
    const target = candidates.find((c) => c.id === candidateId);
    showToast(`✓ Synapse invite dispatched to ${target?.name || 'developer'}!`);

    setActivityLogs((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Transmitted roster invite to ${target?.name} (${target?.primaryRole})`,
        time: 'Just now',
        type: 'match',
      },
      ...prev,
    ]);
  };

  // Join Team Request
  const handleJoinRequest = (teamId: string) => {
    if (requestedTeamIds.includes(teamId)) return;
    setRequestedTeamIds((prev) => [...prev, teamId]);
    const targetTeam = teams.find((t) => t.id === teamId);
    showToast(`✓ Application transmitted to join "${targetTeam?.title}"!`);

    setActivityLogs((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Submitted credentials to "${targetTeam?.title}" for ${targetTeam?.criticalMissingRole || 'open slot'}`,
        time: 'Just now',
        type: 'match',
      },
      ...prev,
    ]);
  };

  // Inspect Team
  const handleInspectTeam = (team: TeamVenture) => {
    setActiveWorkspaceTeam(team);
    setActiveTab('warroom');
    showToast(`Entered War Room for "${team.title}"`);
  };

  // Create New Team
  const handleCreatedTeam = (newTeam: TeamVenture) => {
    setTeams((prev) => [newTeam, ...prev]);
    setActiveWorkspaceTeam(newTeam);
    showToast(`🚀 Venture "${newTeam.title}" registered & broadcasted to Genesis mesh!`);
  };

  // Filter & Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesHandle = c.handle.toLowerCase().includes(q);
          const matchesRole = c.primaryRole.toLowerCase().includes(q);
          const matchesSkill = c.skills.some((s) => s.name.toLowerCase().includes(q));
          const matchesBio = c.bio.toLowerCase().includes(q);
          if (!matchesName && !matchesHandle && !matchesRole && !matchesSkill && !matchesBio) {
            return false;
          }
        }

        // Track
        if (selectedTrack !== 'All' && !c.tracks.includes(selectedTrack)) {
          return false;
        }

        // Role
        if (selectedRole !== 'All' && c.primaryRole !== selectedRole) {
          return false;
        }

        // Min Score
        if (c.matchScore < minScore) {
          return false;
        }

        // Sync Only
        if (syncOnly && !c.syncReadiness) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'wins') return b.metrics.hackathonsWon - a.metrics.hackathonsWon;
        if (sortBy === 'commits') return b.metrics.githubCommits - a.metrics.githubCommits;
        return 0;
      });
  }, [candidates, searchQuery, selectedTrack, selectedRole, minScore, syncOnly, sortBy]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesTag = t.tagline.toLowerCase().includes(q);
        const matchesStack = t.techStack.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTag && !matchesStack) return false;
      }
      if (selectedTrack !== 'All' && t.track !== selectedTrack) {
        return false;
      }
      return true;
    });
  }, [teams, searchQuery, selectedTrack]);

  const pendingInvitesCount = candidates.filter((c) => c.invited).length;

  return (
    <div className="min-h-screen bg-[#090B09] text-[#F4F6F1] relative selection:bg-[#B7F36B]/25 selection:text-[#F4F6F1]">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAssembler={() => setIsAssemblerOpen(true)}
        pendingInvitesCount={pendingInvitesCount}
        userSyncReady={userSyncReady}
        onToggleSyncReady={() => {
          setUserSyncReady(!userSyncReady);
          showToast(!userSyncReady ? 'Sync Status: [Synchronous Ready]' : 'Sync Status: [Async Idle]');
        }}
        authProfile={authProfile}
        authLoading={authLoading}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onViewProfile={() => {
          setActiveTab('profile');
        }}
      />

      {/* Main Container */}
      <main className="page-enter relative z-10 mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Hackathon Milestone Banner */}
        {activeTab !== 'profile' && <HackathonBanner milestone={INITIAL_HACKATHON} />}

        {/* Global Live Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-[#2B322A] bg-[#161A16] px-4 py-3 text-xs text-[#F4F6F1] shadow-xl">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#B7F36B] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            profile={authProfile}
            isLoading={profileLoading || authLoading}
            onBack={() => setActiveTab('radar')}
            onOpenLogin={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onSave={handleSaveProfile}
          />
        )}

        {/* VIEW 1: Radar & Match Feed */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#A0A99D]">DISCOVER</p>
                <h1 className="mt-1 text-2xl font-semibold text-[#F4F6F1] sm:text-3xl">
                  Build with the right people.
                </h1>
                <p className="mt-1 max-w-xl text-sm text-[#A0A99D]">
                  Find collaborators whose skills and working style complement yours.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-lg border border-[#2B322A] bg-[#101310] px-3 py-2 text-xs text-[#A0A99D] sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-[#75D99A]" />
                {filteredCandidates.length} people in your feed
              </div>
            </div>

            {/* Signature Live Match Engine Radar Visualizer */}
            <RadarVisualizer
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={(cand) => {
                setSelectedCandidate(cand);
                setInspectModalCandidate(cand);
              }}
              onBroadcastBeacon={handleBroadcastBeacon}
              isBroadcasting={isBroadcasting}
            />

            {/* Precision Filtering & Search Ribbon */}
            <FilterRibbon
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTrack={selectedTrack}
              onTrackChange={setSelectedTrack}
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              syncOnly={syncOnly}
              onSyncOnlyToggle={() => setSyncOnly(!syncOnly)}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Candidates Discovery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-[#F4F6F1] tracking-tight">
                    People to build with
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30">
                    {filteredCandidates.length} people
                  </span>
                </div>

                <span className="text-xs font-mono text-[#A0A99D]">
                  Sorted by: <span className="text-[#F4F6F1] font-semibold capitalize">{sortBy}</span>
                </span>
              </div>

              {filteredCandidates.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center border border-[#2B322A]">
                  <Compass className="w-10 h-10 text-[#697366] mx-auto mb-3 animate-pulse" />
                  <h3 className="text-base font-semibold text-[#F4F6F1] mb-1">
                    No candidates found in this frequency
                  </h3>
                  <p className="text-xs text-[#A0A99D] max-w-sm mx-auto mb-4 font-mono">
                    Try broadening your track, lowering the minimum fit threshold, or disabling synchronous filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTrack('All');
                      setSelectedRole('All');
                      setMinScore(70);
                      setSyncOnly(false);
                    }}
                    className="px-4 py-2 rounded-full bg-[#161A16] hover:bg-[#1C211C] text-[#F4F6F1] text-xs font-mono border border-[#2B322A] transition-all"
                  >
                    Reset Filter Ribbon
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCandidates.map((cand) => (
                    <CandidateCard
                      key={cand.id}
                      candidate={cand}
                      onInspect={(c) => setInspectModalCandidate(c)}
                      onInvite={handleInviteCandidate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Realtime Synapse Activity Log Ribbon */}
            <div className="glass-panel rounded-xl p-4 border border-[#2B322A] mt-8">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-mono uppercase tracking-wider text-[#A0A99D]">
                <Activity className="w-3.5 h-3.5 text-[#A0A99D]" />
                Recent activity
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activityLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#161A16] p-2.5 rounded-lg border border-[#2B322A] text-[11px] font-mono text-[#D5DBD1] flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7F36B] mt-1.5 shrink-0" />
                    <div>
                      <span className="block">{log.text}</span>
                      <span className="text-[10px] text-[#697366]">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Venture Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-extrabold text-[#F4F6F1] tracking-tight">
                  Find your venture team
                </h1>
                <p className="text-xs text-[#A0A99D] mt-1 font-mono">
                  Explore teams, open roles, and projects looking for collaborators.
                </p>
              </div>

              <button
                onClick={() => setIsAssemblerOpen(true)}
                className="px-5 py-2 rounded-lg bg-[#B7F36B] hover:bg-[#A5E653] text-[#090B09] text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Assemble Your Squad
              </button>
            </div>

            {/* Track Filter Filter for teams */}
            <FilterRibbon
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTrack={selectedTrack}
              onTrackChange={setSelectedTrack}
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              syncOnly={syncOnly}
              onSyncOnlyToggle={() => setSyncOnly(!syncOnly)}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onJoinRequest={handleJoinRequest}
                  onInspectTeam={handleInspectTeam}
                  hasRequested={requestedTeamIds.includes(team.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: Synapse War Room */}
        {activeTab === 'warroom' && (
          <TeamWorkspaceView
            team={activeWorkspaceTeam}
            onOpenAssembler={() => setIsAssemblerOpen(true)}
          />
        )}
      </main>

      {/* Candidate Deep Dive Inspection Modal */}
      <CandidateDetailModal
        candidate={inspectModalCandidate}
        onClose={() => setInspectModalCandidate(null)}
        onInvite={handleInviteCandidate}
      />

      {/* Assemble Venture Team Modal */}
      <TeamAssemblerModal
        isOpen={isAssemblerOpen}
        onClose={() => setIsAssemblerOpen(false)}
        onCreatedTeam={handleCreatedTeam}
        candidates={candidates}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthModalMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </div>
  );
}
