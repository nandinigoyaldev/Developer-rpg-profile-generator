type ContributionGraphProps = {
  totalCommits: number;
  streak: number;
  roast: string;
};

export function ContributionGraph({ totalCommits, streak, roast }: ContributionGraphProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-main)' }}>
          {totalCommits} contributions in the last year
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Current streak: {streak} days
        </span>
      </div>
      
      <div style={{ border: '1px solid var(--line-strong)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Mocking the contribution graph with random dots for density */}
          {Array.from({ length: 150 }).map((_, i) => {
            const opacity = Math.random() < 0.2 ? 1 : Math.random() < 0.4 ? 0.6 : Math.random() < 0.6 ? 0.3 : 0.1;
            return (
              <div 
                key={i} 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: 'var(--git-green)', 
                  opacity: opacity,
                  borderRadius: '2px'
                }} 
              />
            );
          })}
        </div>
        
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
          "{roast}"
        </p>
      </div>
    </div>
  );
}
