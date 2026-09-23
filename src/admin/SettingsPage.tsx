import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, CardHeader, ErrorNote, Input, PageHeader } from './ui';

const MIN_LENGTH = 12;

export const SettingsPage: React.FC<{ onSignedOut: () => void }> = ({ onSignedOut }) => {
  const { user, onUnauthorized } = useAdmin();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (next.length < MIN_LENGTH) return setError(`New password must be at least ${MIN_LENGTH} characters.`);
    if (next !== confirmNext) return setError('The new passwords do not match.');

    setSaving(true);
    try {
      await adminApi.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirmNext('');
      setSaved(true);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setSaving(false);
    }
  };

  const signOutEverywhere = async () => {
    if (!confirm('Sign out of the dashboard on every device, including this one?')) return;
    setSigningOut(true);
    try {
      await adminApi.logoutAll();
    } finally {
      onSignedOut();
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle={`Signed in as ${user.email}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader title="Change password" subtitle="Changing it signs out all your other devices." />
          <form onSubmit={changePassword} className="px-5 pb-5 space-y-4">
            <Input
              id="current-password"
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <Input
              id="new-password"
              label={`New password (at least ${MIN_LENGTH} characters)`}
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LENGTH}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <Input
              id="confirm-password"
              label="Repeat new password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmNext}
              onChange={(e) => setConfirmNext(e.target.value)}
            />
            <ErrorNote message={error} />
            {saved && (
              <p className="flex items-center gap-1.5 text-sm text-[#4ADE80]" role="status">
                <CheckCircle2 className="w-4 h-4" /> Password updated.
              </p>
            )}
            <Button type="submit" variant="primary" loading={saving}>
              Update password
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Sessions"
            subtitle="You sign in each time you open the dashboard, and sessions end after 4 hours. Use this if you signed in on a device you no longer trust."
          />
          <div className="px-5 pb-5">
            <Button variant="danger" onClick={signOutEverywhere} loading={signingOut}>
              Sign out everywhere
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};
