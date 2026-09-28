import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/http';

export function LoginPage() {
  const mocks = import.meta.env.VITE_USE_MOCKS === 'true';
  const demo = mocks || import.meta.env.MODE === 'staging';
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [orgId, setOrgId] = useState(demo ? 'LUMIERE' : '');
  const [email, setEmail] = useState(demo ? mocks ? 'owner@lumiere.com' : 'admin@lumiere.com' : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(orgId.trim(), email.trim(), password);
      navigate(location.state?.from ?? '/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.code === 'invalid_credentials' || err.code === 'invalid_org')) {
        setError('Incorrect Organization ID, email, or password.');
      } else if (err instanceof TypeError || (err instanceof ApiError && err.status >= 500)) {
        setError('Could not reach the login service. Wait a moment and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? '/admin'} replace />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Organization ID</label>
        <input
          type="text"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          required
          autoCapitalize="characters"
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-outline-variant/40 bg-surface-container-low focus:border-primary outline-none uppercase"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-outline-variant/40 bg-surface-container-low focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
            className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-outline-variant/40 bg-surface-container-low focus:border-primary outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-secondary hover:text-on-surface"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-error font-medium">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center">
        <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="text-center">
        <Link to="/signup" className="text-sm text-primary font-medium hover:underline">
          New here? Create your site
        </Link>
      </div>

      <div className="text-center">
        <Link to="/super-admin" className="text-xs text-secondary hover:text-on-surface hover:underline">
          Platform team? Sign in here
        </Link>
      </div>
    </form>
  );
}
