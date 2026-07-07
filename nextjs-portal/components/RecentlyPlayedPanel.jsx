import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Map of gameId -> emoji used for quick visual identification
const GAME_ICONS = {
  'stupidpig-escape': '🐷', 'villain-hitting': '🥿', 'temple-chim': '🏮',
  'red-minibus': '🚐', 'rainbow-toss': '🪙', 'waiter-frenzy': '🧑‍🍳', 'fish-prawn-crab': '🎲',
  'interview-hell': '💼', 'hotpot-battle': '🍲', 'typhoon-commute': '🌀', 'bargaining-master': '🥬',
  hextris: '🔷', k1945: '✈️', snowboarder: '🏂', game2048: '🔢',
  cubes2: '🎯', tuxocide: '🦕', clumsybird: '🐦', tetris: '🟥',
  mario: '🍄', snake: '🐍', freecell: '🃏', minesweeper: '💣',
  merge_pig: '🐷', runner: '🏃',
};
const GAME_NAMES = {
  'stupidpig-escape': '傻豬辦公室大逃亡', 'villain-hitting': '鵝頸橋打小人', 'temple-chim': '廟街求籤開運',
  'red-minibus': '亡命紅Van大挑戰', 'rainbow-toss': '澳葡夜市掟彩虹', 'waiter-frenzy': '茶餐廳夥計瘋狂接單', 'fish-prawn-crab': '街頭魚蝦蟹',
  'interview-hell': '職場地獄見工記', 'hotpot-battle': '打邊爐搶食戰', 'typhoon-commute': '十號風球返工記', 'bargaining-master': '街市殺價大師',
  hextris: 'Hextris', k1945: 'k1945 雷霆戰機', snowboarder: 'Snowboarder',
  game2048: '2048', cubes2: 'Cube Shooter', tuxocide: 'Tuxocide',
  clumsybird: 'Clumsy Bird', tetris: 'Tetris', mario: 'Mario',
  snake: 'Snake', freecell: 'FreeCell', minesweeper: '掃雷',
  merge_pig: '合成大傻豬', runner: '跑酷',
};

export const RecentlyPlayedPanel = () => {
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    const played = JSON.parse(localStorage.getItem('stupidpig_recent_games') || '[]');
    // Deduplicate while preserving order (most recent first)
    const seen = new Set();
    const unique = played.filter(id => !seen.has(id) && seen.add(id));
    setRecentGames(unique.slice(0, 3));
  }, []);

  if (recentGames.length === 0) return null;

  return (
    <div className="panel-card">
      <h3 className="panel-title">⏱️ 繼續上次 (Continue Playing)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentGames.map(id => (
          <Link key={id} href={`/play/${id}`} legacyBehavior>
            <a style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              background: 'rgba(0, 113, 227, 0.04)',
              border: '1px solid rgba(0, 113, 227, 0.1)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'var(--text-main)',
              transition: 'all 0.2s',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '24px' }}>{GAME_ICONS[id] || '🎮'}</span>
              <span style={{ flex: 1 }}>{GAME_NAMES[id] || id}</span>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--apple-blue)',
                fontWeight: '700',
                background: 'rgba(0, 113, 227, 0.08)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 113, 227, 0.15)'
              }}>繼續玩 ▶</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayedPanel;
