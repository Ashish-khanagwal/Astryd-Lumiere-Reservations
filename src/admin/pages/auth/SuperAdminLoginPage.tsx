import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/** Multi-Vertical Platform Plan §5.1 - Super Admin is us, isn't scoped to any Organization, and so never enters an Org ID. Deliberately a separate page/layout from the Org-scoped LoginPage rather than a mode toggle on it. */
export function SuperAdminLoginPage() {
  const { loginSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginSuperAdmin(email, password);
      navigate('/admin/superadmin/sites', { replace: true });
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-on-surface text-surface shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mt-4 tracking-tight">Platform Admin</h1>
          <p className="text-sm text-secondary mt-1">Super Admin sign in - manages every Organization on the platform</p>
        </div>

        <div className="admin-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="password123"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-outline-variant/40 bg-surface-container-low focus:border-primary outline-none"
              />
              <p className="text-xs text-secondary mt-1">Demo password: password123</p>
            </div>

            {error && <p className="text-sm text-error font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-on-surface text-surface font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="pt-4 border-t border-outline-variant/20 text-xs text-secondary">
              <p>admin@platform.com (Super Admin)</p>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-xs text-secondary hover:text-on-surface hover:underline">
                Not platform team? Sign in to your Organization
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
