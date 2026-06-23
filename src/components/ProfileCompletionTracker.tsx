import { useState, useEffect } from 'react';
import type { DeveloperProfile } from '../types/profile';

interface TrackerItem {
  id: string;
  label: string;
  initialCheck: boolean;
  xp: number;
}

export function ProfileCompletionTracker({ profile }: { profile: DeveloperProfile }) {
  const defaultItems: TrackerItem[] = [
    { id: 'avatar', label: 'Quest: Show Your Face (Upload Profile Pic)', initialCheck: !!profile.avatarUrl, xp: 50 },
    { id: 'name', label: 'Quest: Real Identity (Set a Name)', initialCheck: !!profile.name && profile.name !== profile.login, xp: 20 },
    { id: 'bio', label: 'Quest: Main Character Energy (Write a Bio)', initialCheck: !!profile.bio, xp: 100 },
    { id: 'location', label: 'Quest: Touch Grass (Add Location)', initialCheck: !!profile.location, xp: 30 },
    { id: 'company', label: 'Quest: Wage Slave (Add Company)', initialCheck: !!profile.company && profile.company !== 'Unemployed', xp: 50 },
    { id: 'blog', label: 'Quest: Self Promotion (Add Blog)', initialCheck: !!profile.blog, xp: 50 },
    { id: 'pinned', label: 'Quest: Display the Trash (Pin Repos)', initialCheck: !!(profile.pinnedTrash && profile.pinnedTrash.length > 0), xp: 200 },
    { id: 'readme', label: 'Quest: The Great Documentation (Profile README)', initialCheck: profile.totalCommits > 0, xp: 500 },
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

  // Calculate XP and Gold
  const totalXP = defaultItems.reduce((acc, item) => checkedItems[item.id] ? acc + (item as any).xp : acc, 0);
  const totalGold = Math.floor(totalXP / 10);

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
          📜 Main Story Quests (Profile Setup)
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#3fb950' }}>{totalXP} XP</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#d29922' }}>{totalGold} 🪙</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: percentage === 100 ? 'var(--git-green)' : 'var(--git-orange)' }}>
            {percentage}%
          </span>
        </div>
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
          🎉 All Profile Quests Completed! You are officially a Try-Hard Developer.
        </div>
      )}

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Complete these foundational profile setup quests to earn imaginary XP and Gold.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {defaultItems.map((item: any) => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', padding: '8px', backgroundColor: checkedItems[item.id] ? 'rgba(63, 185, 80, 0.05)' : 'var(--bg-subtle)', borderRadius: '6px', border: `1px solid ${checkedItems[item.id] ? 'var(--git-green)' : 'var(--line-strong)'}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: checkedItems[item.id] ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>
              <input
                type="checkbox"
                checked={checkedItems[item.id] || false}
                onChange={() => handleToggle(item.id)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
            </label>
            <span style={{ fontSize: '0.85rem', color: 'var(--git-orange)', fontWeight: 600 }}>+{item.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
