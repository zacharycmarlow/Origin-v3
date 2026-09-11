import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   ConnectedAccounts — manage social platform connections.

   Shows connection status for YouTube, Bluesky, Podcast, X.
   Uses the app's dark + gold styling conventions.
   ═══════════════════════════════════════════════════════════════ */

interface Account {
  platform: string;
  label: string;
  connected: boolean;
  detail?: string;
}

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([
    { platform: 'youtube', label: 'YouTube', connected: false },
    { platform: 'bluesky', label: 'Bluesky', connected: false },
    { platform: 'podcast', label: 'Podcast RSS', connected: false },
    { platform: 'twitter', label: 'X / Twitter', connected: false },
  ]);
  const [bskyHandle, setBskyHandle] = useState('');
  const [bskyPassword, setBskyPassword] = useState('');

  const connectYouTube = () => {
    window.open('/api/youtube/connect', '_blank');
  };

  const connectBluesky = () => {
    if (!bskyHandle || !bskyPassword) return;
    setAccounts(prev => prev.map(a => a.platform === 'bluesky' ? { ...a, connected: true, detail: bskyHandle } : a));
  };

  const disconnect = (platform: string) => {
    setAccounts(prev => prev.map(a => a.platform === platform ? { ...a, connected: false, detail: undefined } : a));
  };

  const sectionStyle: React.CSSProperties = {
    maxWidth: '500px', margin: '0 auto', padding: '1.5rem',
    fontFamily: 'Georgia, serif', color: '#e8dcc6',
  };
  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 0', borderBottom: '1px solid rgba(200,152,56,0.15)',
  };
  const btnStyle: React.CSSProperties = {
    background: 'transparent', border: '1px solid #c89838', color: '#c89838',
    padding: '0.35rem 1rem', borderRadius: '2px', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.8rem',
  };

  return (
    <div style={sectionStyle}>
      <h2 style={{ color: '#c89838', fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem' }}>Connected Accounts</h2>

      {accounts.map(account => (
        <div key={account.platform} style={rowStyle}>
          <div>
            <div style={{ fontSize: '0.95rem' }}>{account.label}</div>
            {account.connected && account.detail && (
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Connected as {account.detail}</div>
            )}
            {account.platform === 'podcast' && account.connected && (
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>RSS: /api/podcast/feed.xml</div>
            )}
          </div>
          <div>
            {account.connected ? (
              <button style={btnStyle} onClick={() => disconnect(account.platform)}>Disconnect</button>
            ) : account.platform === 'youtube' ? (
              <button style={btnStyle} onClick={connectYouTube}>Connect</button>
            ) : account.platform === 'bluesky' ? (
              <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input placeholder="handle.bsky.social" value={bskyHandle} onChange={e => setBskyHandle(e.target.value)} style={{ background: '#2a2218', border: '1px solid rgba(200,152,56,0.3)', color: '#e8dcc6', padding: '0.3rem', fontSize: '0.75rem', borderRadius: '2px', width: '120px' }} />
                <input type="password" placeholder="app password" value={bskyPassword} onChange={e => setBskyPassword(e.target.value)} style={{ background: '#2a2218', border: '1px solid rgba(200,152,56,0.3)', color: '#e8dcc6', padding: '0.3rem', fontSize: '0.75rem', borderRadius: '2px', width: '100px' }} />
                <button style={btnStyle} onClick={connectBluesky}>Connect</button>
              </span>
            ) : account.platform === 'twitter' ? (
              <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>Coming soon</span>
            ) : (
              <button style={btnStyle} onClick={() => setAccounts(prev => prev.map(a => a.platform === account.platform ? { ...a, connected: true } : a))}>Connect</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
