import { Link } from 'react-router-dom';

export function ResetPasswordPage() {
  return (
    <div className="text-center space-y-4">
      <span className="material-symbols-outlined text-4xl text-primary">lock_reset</span>
      <p className="text-sm text-secondary">Password reset links are issued by email and expire after 1 hour.</p>
      <Link to="/login" className="text-sm text-primary font-medium hover:underline">
        Back to Sign In
      </Link>
    </div>
  );
}
