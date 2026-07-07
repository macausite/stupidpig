import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const initialLeaderboard = [
  { rank: 1, user: '👑 Macau_Siumai_God', game: '合成大傻豬', score: 8520 },
  { rank: 2, user: '🥈 HK_Bungee_King', game: '笨豬跳', score: 6240 },
  { rank: 3, user: '🥉 GZ_DimSum_Master', game: '笨豬搵食', score: 5410 },
  { rank: 4, user: 'Office_Slacking_Pro', game: '合成大傻豬', score: 4320 },
  { rank: 5, user: 'Silly_Worker_888', game: '笨豬搵食', score: 3200 }
];

export const LeaderboardList = ({ userScore = 0 }) => {
  const [board, setBoard] = useState(initialLeaderboard);

  useEffect(() => {
    // If the user has a local highscore, dynamically splice them into the leaderboard!
    const localHighScore = parseInt(localStorage.getItem('stupidpig_merge_highscore') || '0');
    const actualScore = Math.max(localHighScore, userScore);

    if (actualScore > 0) {
      const userEntry = {
        rank: 99, // Temp
        user: '你 (傻豬新人)',
        game: '合成大傻豬',
        score: actualScore
      };

      // Merge and sort
      let newBoard = [...initialLeaderboard.filter(e => e.user !== '你 (傻豬新人)'), userEntry];
      newBoard.sort((a, b) => b.score - a.score);
      
      // Re-assign ranks
      newBoard = newBoard.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      // Slice to top 6 entries
      setBoard(newBoard.slice(0, 6));
    }
  }, [userScore]);

  return (
    <div className="panel-card">
      <h3 className="panel-title">🏆 大灣區摸魚戰力榜 (GBA Rankings)</h3>
      <p style={{ fontSize: '0.75rem', color: '#8c89ad', marginBottom: '12px' }}>
        實時同步 Firebase 雲端資料庫...
      </p>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th className="rank-col">Rank</th>
            <th>Player</th>
            <th>Game</th>
            <th style={{ textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {board.map(entry => {
            const isTop3 = entry.rank <= 3;
            const isUser = entry.user === '你 (傻豬新人)';
            return (
              <tr 
                key={entry.rank} 
                style={{ 
                  backgroundColor: isUser ? 'rgba(0, 255, 102, 0.08)' : 'transparent',
                  color: isUser ? '#00ff66' : 'inherit'
                }}
              >
                <td className={`rank-col ${isTop3 ? `top-rank rank-${entry.rank}` : ''}`}>
                  {entry.rank}
                </td>
                <td style={{ fontWeight: isUser ? 'bold' : 'normal' }}>
                  {entry.user}
                </td>
                <td style={{ opacity: 0.8 }}>{entry.game}</td>
                <td className="score-col">{entry.score}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

LeaderboardList.propTypes = {
  userScore: PropTypes.number
};

export default LeaderboardList;
