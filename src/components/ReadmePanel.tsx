/* eslint-disable */
import { useState, useEffect } from 'react';
import type { DeveloperProfile } from '../types/profile';

type ReadmePanelProps = {
  profile: DeveloperProfile;
};

// Client-side simple Markdown to HTML parser for high-fidelity visual preview
function renderMarkdownToHtml(markdown: string) {
  if (!markdown) return '<p>No content generated yet.</p>';
  
  let html = markdown;
  
  // Escape HTML entities to prevent rendering breaking or XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1 style="border-bottom: 1px solid var(--line-strong); padding-bottom: 6px; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25;">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="border-bottom: 1px solid var(--line-strong); padding-bottom: 6px; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25;">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; font-size: 1.25rem;">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 style="margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; font-size: 1rem;">$1</h4>');
  
  // Bold & Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Inline Code blocks
  html = html.replace(/`(.*?)`/g, '<code style="background-color: rgba(110, 118, 129, 0.2); padding: 0.2em 0.4em; border-radius: 6px; font-family: monospace; font-size: 85%;">$1</code>');
  
  // Badges & Images (Format shields.io images to sit nicely inline or block)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-height: 28px; border-radius: 4px; margin: 4px 4px 4px 0; display: inline-block; vertical-align: middle;" />');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--git-blue); text-decoration: none;">$1</a>');
  
  // Table Renderer Heuristics
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.88rem; text-align: left; border: 1px solid var(--line-strong);">';
      }
      
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      // Check if separator line (e.g. | :--- | :--- |)
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      
      const isHeaderRow = !tableHtml.includes('</th>');
      tableHtml += `<tr style="border-bottom: 1px solid var(--line-strong); background-color: ${isHeaderRow ? 'var(--bg-deep)' : 'transparent'};">`;
      
      cells.forEach((cell) => {
        const tag = isHeaderRow ? 'th' : 'td';
        tableHtml += `<${tag} style="padding: 8px 12px; border: 1px solid var(--line-strong); font-weight: ${isHeaderRow ? '600' : 'normal'};">${cell}</${tag}>`;
      });
      
      tableHtml += '</tr>';
      lines[i] = ''; // clear current line representation
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</table>';
        // Put completed table block in the previous blank slot
        lines[i - 1] = tableHtml;
        tableHtml = '';
      }
    }
  }
  
  html = lines.filter(l => l !== '').join('\n');
  
  // Horizontal Dividers
  html = html.replace(/^---$/gim, '<hr style="border: 0; height: 1px; background-color: var(--line-strong); margin: 24px 0;" />');
  
  // Blockquotes
  html = html.replace(/^\>&nbsp;(.*$)/gim, '<blockquote style="border-left: 4px solid var(--line-strong); padding-left: 16px; margin: 16px 0; color: var(--text-muted);">$1</blockquote>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--line-strong); padding-left: 16px; margin: 16px 0; color: var(--text-muted);">$1</blockquote>');
  
  // Bullet lists
  html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 24px; list-style-type: disc; margin-bottom: 4px;">$1</li>');
  
  // Paragraph block enclosures
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    // If it starts with HTML elements, don't wrap in <p>
    if (/^<(h1|h2|h3|h4|table|hr|blockquote|li|ul|ol|img|div)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p style="margin: 8px 0; line-height: 1.6;">${trimmed}</p>`;
  }).join('\n');
  
  return html;
}

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

  // Compile visual preview
  const renderedPreviewHtml = renderMarkdownToHtml(readmeContent);

  return (
    <article className="card" id="readme-generator" style={{ padding: '24px' }}>
      <div className="section-head">
        <h3>📝 Profile README.md Generator</h3>
        <p className="subtle">Write a custom styling prompt to compile and download a personalized profile README.</p>
      </div>

      {/* Data Extraction Info Block */}
      <div
        style={{
          background: 'rgba(110, 118, 129, 0.1)',
          border: '1px solid var(--line-strong)',
          borderRadius: '6px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '0.82rem',
          lineHeight: 1.4,
          color: 'var(--text-main)'
        }}
      >
        <strong>🔍 How We Build Your README:</strong>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
          Our engine scans your public **GitHub Profile** (counting commits, merging pull requests, and auditing language bytes) and blends it with technical skill keywords scanned from your **uploaded resume** (PDF/DOCX). We combine these datasets to compile your Stats, Skill Tree, and Quest log, formatting them using your custom style request below.
        </p>
      </div>

      {/* Styled Colorful Tip Block */}
      <div
        style={{
          background: 'rgba(88, 166, 255, 0.08)',
          border: '1px solid var(--git-blue)',
          borderRadius: '6px',
          padding: '14px',
          marginBottom: '20px',
          fontSize: '0.82rem',
          lineHeight: 1.4,
          color: 'var(--text-main)'
        }}
      >
        <strong>💡 Pro-Tip: Custom Style Request</strong>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
          You are in complete control of the visual look! Type in any custom aesthetic combination (e.g. <em>&quot;neon purple hacker theme&quot;</em>, <em>&quot;cute sakura + dark mode&quot;</em>, <em>&quot;minimalist orange with rocket emojis&quot;</em>) and the generator will translate it into themed badges, matching banner images, and specific emojis.
        </p>
      </div>

      {/* Style Prompt Input Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Enter Visual Style Request:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="e.g. cute + black theme, neon green space, minimalist dark with hearts"
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
              fontSize: '0.88rem'
            }}
            aria-label="Manually typed README style prompt"
          />
          <button
            onClick={handleGenerate}
            className="primary-btn"
            style={{
              height: '38px',
              padding: '0 18px',
              borderRadius: '6px',
              border: '1px solid var(--line-strong)',
              backgroundColor: 'var(--git-green)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
            type="button"
          >
            Generate README
          </button>
        </div>
      </div>

      {/* Preview vs Source Code Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line-strong)', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('preview')}
          style={{
            border: 0,
            background: 'transparent',
            padding: '8px 16px',
            fontSize: '0.88rem',
            color: activeTab === 'preview' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'preview' ? 600 : 500,
            borderBottom: activeTab === 'preview' ? '2px solid var(--git-orange)' : '2px solid transparent',
            cursor: 'pointer'
          }}
          type="button"
        >
          👁️ Visual Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          style={{
            border: 0,
            background: 'transparent',
            padding: '8px 16px',
            fontSize: '0.88rem',
            color: activeTab === 'code' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'code' ? 600 : 500,
            borderBottom: activeTab === 'code' ? '2px solid var(--git-orange)' : '2px solid transparent',
            cursor: 'pointer'
          }}
          type="button"
        >
          📑 Markdown Source Code
        </button>
      </div>

      <div className="readme-generator-card" style={{ margin: 0 }}>
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Generating personalized README templates...</span>
          </div>
        ) : (
          <>
            {activeTab === 'preview' ? (
              /* Visual Rendered HTML Preview box */
              <div
                className="readme-preview-box"
                style={{
                  height: '400px',
                  backgroundColor: 'var(--bg-deep)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  padding: '24px',
                  overflow: 'auto',
                  fontFamily: 'inherit',
                  color: 'var(--text-main)',
                  whiteSpace: 'normal'
                }}
                dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }}
              />
            ) : (
              /* Raw Markdown Textarea box */
              <textarea
                className="readme-preview-box"
                style={{ height: '400px' }}
                value={readmeContent}
                readOnly
                aria-label="Generated README markdown code output"
              />
            )}

            <div className="readme-actions">
              <button className="primary-btn" onClick={handleCopy} type="button">
                {copied ? 'Copied! ✅' : 'Copy Markdown 📋'}
              </button>
              <button onClick={handleDownload} type="button">
                Download README.md 💾
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
