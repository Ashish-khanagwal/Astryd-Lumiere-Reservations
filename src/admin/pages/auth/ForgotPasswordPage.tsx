import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../services/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await forgotPassword({ email });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-primary">mark_email_read</span>
        <p className="text-sm text-secondary">If that email exists, a reset link has been sent.</p>
        <Link to="/admin/login" className="text-sm text-primary font-medium hover:underline">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-secondary">Enter your email and we'll send you a reset link.</p>
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
      <button type="submit" className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors shadow-md shadow-primary/20">
        Send Reset Link
      </button>
      <div className="text-center">
        <Link to="/admin/login" className="text-sm text-primary font-medium hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
