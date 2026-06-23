/* eslint-disable */
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { DeveloperProfile } from '../types/profile';

type ReadmePanelProps = {
  profile: DeveloperProfile;
};

// Client-side simple Markdown to HTML parser for high-fidelity visual preview


export function ReadmePanel({ profile }: ReadmePanelProps) {
  const [customStyle, setCustomStyle] = useState('cute + black theme');
  const [readmeContent, setReadmeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  useEffect(() => {
    // Generate default on mount / profile change
    handleGenerate();
  }, [profile]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, customStyle }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate README');
      }

      const text = await response.text();
      setReadmeContent(text);
    } catch (error) {
      console.error(error);
      setReadmeContent('Error generating README. Please make sure the local server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readmeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([readmeContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <article className="readme-panel-card" id="readme-generator">
      <div className="section-head">
        <h3>📝 README.md Generator</h3>
        <p className="subtle">Describe a style and get a custom GitHub profile README.</p>
      </div>

      {/* Compact collapsible tip */}
      <details className="readme-tip-block">
        <summary>💡 How it works &amp; style tips</summary>
        <div className="readme-tip-body">
          <p>Our engine reads your GitHub stats (commits, PRs, language bytes) and compiles them into a profile README using your style prompt.</p>
          <p><strong>Try styles like:</strong> <em>"neon purple hacker"</em>, <em>"cute sakura dark mode"</em>, <em>"minimalist orange"</em></p>
        </div>
      </details>

      {/* Style Prompt Input */}
      <div className="readme-prompt-section">
        <label className="readme-prompt-label">Visual Style Request</label>
        <div className="readme-input-row">
          <input
            type="text"
            placeholder="e.g. cute + black theme, neon green space..."
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            style={{
              flex: 1,
              height: '38px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid var(--line-strong)',
              backgroundColor: 'var(--bg-deep)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              minWidth: 0
            }}
            aria-label="README style prompt"
          />
          <button
            onClick={handleGenerate}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--git-green)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            type="button"
          >
            ✨ Generate
          </button>
        </div>
      </div>

      {/* Preview / Code Tab Switcher */}
      <div className="readme-tab-bar">
        <button
          onClick={() => setActiveTab('preview')}
          className={`readme-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          type="button"
        >
          👁️ Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`readme-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
          type="button"
        >
          📑 Markdown
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Generating README...</span>
        </div>
      ) : (
        <>
          {activeTab === 'preview' ? (
            <div className="readme-preview-box readme-preview-rendered markdown-body">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {readmeContent || 'No content generated yet.'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="readme-preview-box readme-preview-code"
              value={readmeContent}
              readOnly
              aria-label="Generated README markdown"
            />
          )}

          <div className="readme-actions">
            <button className="readme-action-btn readme-action-primary" onClick={handleCopy} type="button">
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <button className="readme-action-btn" onClick={handleDownload} type="button">
              💾 Download
            </button>
          </div>
        </>
      )}
    </article>
  );
}
