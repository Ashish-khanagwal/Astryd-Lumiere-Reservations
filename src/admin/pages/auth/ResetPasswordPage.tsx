import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { http } from '../../../services/http';

export function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search);
  const verify = params.get('purpose') === 'verify';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (!verify && password !== confirmation) throw new Error('Passwords do not match.');
      const result = await http.post<{ message: string }>(verify ? '/auth/verify-email' : '/auth/reset-password', { token: params.get('token'), password, passwordConfirmation: confirmation });
      setMessage(result.message); setDone(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to use this link.'); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4">
    <p>{verify ? 'Verify your email before publishing your site.' : 'Set a new password. Links expire after one hour.'}</p>
    {!verify && !done && <>
      <label className="block">Password<input type="password" required minLength={10} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border px-3 py-2" /></label>
      <label className="block">Confirm password<input type="password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="w-full rounded-xl border px-3 py-2" /></label>
      <p className="text-xs">At least 10 characters, including letters and numbers.</p>
    </>}
    {message && <p role="status">{message}</p>}
    {!done && <button disabled={busy || !params.get('token')} className="w-full rounded-full bg-primary text-on-primary py-3">{busy ? 'Please wait…' : verify ? 'Verify email' : 'Set password'}</button>}
    <Link to="/login">Back to Sign In</Link>
  </form>;
}
