type SideNavProps = {
  battleTag: string;
  onReset: () => void;
};

export function SideNav({ battleTag, onReset }: SideNavProps) {
  return (
    <header className="github-header">
      <div className="github-header-left">
        <div className="github-logo" onClick={onReset} title="Return to Home">
          <svg
            height="28"
            aria-hidden="true"
            viewBox="0 0 16 16"
            version="1.1"
            width="28"
            style={{ fill: 'currentColor' }}
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88.01.64.01 1.13.01 1.25 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8z"></path>
          </svg>
          <strong style={{ fontSize: '1.25rem' }}>Developer RPG</strong>
        </div>
      </div>

      <div className="github-header-right">
        <span style={{ fontSize: '0.8rem', color: '#8b949e', fontWeight: 600, marginRight: '12px' }}>
          Console: {battleTag}
        </span>
        <button
          onClick={onReset}
          className="theme-btn"
          style={{
            height: '32px',
            padding: '0 12px',
            fontSize: '0.78rem',
            background: 'var(--bg-void)',
            color: 'var(--text-main)',
            border: '1px solid var(--line-strong)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
          type="button"
        >
          ← New Search
        </button>
      </div>
    </header>
  );
}
