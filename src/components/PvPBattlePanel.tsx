import { useState } from 'react';
import type { DeveloperProfile } from '../types/profile';

export function PvPBattlePanel() {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [battleResult, setBattleResult] = useState<{ p1: DeveloperProfile, p2: DeveloperProfile, winner: number, roast: string, hp1: number, hp2: number } | null>(null);

  const handleBattle = async () => {
    if (!player1.trim() || !player2.trim()) {
      setError('Please enter both GitHub usernames.');
      return;
    }
    
    setLoading(true);
    setError('');
    setBattleResult(null);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/github?username=${encodeURIComponent(player1.trim())}`),
        fetch(`/api/github?username=${encodeURIComponent(player2.trim())}`)
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error('Could not fetch one or both players. Did someone run away?');
      }

      const p1: DeveloperProfile = await res1.json();
      const p2: DeveloperProfile = await res2.json();

      // Calculate simple score
      const score1 = p1.totalCommits + (p1.totalPRs * 10) + (p1.totalStars * 5);
      const score2 = p2.totalCommits + (p2.totalPRs * 10) + (p2.totalStars * 5);

      let winner = 0;
      let roast = '';

      let hp1 = 100;
      let hp2 = 100;

      if (score1 > score2) {
        winner = 1;
        hp2 = Math.max(0, 100 - (score1 - score2));
        roast = `${p1.name || p1.login} completely obliterated ${p2.name || p2.login}. Maybe ${p2.login} should try touching a keyboard once in a while.`;
      } else if (score2 > score1) {
        winner = 2;
        hp1 = Math.max(0, 100 - (score2 - score1));
        roast = `${p2.name || p2.login} destroyed ${p1.name || p1.login}. ${p1.login} was probably too busy centering divs to write real code.`;
      } else {
        hp1 = 10; hp2 = 10;
        roast = `It's a tie! You both write equally mediocre code. Congratulations.`;
      }

      setBattleResult({ p1, p2, winner, roast, hp1, hp2 });
      setBattleState('fighting');

      // Fake battle duration for animation
      setTimeout(() => {
        setBattleState('finished');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
      setBattleState('idle');
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!battleResult) return;
    const text = battleResult.winner === 1 
      ? `I just destroyed ${battleResult.p2.login} in a Developer Roast Battle! ${battleResult.p1.login} reigns supreme. ⚔️ \n\nCheck your stats at Developer RPG!`
      : battleResult.winner === 2
      ? `${battleResult.p2.login} just humiliated me in a Developer Roast Battle. I'm going back to tutorials. ⚔️ \n\nCheck your stats at Developer RPG!`
      : `I tied with ${battleResult.p2.login} in a Developer Roast Battle. We both suck. ⚔️ \n\nCheck your stats at Developer RPG!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        ⚔️ PvP Roast Battle
      </h2>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Enter two GitHub usernames and let the stats decide who is the ultimate try-hard and who is just a script kiddie.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <input 
          type="text" 
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          placeholder="Player 1 Username"
          style={{ flex: 1, padding: '8px 12px', height: '38px', border: '1px solid var(--git-red)' }}
        />
        <span style={{ fontWeight: 800, color: 'var(--git-orange)' }}>VS</span>
        <input 
          type="text" 
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          placeholder="Player 2 Username"
          style={{ flex: 1, padding: '8px 12px', height: '38px', border: '1px solid var(--git-blue)' }}
        />
      </div>

      <button 
        className="primary-assemble" 
        onClick={handleBattle} 
        disabled={loading}
        style={{ height: '38px', padding: '0 24px', width: '100%', marginBottom: '24px' }}
      >
        {loading ? 'Calculating Power Levels...' : 'FIGHT!'}
      </button>

      {error && (
        <div style={{ color: 'var(--git-red)', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(248,81,73,0.1)', border: '1px solid var(--git-red)', borderRadius: '6px' }}>
          ⚠️ {error}
        </div>
      )}

      {battleResult && battleState !== 'idle' && (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          
          {battleState === 'finished' && (
            <div style={{ padding: '24px', backgroundColor: 'rgba(210, 153, 34, 0.1)', border: '1px solid var(--git-orange)', borderRadius: '6px', textAlign: 'center', marginBottom: '24px', animation: 'bounce 0.5s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--git-orange)', margin: '0 0 12px 0', textTransform: 'uppercase' }}>K.O.</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 16px 0' }}>"{battleResult.roast}"</p>
              <button 
                onClick={handleShare}
                style={{ background: '#1DA1F2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                🐦 Share to Twitter/X
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Player 1 Stats */}
            <div className="card" style={{ flex: 1, padding: '16px', border: battleState === 'finished' && battleResult.winner === 1 ? '2px solid var(--git-green)' : '1px solid var(--line-strong)', opacity: battleState === 'finished' && battleResult.winner === 2 ? 0.6 : 1, transition: 'all 0.5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src={battleResult.p1.avatarUrl} alt="P1" style={{ width: '48px', height: '48px', borderRadius: '50%', animation: battleState === 'fighting' ? 'shake 0.5s infinite' : 'none' }} />
                <div style={{ width: '100%' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{battleResult.p1.login}</h4>
                  {/* Health Bar */}
                  <div style={{ width: '100%', height: '12px', background: '#30363d', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: battleState === 'fighting' ? '100%' : `${battleResult.hp1}%`, background: battleResult.hp1 > 20 ? 'var(--git-green)' : 'var(--git-red)', transition: 'width 2s ease-out' }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Commits:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p1.totalCommits}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stars:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p1.totalStars}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PRs:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p1.totalPRs}</strong></div>
              </div>
            </div>

            {/* Player 2 Stats */}
            <div className="card" style={{ flex: 1, padding: '16px', border: battleState === 'finished' && battleResult.winner === 2 ? '2px solid var(--git-green)' : '1px solid var(--line-strong)', opacity: battleState === 'finished' && battleResult.winner === 1 ? 0.6 : 1, transition: 'all 0.5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src={battleResult.p2.avatarUrl} alt="P2" style={{ width: '48px', height: '48px', borderRadius: '50%', animation: battleState === 'fighting' ? 'shake 0.5s infinite reverse' : 'none' }} />
                <div style={{ width: '100%' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', textAlign: 'right' }}>{battleResult.p2.login}</h4>
                  {/* Health Bar */}
                  <div style={{ width: '100%', height: '12px', background: '#30363d', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: battleState === 'fighting' ? '100%' : `${battleResult.hp2}%`, background: battleResult.hp2 > 20 ? 'var(--git-green)' : 'var(--git-red)', transition: 'width 2s ease-out', float: 'right' }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Commits:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p2.totalCommits}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stars:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p2.totalStars}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PRs:</span> <strong style={{ color: 'var(--text-main)' }}>{battleResult.p2.totalPRs}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
