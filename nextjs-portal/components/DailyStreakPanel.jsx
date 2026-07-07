import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const DailyStreakPanel = ({ onEarnCoins }) => {
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState('');
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    // Load local storage states
    const localStreak = localStorage.getItem('stupidpig_streak_count') || '0';
    const localLast = localStorage.getItem('stupidpig_streak_last_date') || '';
    
    setStreak(parseInt(localStreak));
    setLastCheckIn(localLast);

    const todayStr = new Date().toDateString();
    setCheckedInToday(localLast === todayStr);
  }, []);

  const handleCheckIn = () => {
    if (checkedInToday) return;

    const todayStr = new Date().toDateString();
    let newStreak = streak;

    // Check if consecutive
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    if (lastCheckIn === yesterdayStr) {
      newStreak = (streak % 7) + 1;
    } else {
      newStreak = 1;
    }

    // Award coins (e.g. Day 1 = 10 coins, Day 7 = 100 coins)
    const coinsReward = newStreak === 7 ? 100 : newStreak * 15;
    
    setStreak(newStreak);
    setLastCheckIn(todayStr);
    setCheckedInToday(true);

    localStorage.setItem('stupidpig_streak_count', newStreak.toString());
    localStorage.setItem('stupidpig_streak_last_date', todayStr);

    if (onEarnCoins) {
      onEarnCoins(coinsReward);
    }
  };

  return (
    <div className="panel-card">
      <h3 className="panel-title">📆 每日簽到 (Daily Streak)</h3>
      <p style={{ fontSize: '0.75rem', color: '#8c89ad', marginBottom: '12px' }}>
        連續登入得金幣！第7天可獲贈額外 <strong>100 傻豬幣</strong>！
      </p>

      <div className="streak-grid">
        {[1, 2, 3, 4, 5, 6, 7].map(day => {
          const isClaimed = day <= streak;
          const isActive = day === (checkedInToday ? streak : streak + 1);
          return (
            <div 
              key={day} 
              className={`streak-day-box ${isClaimed ? 'claimed' : ''} ${isActive ? 'active' : ''}`}
            >
              <span>D{day}</span>
              <span>{isClaimed ? '✓' : isActive ? '🔥' : '🔒'}</span>
            </div>
          );
        })}
      </div>

      <button 
        className="checkin-btn" 
        onClick={handleCheckIn}
        disabled={checkedInToday}
        style={{
          backgroundColor: checkedInToday ? '#2b294a' : '#107c41',
          color: checkedInToday ? '#8c89ad' : '#ffffff',
          cursor: checkedInToday ? 'not-allowed' : 'pointer'
        }}
      >
        {checkedInToday ? '今日已完成簽到' : '立即簽到領金幣'}
      </button>
    </div>
  );
};

DailyStreakPanel.propTypes = {
  onEarnCoins: PropTypes.func.isRequired
};

export default DailyStreakPanel;
