import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import type { DeveloperProfile, SkillNode } from '../types/profile';

export function SkillRadarChart({ profile }: { profile: DeveloperProfile }) {
  // Use profile skills if available, otherwise generate dummy data
  let data: any[] = [];
  
  if (profile.skills && profile.skills.length >= 3) {
    data = profile.skills.slice(0, 6).map((skill: SkillNode) => ({
      subject: skill.name.replace(' Mastery', '').replace('Copy-Pasting', 'C&P'),
      A: skill.level,
      fullMark: 100,
    }));
  } else {
    // Fallback data if skills aren't properly populated from API
    data = [
      { subject: 'Div Centering', A: Math.min(99, profile.totalCommits / 2 + 20), fullMark: 100 },
      { subject: 'Spaghetti Code', A: Math.min(99, 40 + (profile.totalStars * 5)), fullMark: 100 },
      { subject: 'StackOverflow', A: Math.min(99, 50 + (profile.followers || 0) * 2), fullMark: 100 },
      { subject: 'Procrastination', A: 99, fullMark: 100 },
      { subject: 'Commit Velocity', A: Math.min(99, profile.totalCommits / 10), fullMark: 100 },
      { subject: 'Documentation', A: Math.max(5, 30 - profile.totalPRs), fullMark: 100 },
    ];
  }

  // Ensure at least 3 points for a radar chart
  if (data.length < 3) {
    data.push({ subject: 'Mystery Skill 1', A: 50, fullMark: 100 });
    data.push({ subject: 'Mystery Skill 2', A: 50, fullMark: 100 });
  }

  const SKILL_DESCRIPTIONS: Record<string, string> = {
    'Div Centering': "You've mastered the ancient art of display:flex. Truly a wizard.",
    'Spaghetti Code': "Your code resembles a bowl of pasta. Delicious, but impossible to untangle.",
    'StackOverflow': "You are incapable of writing a single loop without asking the internet first.",
    'Procrastination': "You will optimize the build system for 3 days to avoid writing the actual feature.",
    'Commit Velocity': "You commit fast, but break things faster.",
    'Documentation': "You wrote a README once in 2019 and have been riding that high ever since."
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const skillName = payload[0].payload.subject;
      const desc = SKILL_DESCRIPTIONS[skillName] || "You somehow tricked people into thinking you are good at this.";
      return (
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--git-orange)', padding: '12px', borderRadius: '6px', maxWidth: '250px' }}>
          <p style={{ color: 'var(--git-orange)', margin: '0 0 8px 0', fontWeight: 'bold' }}>{skillName} ({payload[0].value}/100)</p>
          <p style={{ color: 'var(--text-main)', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>"{desc}"</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px', marginBottom: '24px', height: '400px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        🛡️ RPG Skill Tree
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
        An entirely accurate representation of your "talents".
      </p>
      
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--line-strong)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
            <Radar name={profile.login} dataKey="A" stroke="var(--git-orange)" fill="var(--git-orange)" fillOpacity={0.4} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
