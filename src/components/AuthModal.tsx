import React, { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, LoaderCircle, ShieldCheck, X } from 'lucide-react';

export type AuthModalMode = 'login' | 'signup';

export interface AuthActionResult {
  error?: string;
  message?: string;
  warning?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthModalMode;
  onClose: () => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onLogin: (email: string, password: string) => Promise<AuthActionResult>;
  onSignup: (details: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<AuthActionResult>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onModeChange,
  onLogin,
  onSignup,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthActionResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
      setResult(null);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setResult({ error: 'Enter your full name.' });
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) {
        setResult({ error: 'Username must be 3–24 characters using letters, numbers, or underscores.' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setResult({ error: 'Enter a valid email address.' });
        return;
      }
      if (password.length < 8) {
        setResult({ error: 'Password must be at least 8 characters.' });
        return;
      }
      if (password !== confirmPassword) {
        setResult({ error: 'Passwords do not match.' });
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setResult({ error: 'Enter a valid email address.' });
        return;
      }
      if (!password) {
        setResult({ error: 'Enter your password.' });
        return;
      }
    }

    setLoading(true);
    try {
      const actionResult = mode === 'signup'
        ? await onSignup({
            fullName: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            password,
          })
        : await onLogin(email.trim(), password);
      setResult(actionResult);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Boolean(result?.message && !result.error);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#090B09]/90 px-4 py-4 backdrop-blur-md sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="glass-panel-elevated relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#B7F36B]/30  sm:max-h-[calc(100dvh-4rem)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A0A99D]/70 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-[#A0A99D] transition-colors hover:bg-[#1C211C] hover:text-[#F4F6F1]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B7F36B]/30 bg-[#B7F36B]/15 text-[#B7F36B]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A0A99D]">
                TeamForge Synapse
              </p>
              <h2 id="auth-modal-title" className="font-display text-lg font-bold text-[#F4F6F1]">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
            </div>
          </div>

          {isComplete ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-[#75D99A]/25 bg-[#75D99A]/10 p-4 text-sm text-[#75D99A]">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#75D99A]" />
                <p>{result?.message}</p>
              </div>
              {result?.warning && (
                <div className="flex items-start gap-3 rounded-xl border border-[#E9BB69]/25 bg-[#E9BB69]/10 p-4 text-xs leading-relaxed text-[#E9BB69]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E9BB69]" />
                  <p>{result.warning}</p>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#B7F36B] px-4 py-3 text-sm font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653]"
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              <p className="mb-5 text-xs leading-relaxed text-[#A0A99D]">
                {mode === 'signup'
                  ? 'Create your Synapse identity and connect with your next venture team.'
                  : 'Sign in to reconnect with your Synapse network.'}
              </p>

              {result?.error && (
                <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#F07878]/30 bg-[#F07878]/10 p-3 text-xs leading-relaxed text-[#F07878]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F07878]" />
                  <span>{result.error}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-3.5">
                {mode === 'signup' && (
                  <>
                    <label className="block space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Full name</span>
                      <input
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        maxLength={100}
                        required
                        className="w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Username</span>
                      <input
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        maxLength={24}
                        required
                        className="w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15"
                        placeholder="synapse_handle"
                      />
                    </label>
                  </>
                )}
                <label className="block space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15"
                    placeholder="you@venture.dev"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Password</span>
                  <input
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15"
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  />
                </label>
                {mode === 'signup' && (
                  <label className="block space-y-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#A0A99D]">Confirm password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      className="w-full rounded-xl border border-[#2B322A] bg-[#090B09]/80 px-3.5 py-3 text-sm text-[#F4F6F1] outline-none transition-colors placeholder:text-[#697366] focus:border-[#B7F36B]/70 focus:ring-2 focus:ring-[#B7F36B]/15"
                      placeholder="Re-enter your password"
                    />
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B7F36B] px-4 py-3 text-sm font-semibold text-[#090B09] transition-colors hover:bg-[#A5E653] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {loading ? 'Connecting...' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[#A0A99D]">
                {mode === 'signup' ? 'Already connected?' : 'New to Synapse?'}{' '}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setResult(null);
                    setFullName('');
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    onModeChange(mode === 'signup' ? 'login' : 'signup');
                  }}
                  className="font-semibold text-[#B7F36B] transition-colors hover:text-[#F4F6F1] disabled:opacity-50"
                >
                  {mode === 'signup' ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
