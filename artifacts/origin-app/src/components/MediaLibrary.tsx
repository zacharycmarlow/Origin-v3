import { useState, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   MediaLibrary — manage uploaded/recorded media.

   Displays a grid of the user's media with delete/download.
   Uses the existing /api/media endpoints.
   ═══════════════════════════════════════════════════════════════ */

interface MediaItem {
  id: string;
  contentType: string;
  size: number;
  kind: string;
  originalName: string | null;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const KIND_ICONS: Record<string, string> = {
  photo: '🖼', audio: '🎙', video: '🎬', document: '📄',
};

export default function MediaLibrary({ onClose }: { onClose?: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error('Failed to load media');
      const json = await res.json();
      setItems(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(m => m.id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#e8dcc6' }}>Loading media…</div>;
  if (error) return <div style={{ padding: '2rem', color: '#c89838' }}>{error}</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#c89838', fontSize: '1.3rem', fontWeight: 400, fontFamily: 'Georgia, serif' }}>Your Media</h2>
        {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#e8dcc6', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
      </div>
      {items.length === 0 ? (
        <p style={{ color: '#e8dcc6', opacity: 0.5, fontFamily: 'Georgia, serif' }}>No media yet. Upload files or record audio/video to see them here.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#2a2218', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(200,152,56,0.15)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{KIND_ICONS[item.kind] || '📄'}</div>
              <div style={{ color: '#e8dcc6', fontSize: '0.8rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.originalName || item.id}</div>
              <div style={{ color: '#e8dcc6', opacity: 0.5, fontSize: '0.7rem', marginBottom: '0.75rem' }}>{formatSize(item.size)} · {formatDate(item.createdAt)}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`/api/media/${item.id}`} download style={{ color: '#c89838', fontSize: '0.75rem', textDecoration: 'none' }}>Download</a>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#c89838', fontSize: '0.75rem', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
