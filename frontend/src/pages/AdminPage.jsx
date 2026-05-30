import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { getAdminReports, adminCloseRoom } from '../lib/api.js';

export function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [closed, setClosed] = useState(new Set());

  async function fetchReports() {
    setLoading(true);
    setError('');
    try {
      const { reports } = await getAdminReports(secret);
      setReports(reports);
      setAuthed(true);
    } catch {
      setError('Wrong secret or server error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleClose(roomId) {
    try {
      await adminCloseRoom(roomId, secret);
      setClosed(prev => new Set([...prev, roomId]));
    } catch {}
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Admin</h1>
            <p className="text-sm text-zinc-500 mt-1">View and action abuse reports.</p>
          </div>
          <Input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchReports()}
            error={error}
          />
          <Button className="w-full" onClick={fetchReports} disabled={loading || !secret}>
            {loading ? 'Checking...' : 'Enter'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Reports</h1>
            <p className="text-sm text-zinc-500">{reports.length} total</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchReports} disabled={loading}>
            {loading ? '...' : 'Refresh'}
          </Button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">No reports yet. </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => {
              const isClosed = closed.has(r.roomId);
              return (
                <div key={r.id} className={`bg-zinc-900 rounded-xl p-4 border ${isClosed ? 'border-zinc-800 opacity-50' : 'border-zinc-800'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-zinc-500 font-mono truncate">{r.roomId}</p>
                      <p className="text-sm text-zinc-300">{r.reason || <span className="text-zinc-600 italic">No reason given</span>}</p>
                      <p className="text-xs text-zinc-600">{new Date(r.timestamp).toLocaleString()}</p>
                    </div>
                    {!isClosed && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleClose(r.roomId)}
                        className="flex-shrink-0"
                      >
                        Close Room
                      </Button>
                    )}
                    {isClosed && <span className="text-xs text-zinc-600 flex-shrink-0">Closed ✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
