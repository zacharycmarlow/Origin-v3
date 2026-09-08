import { useState } from 'react';
import AuthBar from './AuthBar';
import { ButterflyIcon } from './MorphoCompassIcons';

/* ─── PWA install prompt typing ─────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface ArtifactsPanelProps {
  mode: string;
  onToggleMode: () => void;
  onOpenJournal: () => void;
  onExport: () => void;
  onImportClick: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  hasMorpho: boolean;
  t: (key: string) => string;
}

export default function ArtifactsPanel({
  mode,
  onToggleMode,
  onOpenJournal,
  onExport,
  onImportClick,
  installPrompt,
  onInstall,
  hasMorpho,
  t,
}: ArtifactsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`artifacts-panel${collapsed ? ' artifacts-panel--collapsed' : ''}`}
      aria-label="Artifacts Along The Journey"
    >
      <button
        className="artifacts-panel-toggle"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand artifacts panel' : 'Collapse artifacts panel'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d={collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="artifacts-panel-header">
        <span className="artifacts-panel-eyebrow">The Origin</span>
        <h2 className="artifacts-panel-title">Artifacts Along The Journey</h2>
      </div>

      <div className="artifacts-panel-body">
        {/* ── Account ─────────────────────────────────────────── */}
        <div className="artifacts-panel-section">
          <span className="artifacts-panel-section-label">{t('nav.account') || 'Account'}</span>
          <AuthBar />
        </div>

        {/* ── Mode ───────────────────────────────────────────── */}
        <div className="artifacts-panel-section">
          <span className="artifacts-panel-section-label">Reading Mode</span>
          <button
            className="mode-toggle"
            onClick={onToggleMode}
            aria-label={mode === 'color' ? t('mode.switchToPaper') : t('mode.switchToColor')}
            title={mode === 'color' ? t('mode.paper') : t('mode.color')}
          >
            <span className={`mode-dot mode-dot--color${mode === 'color' ? ' on' : ''}`} />
            <span className={`mode-dot mode-dot--paper${mode === 'paper' ? ' on' : ''}`} />
            <span className="mode-label">{mode === 'color' ? t('mode.color') : t('mode.paper')}</span>
          </button>
        </div>

        {/* ── Journal ────────────────────────────────────────── */}
        <div className="artifacts-panel-section">
          <span className="artifacts-panel-section-label">Journal</span>
          <button
            className={`instr-btn artifacts-panel-btn${hasMorpho ? ' instr-btn--lit' : ''}`}
            onClick={onOpenJournal}
            aria-label={t('nav.openJournal')}
            title={t('nav.journal')}
          >
            <ButterflyIcon size={18} glowing={hasMorpho} />
            <span className="artifacts-panel-btn-label">{t('nav.journal') || 'Journal'}</span>
          </button>
        </div>

        {/* ── Export / Import ────────────────────────────────── */}
        <div className="artifacts-panel-section">
          <span className="artifacts-panel-section-label">Your Journey</span>
          <button
            className="instr-btn artifacts-panel-btn"
            onClick={onExport}
            aria-label="Export journey data"
            title="Export"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="artifacts-panel-btn-label">Export</span>
          </button>
          <button
            className="instr-btn artifacts-panel-btn"
            onClick={onImportClick}
            aria-label="Import / restore journey data"
            title="Import"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 15V3m0 0l-4 4m4-4l4 4M5 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)" />
            </svg>
            <span className="artifacts-panel-btn-label">Import</span>
          </button>
        </div>

        {/* ── Install ────────────────────────────────────────── */}
        {installPrompt && (
          <div className="artifacts-panel-section">
            <span className="artifacts-panel-section-label">App</span>
            <button
              className="instr-btn artifacts-panel-btn"
              onClick={onInstall}
              aria-label="Install Origin as an app"
              title="Install Origin"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v6m-3-3l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="artifacts-panel-btn-label">Install</span>
            </button>
          </div>
        )}

        {/* ── Source ─────────────────────────────────────────── */}
        <div className="artifacts-panel-section">
          <span className="artifacts-panel-section-label">Source</span>
          <a
            href="https://github.com/zacharycmarlow/Origin-v3"
            target="_blank"
            rel="noopener noreferrer"
            className="instr-btn artifacts-panel-btn"
            aria-label="View source on GitHub"
            title="GitHub"
            style={{ textDecoration: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="artifacts-panel-btn-label">GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
