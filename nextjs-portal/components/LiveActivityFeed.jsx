import React, { useState, useEffect, useRef } from 'react';

// Simulated activity events in Cantonese — creates social proof
const ACTIVITY_TEMPLATES = [
  (user, game) => `${user} 啱啱喺《${game}》得到新高分！`,
  (user, game) => `${user} 完成咗《${game}》嘅今日挑戰！`,
  (user, game) => `${user} 正在玩《${game}》`,
  (user, game) => `${user} 解鎖咗《${game}》嘅成就！`,
  (user, game) => `${user} 已連續登入 ${Math.floor(Math.random() * 12) + 2} 天！`,
];

const USERS = ['麻雀王子', '扮工達人', '茶記老闆', '鳳凰哥', '波鞋阿sir', '搵食大聯盟', '打工仔888', '辦公室神探', '大灣區摸魚王', '搵老闆笨'];
const GAMES = ['Hextris', '雷霆戰機 k1945', '2048', 'Snowboarder', 'Clumsy Bird', 'Tuxocide', 'Cube Shooter', 'A Dark Room'];

function generateEvent() {
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
  return { id: Date.now() + Math.random(), text: template(user, game), time: '剛剛' };
}

export const LiveActivityFeed = () => {
  const [events, setEvents] = useState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    // Initialize client-side only (avoid SSR hydration mismatch from Math.random)
    setEvents(Array.from({ length: 5 }, generateEvent));
    const interval = setInterval(() => {
      setEvents(prev => [generateEvent(), ...prev.slice(0, 7)]);
      if (feedRef.current) feedRef.current.scrollTop = 0;
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <h3 className="panel-title" style={{ marginBottom: 0 }}>📡 實時動態 (Live Feed)</h3>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.65rem',
          color: '#00c853',
          background: 'rgba(0,200,83,0.08)',
          border: '1px solid rgba(0,200,83,0.2)',
          padding: '2px 7px',
          borderRadius: '10px',
          fontWeight: '700'
        }}>
          <span style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#00c853',
            display: 'inline-block',
            animation: 'pulse-glow 1.5s infinite'
          }} />
          LIVE
        </span>
      </div>
      <div
        ref={feedRef}
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          scrollbarWidth: 'none'
        }}
      >
        {events.map((ev, i) => (
          <div
            key={ev.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.73rem',
              color: 'var(--text-main)',
              padding: '7px 10px',
              background: i === 0 ? 'rgba(0, 113, 227, 0.05)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${i === 0 ? 'rgba(0, 113, 227, 0.12)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              animation: i === 0 ? 'fadeSlideIn 0.4s ease' : 'none',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ fontSize: '15px', flexShrink: 0 }}>👾</span>
            <span style={{ flex: 1, lineHeight: '1.4' }}>{ev.text}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {ev.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
