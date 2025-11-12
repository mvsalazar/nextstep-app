import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { STORAGE_KEY } from '@/lib/constants';

export const AuthScreen = () => {
  const { login, signup, loading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('parent@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Parent');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await signup(email, password, name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-lg p-6 shadow-sm bg-background">
        <h1 className="text-xl font-semibold mb-1">{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
        <p className="text-sm text-muted-foreground mb-6">Parent/guardian account</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="text-sm text-muted-foreground mt-4 text-center space-y-2">
          {mode === 'login' ? (
            <button className="underline" onClick={() => setMode('signup')}>Need an account? Sign up</button>
          ) : (
            <button className="underline" onClick={() => setMode('login')}>Have an account? Sign in</button>
          )}
          <div>
            <button
              className="underline"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(STORAGE_KEY);
                  const state = raw ? JSON.parse(raw) : {};
                  state.settings = state.settings || {};
                  state.settings.storageMode = 'local';
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                  location.reload();
                } catch (error) {
                  console.error('Failed to toggle local mode:', error);
                }
              }}
            >
              Switch to Local Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
