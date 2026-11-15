import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageSquare,
  Plus,
  Radio,
  UserRound,
  Users,
} from 'lucide-react';
import type { AccountProfile } from '../types';
import type { AuthModalMode } from './AuthModal';

export type ActiveTab = 'radar' | 'teams' | 'warroom' | 'profile';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAssembler: () => void;
  pendingInvitesCount: number;
  userSyncReady: boolean;
  onToggleSyncReady: () => void;
  authProfile: AccountProfile | null;
  authLoading: boolean;
  onOpenAuth: (mode: AuthModalMode) => void;
  onLogout: () => void | Promise<void>;
  onViewProfile: () => void;
}

const navigationItems: { id: ActiveTab; label: string; icon: typeof Radio }[] = [
  { id: 'radar', label: 'Radar & Match Feed', icon: Radio },
  { id: 'teams', label: 'Venture Teams', icon: Users },
  { id: 'warroom', label: 'Team War Room', icon: MessageSquare },
];

export function Navbar({
  activeTab,
  onTabChange,
  onOpenAssembler,
  pendingInvitesCount,
  userSyncReady,
  onToggleSyncReady,
  authProfile,
  authLoading,
  onOpenAuth,
  onLogout,
  onViewProfile,
}: NavbarProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const openTab = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsAccountMenuOpen(false);
  };

  const displayName = authProfile?.name || authProfile?.username || 'Your account';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-[#2B322A] bg-[#090B09]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => openTab('radar')}
          className="flex shrink-0 items-center gap-2.5 rounded-lg text-left"
          aria-label="TeamForge Synapse home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#B7F36B] text-[#090B09]">
            <Radio size={17} strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-semibold tracking-tight text-[#F4F6F1]">
              TeamForge
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-[#A0A99D]">
              SYNAPSE
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          {navigationItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => openTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1C211C] text-[#B7F36B]'
                    : 'text-[#A0A99D] hover:bg-[#161A16] hover:text-[#F4F6F1]'
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSyncReady}
            className="flex h-9 w-9 items-center justify-center gap-2 rounded-full border border-[#2B322A] text-[11px] font-medium text-[#A0A99D] transition-colors hover:border-[#4A5447] hover:text-[#F4F6F1] md:h-auto md:w-auto md:px-2.5 md:py-1.5"
            aria-label={`Toggle availability, currently ${userSyncReady ? 'available' : 'away'}`}
            title="Toggle availability"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${userSyncReady ? 'bg-[#75D99A]' : 'bg-[#697366]'}`} />
            <span className="hidden md:inline">{userSyncReady ? 'Available to sync' : 'Away'}</span>
          </button>

          <button
            type="button"
            onClick={() => openTab('teams')}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-[#A0A99D] transition-colors hover:bg-[#161A16] hover:text-[#F4F6F1]"
            aria-label={`Team invitations${pendingInvitesCount ? `, ${pendingInvitesCount} pending` : ''}`}
            title="Team invitations"
          >
            <Bell size={17} strokeWidth={1.8} />
            {pendingInvitesCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#B7F36B] px-1 text-[9px] font-semibold text-[#090B09]">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAssembler}
            className="hidden h-9 items-center gap-1.5 rounded-lg bg-[#B7F36B] px-3 text-[12px] font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653] md:flex"
          >
            <Plus size={15} strokeWidth={2.2} />
            Assemble Venture
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-1.5 rounded-lg pl-1 transition-colors hover:bg-[#161A16]"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              aria-label={authProfile ? `Account menu for ${displayName}` : 'Open account menu'}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-[#3A4337] bg-[#1C211C] text-[10px] font-semibold text-[#B7F36B]">
                {authProfile?.avatarUrl ? (
                  <img src={authProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : authLoading ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-[#697366] border-t-[#B7F36B]" />
                ) : authProfile ? (
                  initials
                ) : (
                  <UserRound size={15} />
                )}
              </span>
              <ChevronDown size={13} className="mr-1 text-[#697366]" />
            </button>

            {isAccountMenuOpen && (
              <div
                role="menu"
                className="menu-enter absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-xl border border-[#2B322A] bg-[#101310] p-1.5 shadow-xl"
              >
                {authProfile ? (
                  <>
                    <div className="border-b border-[#2B322A] px-3 py-2.5">
                      <p className="truncate text-sm font-medium text-[#F4F6F1]">{displayName}</p>
                      <p className="mt-0.5 truncate text-xs text-[#A0A99D]">{authProfile.email}</p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onViewProfile();
                        setIsAccountMenuOpen(false);
                      }}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#A0A99D] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
                    >
                      <UserRound size={15} />
                      View Profile
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        void onLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#A0A99D] transition-colors hover:bg-[#1C211C] hover:text-[#F07878]"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-medium text-[#F4F6F1]">Welcome to Synapse</p>
                      <p className="mt-0.5 text-xs text-[#A0A99D]">Sign in to find your people.</p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpenAuth('login');
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#B7F36B] transition-colors hover:bg-[#1C211C]"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpenAuth('signup');
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#A0A99D] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
                    >
                      Create an account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-0 overflow-x-auto border-t border-[#2B322A] px-1.5 py-2 xl:hidden" aria-label="Mobile navigation">
        {navigationItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => openTab(id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={`flex h-9 shrink-0 items-center gap-1 rounded-lg px-1 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 ${
                isActive
                  ? 'bg-[#1C211C] text-[#B7F36B]'
                  : 'text-[#A0A99D] hover:bg-[#161A16] hover:text-[#F4F6F1]'
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">
                {id === 'radar' ? 'Radar' : id === 'teams' ? 'Teams' : 'War Room'}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenAssembler}
          className="ml-auto flex h-9 shrink-0 items-center gap-1 rounded-lg bg-[#B7F36B] px-1 text-xs font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653] md:hidden"
        >
          <Plus size={14} />
          Assemble
        </button>
      </nav>
    </header>
  );
}
