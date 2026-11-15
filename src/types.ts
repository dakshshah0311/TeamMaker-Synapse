export type TrackType = 
  | 'Autonomous AI'
  | 'DePIN & Distributed'
  | 'Developer Tooling'
  | 'Zero Knowledge & Crypto'
  | 'BioTech & Climate';

export type RoleCategory = 
  | 'ML / AI Research'
  | 'Systems & Rust'
  | 'Full-Stack Web'
  | 'Smart Contracts'
  | 'Product & UX Craft';

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  skills: string[];
  techStack: string[];
  avatarStoragePath?: string;
  avatarUrl?: string;
}

export interface DeveloperSkill {
  name: string;
  level: 'Core' | 'Advanced' | 'Mastery';
  dotColor: 'cyan' | 'emerald' | 'violet';
}

export interface Candidate {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  headline: string;
  bio: string;
  primaryRole: RoleCategory;
  location: string;
  timezone: string;
  syncReadiness: boolean; // Synchronous readiness (Emerald)
  matchScore: number; // 0 - 100
  skills: DeveloperSkill[];
  tracks: TrackType[];
  radarCoords: {
    angle: number; // degrees 0-360
    distance: number; // 0.1 to 0.95 from center
  };
  metrics: {
    githubCommits: number;
    hackathonsWon: number;
    speedRating: string;
    verifiedProof: string;
  };
  preferredStack: string[];
  invited?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  isLead?: boolean;
}

export interface TeamVenture {
  id: string;
  title: string;
  tagline: string;
  description: string;
  track: TrackType;
  prizePoolTarget: string;
  matchScore: number;
  members: TeamMember[];
  maxMembers: number;
  criticalMissingRole?: string; // Rose badge if present
  requiredRoles: {
    title: string;
    filled: boolean;
    assignedTo?: string;
  }[];
  techStack: DeveloperSkill[];
  status: 'Forming' | 'Locked' | 'Sprinting';
  githubRepo?: string;
}

export interface HackathonMilestone {
  title: string;
  deadlineName: string;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  participantsCount: number;
  teamsFormed: number;
  prizePoolTotal: string;
}
