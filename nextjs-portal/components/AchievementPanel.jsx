import React, { useState, useEffect } from 'react';

const ACHIEVEMENTS = [
  { id: 'first_play', icon: '🎮', name: '新手上路', desc: '首次玩遊戲', condition: (s) => s.totalGamesPlayed >= 1 },
  { id: 'streak_3', icon: '🔥', name: '熱身中', desc: '連續登入 3 天', condition: (s) => s.streak >= 3 },
  { id: 'streak_7', icon: '💎', name: '摸魚大師', desc: '連續登入 7 天', condition: (s) => s.streak >= 7 },
  { id: 'coins_500', icon: '🪙', name: '傻豬財主', desc: '累積 500 傻豬幣', condition: (s) => s.coins >= 500 },
  { id: 'games_5', icon: '🏅', name: '遊戲達人', desc: '試玩 5 款不同遊戲', condition: (s) => s.uniqueGames >= 5 },
  { id: 'challenge_done', icon: '⚔️', name: '挑戰者', desc: '完成一次每日挑戰', condition: (s) => s.challengesDone >= 1 },
  { id: 'games_10', icon: '👑', name: '摸魚之神', desc: '試玩 10 款不同遊戲', condition: (s) => s.uniqueGames >= 10 },
  { id: 'coins_2000', icon: '💰', name: '傻豬首富', desc: '累積 2000 傻豬幣', condition: (s) => s.coins >= 2000 },
];

export const AchievementPanel = ({ userCoins = 0 }) => {
  const [stats, setStats] = useState({ streak: 0, totalGamesPlayed: 0, uniqueGames: 0, challengesDone: 0, coins: 0 });
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    const streak = parseInt(localStorage.getItem('stupidpig_streak_count') || '0');
    const coins = parseInt(localStorage.getItem('stupidpig_user_coins') || '0');
    const played = JSON.parse(localStorage.getItem('stupidpig_played_games') || '[]');
    const challenges = parseInt(localStorage.getItem('stupidpig_challenges_done') || '0');
    const computedStats = {
      streak,
      coins: Math.max(coins, userCoins),
      totalGamesPlayed: played.length,
      uniqueGames: new Set(played).size,
      challengesDone: challenges,
    };
    setStats(computedStats);

    const unlockedIds = JSON.parse(localStorage.getItem('stupidpig_achievements') || '[]');
    const newUnlocked = [...unlockedIds];
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedIds.includes(a.id) && a.condition(computedStats)) {
        newUnlocked.push(a.id);
      }
    });
    if (newUnlocked.length !== unlockedIds.length) {
      localStorage.setItem('stupidpig_achievements', JSON.stringify(newUnlocked));
    }
    setUnlocked(newUnlocked);
  }, [userCoins]);

  const totalUnlocked = unlocked.length;

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="panel-title" style={{ marginBottom: 0 }}>🏅 成就系統 (Achievements)</h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          {totalUnlocked}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div style={{
        width: '100%',
        height: '6px',
        background: 'var(--border-color)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '14px'
      }}>
        <div style={{
          width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--apple-blue), var(--apple-green))',
          borderRadius: '3px',
          transition: 'width 0.8s ease'
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px'
      }}>
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              title={`${a.name}: ${a.desc}`}
              style={{
                background: isUnlocked ? 'rgba(0, 113, 227, 0.08)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isUnlocked ? 'rgba(0, 113, 227, 0.25)' : 'var(--border-color)'}`,
                borderRadius: '10px',
                padding: '8px 4px',
                textAlign: 'center',
                cursor: 'default',
                transition: 'all 0.2s',
                opacity: isUnlocked ? 1 : 0.35,
                filter: isUnlocked ? 'none' : 'grayscale(1)'
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{a.icon}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', color: isUnlocked ? 'var(--apple-blue)' : 'var(--text-muted)', lineHeight: '1.2' }}>
                {a.name}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
        將滑鼠移到成就圖標查看詳情
      </p>
    </div>
  );
};

export default AchievementPanel;
