import { useState, useEffect } from 'react';
import type { DeveloperProfile } from '../types/profile';

interface TrackerItem {
  id: string;
  label: string;
  initialCheck: boolean;
}

export function ProfileCompletionTracker({ profile }: { profile: DeveloperProfile }) {
  const defaultItems: TrackerItem[] = [
    { id: 'avatar', label: 'Uploaded a Profile Picture', initialCheck: !!profile.avatarUrl },
    { id: 'name', label: 'Set a Real Name', initialCheck: !!profile.name && profile.name !== profile.login },
    { id: 'bio', label: 'Wrote a Bio', initialCheck: !!profile.bio },
    { id: 'location', label: 'Added a Location', initialCheck: !!profile.location },
    { id: 'company', label: 'Added a Company/Workplace', initialCheck: !!profile.company && profile.company !== 'Unemployed' },
    { id: 'blog', label: 'Linked a Blog or Website', initialCheck: !!profile.blog },
    { id: 'pinned', label: 'Pinned Repositories', initialCheck: !!(profile.pinnedTrash && profile.pinnedTrash.length > 0) },
    { id: 'readme', label: 'Created a Profile README', initialCheck: profile.totalCommits > 0 }, // We can't actually check if they have a special repository for a readme, but this is a placeholder check
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize state
    const initialState: Record<string, boolean> = {};
    defaultItems.forEach(item => {
      initialState[item.id] = item.initialCheck;
    });
    setCheckedItems(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleToggle = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalItems = defaultItems.length;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const percentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
          📋 Profile Completion Tracker
        </h2>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: percentage === 100 ? 'var(--git-green)' : 'var(--git-orange)' }}>
          {percentage}%
        </span>
      </div>

      <div style={{ width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', height: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <div 
          style={{ 
            height: '100%', 
            backgroundColor: percentage === 100 ? 'var(--git-green)' : 'var(--git-orange)', 
            width: `${percentage}%`,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} 
        />
      </div>

      {percentage === 100 && (
        <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'rgba(46,160,67,0.1)', border: '1px solid var(--git-green)', borderRadius: '6px', color: 'var(--git-green)', textAlign: 'center', fontWeight: 600 }}>
          🎉 100% Complete! You finally look like a real developer. Now go write some code.
        </div>
      )}

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        We checked what we could automatically. Manually check off items as you update your GitHub profile!
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
        {defaultItems.map((item) => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: checkedItems[item.id] ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>
              <input
                type="checkbox"
                checked={checkedItems[item.id] || false}
                onChange={() => handleToggle(item.id)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
