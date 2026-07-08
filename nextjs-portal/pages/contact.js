import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ContactUs() {
  return (
    <div className="portal-shell">
      <Head>
        <title>聯絡我們 (Contact Us) - StupidPig.com</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <nav className="portal-nav">
        <div className="logo-section">
          <Link href="/" legacyBehavior>
            <span className="logo-emoji" style={{ cursor: 'pointer' }}>🐷</span>
          </Link>
          <span className="logo-text">Stupid<span>Pig</span></span>
        </div>
        <Link href="/" legacyBehavior>
          <a className="back-btn">返回主大堂 (Back to Hub)</a>
        </Link>
      </nav>

      <main className="portal-content" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(91, 33, 182, 0.15) 0%, rgba(10, 9, 20, 0.6) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            ✉️ 聯絡我們 (Contact Us)
          </h1>
          
          <div style={{ color: '#8c89ad', fontSize: '0.95rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p>
              想搵我們合作推廣？或者有優質嘅開源摸魚遊戲推薦？歡迎隨時與我們聯絡！
            </p>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <strong style={{ color: '#fff', display: 'block', fontSize: '1rem', marginBottom: '4px' }}>📬 合作與商務電郵 (Business Email)</strong>
                <a href="mailto:admin@stupidpig.com" style={{ color: '#007aff', textDecoration: 'underline', fontSize: '1.1rem', fontWeight: '600' }}>
                  admin@stupidpig.com
                </a>
              </div>

              <div>
                <strong style={{ color: '#fff', display: 'block', fontSize: '1rem', marginBottom: '4px' }}>💬 大灣區摸魚交流群 (WeChat/Telegram)</strong>
                <span style={{ color: '#fff', fontSize: '0.95rem' }}>
                  請添加微信或 TG 備註「傻豬摸魚合作」，會有小助手拉您入群討論。
                </span>
              </div>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>🤝 合作方向 (Partnership Options)</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <strong style={{ color: '#fff' }}>遊戲投稿 (Game Submission)</strong>：如果您是獨立遊戲開發者，歡迎將您的 WebGL 遊戲連結或 GitHub 開源倉庫網址投遞給我們。
              </li>
              <li>
                <strong style={{ color: '#fff' }}>廣告與宣傳合作 (Advertisement)</strong>：適合各類辦公軟體、摸魚神器外設、數位產品等在本站進行曝光展示。
              </li>
              <li>
                <strong style={{ color: '#fff' }}>開源聯動專案 (Open Source Joint Project)</strong>：歡迎 Github 團隊或開源聯盟與我們洽談各類開源遊戲專案聯名宣傳。
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
