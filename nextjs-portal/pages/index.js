import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardGrid from '../components/DashboardGrid';

export default function Home({ userCoins, userPoints, onUpdateCoins }) {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="portal-shell">
      <Head>
        <title>StupidPig - 傻豬摸魚遊戲網 (StupidPig.com)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="StupidPig 傻豬遊戲網 - 專為大灣區、香港同澳門打工仔打造嘅摸魚遊戲平台！" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />
      </Head>

      {/* HEADER NAVIGATION */}
      <nav className="portal-nav">
        <div className="logo-section">
          <span className="logo-emoji">🐷</span>
          <span className="logo-text">Stupid<span>Pig</span></span>
        </div>
        <div className="nav-stats">
          <div className="stat-chip">
            <span className="coin">🪙</span>
            <span>{userCoins} 傻豬幣</span>
          </div>
          <div className="stat-chip">
            <span className="score">🏆</span>
            <span>{userPoints} 點</span>
          </div>
        </div>
      </nav>

      {/* DASHBOARD CORE */}
      <main className="portal-content">
        <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0', letterSpacing: '-0.3px' }}>🏢 傻豬辦公室摸魚中心</h1>
            <span
              style={{
                backgroundColor: 'rgba(52, 199, 89, 0.08)',
                border: '1px solid rgba(52, 199, 89, 0.2)',
                color: 'var(--apple-green)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: '600',
                letterSpacing: '0.01em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ⚡ 網頁免下載 • 即點即玩
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', margin: '0' }}>
            精選多款<strong>網頁免下載、即點即玩</strong>嘅開源 3D 同像素精品神作！支持隨時按 <strong>Spacebar (空白鍵)</strong> 一秒切換 Excel 報表掩護，安全摸魚無難度！
          </p>
        </div>

        <div className="dashboard-layout">
          {/* LEFT AREA: GAME SHEETS */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <div className="category-filters">
              {[
                { id: 'all', label: '📂 全部遊戲' },
                { id: 'hyper_casual', label: '🪂 扮工摸魚 (Hyper-Casual)' },
                { id: 'puzzle', label: '🧩 燒腦智力 (Puzzles)' },
                { id: 'arcade', label: '🕹️ 懷舊街機 (Arcade)' },
                { id: 'open_source', label: '🌐 開源精選 (Open Source)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <DashboardGrid activeCategory={activeCategory} />
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
        <p>© 2026 StupidPig.com 傻豬遊戲網. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
          <Link href="/privacy" legacyBehavior>
            <a style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>私隱政策</a>
          </Link>
          <span>|</span>
          <Link href="/terms" legacyBehavior>
            <a style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>服務條款</a>
          </Link>
          <span>|</span>
          <Link href="/contact" legacyBehavior>
            <a style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>聯絡我們 (搵食合作)</a>
          </Link>
        </div>
      </footer>
    </div>
  );
}
