import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Cpu,
  ImagePlus,
  LoaderCircle,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { AccountProfile } from '../types';

export interface ProfileUpdates {
  name: string;
  username: string;
  bio: string;
  skills: string[];
  techStack: string[];
}

interface ProfilePageProps {
  profile: AccountProfile | null;
  isLoading: boolean;
  onBack: () => void;
  onOpenLogin: () => void;
  onSave: (updates: ProfileUpdates, avatarFile: File | null) => Promise<AccountProfile>;
}

const parseTags = (value: string) =>
  Array.from(new Set(value.split(',').map((item) => item.trim()).filter(Boolean)));

const inputClassName =
  'w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  isLoading,
  onBack,
  onOpenLogin,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [techStack, setTechStack] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setSkills(profile.skills.join(', '));
    setTechStack(profile.techStack.join(', '));
    setAvatarFile(null);
    setErrorMessage(null);
  }, [profile]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const avatarSrc = avatarPreview || profile?.avatarUrl;
  const initials = useMemo(
    () => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U',
    [name]
  );

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrorMessage('Choose a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Profile pictures must be 5 MB or smaller.');
      return;
    }
    setAvatarFile(file);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    if (!trimmedName) {
      setErrorMessage('Enter your full name.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(trimmedUsername)) {
      setErrorMessage('Username must be 3–24 characters using letters, numbers, or underscores.');
      return;
    }
    if (bio.length > 500) {
      setErrorMessage('Bio must be 500 characters or fewer.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: trimmedName,
        username: trimmedUsername,
        bio: bio.trim(),
        skills: parseTags(skills),
        techStack: parseTags(techStack),
      }, avatarFile);
      setAvatarFile(null);
      setSuccessMessage('Profile saved successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-xs font-mono text-[#A0A99D] transition-colors hover:text-[#F4F6F1]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Synapse
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A0A99D]">Identity Console</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#F4F6F1] sm:text-3xl">
            Your Profile
          </h1>
          <p className="mt-1 text-xs text-[#A0A99D]">Shape the profile your future teammates will see.</p>
        </div>
        {profile && (
          <div className="flex items-center gap-2 self-start rounded-full border border-[#75D99A]/20 bg-[#75D99A]/10 px-3 py-1.5 font-mono text-[10px] text-[#75D99A] sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            PRIVATE ACCOUNT
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="glass-panel flex min-h-64 items-center justify-center rounded-2xl border border-[#2B322A]">
          <div className="flex items-center gap-3 font-mono text-xs text-[#A0A99D]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#A0A99D]" />
            Loading your profile...
          </div>
        </div>
      ) : !profile ? (
        <div className="glass-panel rounded-2xl border border-[#2B322A] p-8 text-center sm:p-12">
          <UserRound className="mx-auto mb-4 h-10 w-10 text-[#B7F36B]" />
          <h2 className="font-display text-lg font-bold text-[#F4F6F1]">Sign in to view your profile</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#A0A99D]">
            Your profile is private and only available to your authenticated account.
          </p>
          <button
            type="button"
            onClick={onOpenLogin}
            className="mt-6 rounded-xl bg-[#B7F36B] px-5 py-2.5 text-sm font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653]"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.5fr]">
          <aside className="glass-panel h-fit rounded-2xl border border-[#2B322A] p-5 sm:p-6">
            <div className="relative mx-auto mb-4 w-fit">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-[#B7F36B]/40 bg-gradient-to-br from-[#B7F36B]/30 to-[#A0A99D]/10 text-2xl font-bold text-[#F4F6F1] ">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={`${name || profile.name}'s profile`} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#B7F36B]/50 bg-[#161A16] text-[#B7F36B] shadow-lg transition-colors hover:bg-[#B7F36B]/20">
                <ImagePlus className="h-4 w-4" />
                <span className="sr-only">Upload profile picture</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-center font-display text-lg font-bold text-[#F4F6F1]">{name || profile.name}</p>
            <p className="mt-1 text-center font-mono text-xs text-[#A0A99D]">
              {username ? `@${username}` : 'Set your username'}
            </p>
            <p className="mt-3 break-all text-center text-xs text-[#A0A99D]">{profile.email}</p>
            <p className="mt-5 border-t border-[#2B322A] pt-4 text-center text-[10px] leading-relaxed text-[#697366]">
              JPG, PNG, WebP, or GIF · up to 5 MB
            </p>
            {profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#B7F36B]/25 bg-[#B7F36B]/10 px-2.5 py-1 text-[10px] text-[#B7F36B]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </aside>

          <form onSubmit={handleSave} className="glass-panel space-y-5 rounded-2xl border border-[#2B322A] p-5 sm:p-6">
            {errorMessage && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#F07878]/30 bg-[#F07878]/10 p-3 text-xs leading-relaxed text-[#F07878]">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-[#F07878]" />
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-[#75D99A]/25 bg-[#75D99A]/10 p-3 text-xs text-[#75D99A]">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#75D99A]" />
                {successMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Full name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required className={inputClassName} placeholder="Your name" />
              </label>
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={24} required className={inputClassName} placeholder="synapse_handle" />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Email</span>
              <input value={profile.email} readOnly className={`${inputClassName} cursor-not-allowed text-[#697366]`} />
              <span className="block text-[10px] text-[#697366]">Email is managed securely by Supabase Authentication.</span>
            </label>

            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Bio</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                rows={4}
                className={`${inputClassName} resize-y`}
                placeholder="Tell potential teammates what you build..."
              />
              <span className="block text-right font-mono text-[10px] text-[#697366]">{bio.length}/500</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">
                  <Cpu className="h-3.5 w-3.5 text-[#A0A99D]" /> Skills
                </span>
                <input value={skills} onChange={(event) => setSkills(event.target.value)} maxLength={500} className={inputClassName} placeholder="Rust, ML, Product design" />
                <span className="block text-[10px] text-[#697366]">Separate skills with commas.</span>
              </label>
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">
                  <Cpu className="h-3.5 w-3.5 text-[#B7F36B]" /> Tech stack
                </span>
                <input value={techStack} onChange={(event) => setTechStack(event.target.value)} maxLength={500} className={inputClassName} placeholder="React, Supabase, Python" />
                <span className="block text-[10px] text-[#697366]">Separate tools with commas.</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#2B322A] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-[#2B322A] px-4 py-2.5 text-xs font-medium text-[#D5DBD1] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B7F36B] px-5 py-2.5 text-xs font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving profile...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
