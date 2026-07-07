import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// Rotates the daily challenge based on date (deterministic)
const DAILY_CHALLENGES = [
  { id: 'hextris', emoji: '🔷', name: 'Hextris', reward: 80, desc: '今日挑戰：連消 3 次以上！', target: '連消 3 次' },
  { id: 'k1945', emoji: '✈️', name: 'k1945 雷霆戰機', reward: 120, desc: '今日挑戰：擊敗第一個 Boss！', target: '擊殺 Boss' },
  { id: 'snowboarder', emoji: '🏂', name: 'Snowboarder', reward: 60, desc: '今日挑戰：滑行超過 500 米！', target: '500 米' },
  { id: 'game2048', emoji: '🔢', name: '2048', reward: 90, desc: '今日挑戰：合成到 512 方塊！', target: '達到 512' },
  { id: 'cubes2', emoji: '🎯', name: 'Cube Shooter', reward: 75, desc: '今日挑戰：消滅 50 個方塊！', target: '50 消滅' },
  { id: 'tuxocide', emoji: '🦕', name: 'Tuxocide', reward: 100, desc: '今日挑戰：生存超過 2 分鐘！', target: '2 分鐘' },
  { id: 'clumsybird', emoji: '🐦', name: 'Clumsy Bird', reward: 50, desc: '今日挑戰：通過 10 個水管！', target: '10 水管' },
];

function getDailyChallenge() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length];
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const DailyChallengePanel = ({ onEarnCoins }) => {
  const challenge = getDailyChallenge();
  const [todayKey, setTodayKey] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [countdown, setCountdown] = useState(''); // Start empty to avoid SSR hydration mismatch

  useEffect(() => {
    const key = `stupidpig_challenge_${Math.floor(Date.now() / 86400000)}`;
    setTodayKey(key);
    setClaimed(localStorage.getItem(key) === 'done');
    // Initialize countdown on client only
    setCountdown(getTimeUntilMidnight());
    const timer = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    if (claimed || !todayKey) return;
    localStorage.setItem(todayKey, 'done');
    setClaimed(true);
    if (onEarnCoins) onEarnCoins(challenge.reward);
  };

  return (
    <div className="panel-card daily-challenge-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="panel-title" style={{ marginBottom: 0 }}>🎯 今日挑戰 (Daily Challenge)</h3>
        <span style={{
          fontSize: '0.68rem',
          color: 'var(--apple-orange)',
          background: 'rgba(255, 149, 0, 0.08)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
          borderRadius: '8px',
          padding: '2px 8px',
          fontWeight: '700',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap'
        }}>
          ⏰ {countdown}
        </span>
      </div>

      <div style={{
        marginTop: '12px',
        background: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(0, 113, 227, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <span style={{ fontSize: '36px', flexShrink: 0 }}>{challenge.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>
            {challenge.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {challenge.desc}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              color: 'var(--apple-blue)',
              background: 'rgba(0, 113, 227, 0.08)',
              border: '1px solid rgba(0, 113, 227, 0.15)',
              borderRadius: '6px',
              padding: '2px 7px'
            }}>
              🎯 {challenge.target}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              color: 'var(--apple-orange)',
              background: 'rgba(255, 149, 0, 0.08)',
              border: '1px solid rgba(255, 149, 0, 0.15)',
              borderRadius: '6px',
              padding: '2px 7px'
            }}>
              🪙 +{challenge.reward} 幣
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Link href={`/play/${challenge.id}`} legacyBehavior>
          <a style={{
            flex: 1,
            textAlign: 'center',
            background: 'var(--apple-blue)',
            color: '#fff',
            borderRadius: '8px',
            padding: '9px',
            fontSize: '0.8rem',
            fontWeight: '700',
            textDecoration: 'none',
            display: 'block'
          }}>
            🎮 即刻去挑戰
          </a>
        </Link>
        <button
          onClick={handleClaim}
          disabled={claimed}
          style={{
            flex: 1,
            borderRadius: '8px',
            padding: '9px',
            fontSize: '0.8rem',
            fontWeight: '700',
            border: '1px solid rgba(0,0,0,0.08)',
            cursor: claimed ? 'not-allowed' : 'pointer',
            background: claimed ? 'rgba(0,0,0,0.03)' : 'rgba(52, 199, 89, 0.08)',
            color: claimed ? 'var(--text-muted)' : 'var(--apple-green)',
            transition: 'all 0.2s'
          }}
        >
          {claimed ? '✓ 已領獎' : '🪙 領取獎勵'}
        </button>
      </div>
    </div>
  );
};

DailyChallengePanel.propTypes = { onEarnCoins: PropTypes.func };

export default DailyChallengePanel;
