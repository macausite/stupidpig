import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="portal-shell">
      <Head>
        <title>私隱政策 (Privacy Policy) - StupidPig.com</title>
        <meta name="description" content="StupidPig 傻豬摸魚遊戲網的私隱政策。我們承諾並重視您的個人隱私、遊戲進度存檔與數據安全。" />
        <link rel="canonical" href="https://stupidpig.com/privacy" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="私隱政策 (Privacy Policy) - StupidPig.com" />
        <meta property="og:description" content="StupidPig 傻豬摸魚遊戲網的私隱政策。我們承諾並重視您的個人隱私、遊戲進度存檔與數據安全。" />
        <meta property="og:url" content="https://stupidpig.com/privacy" />
        <meta property="og:site_name" content="StupidPig 傻豬遊戲網" />
        <meta property="og:image" content="https://stupidpig.com/game-screenshots/stupidpig-escape.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="私隱政策 (Privacy Policy) - StupidPig.com" />
        <meta name="twitter:description" content="StupidPig 傻豬摸魚遊戲網的私隱政策。我們承諾並重視您的個人隱私、遊戲進度存檔與數據安全。" />
        <meta name="twitter:image" content="https://stupidpig.com/game-screenshots/stupidpig-escape.png" />
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
            🔒 私隱政策 (Privacy Policy)
          </h1>
          
          <div style={{ color: '#8c89ad', fontSize: '0.95rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>
              StupidPig.com（以下簡稱「本站」或「我們」）非常重視您的個人隱私。本政策說明我們如何收集、使用、披露和保護您在本站進行遊戲及瀏覽時的個人資料。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>1. 我們收集的資料</h3>
            <p>
              本站主要為免下載網頁遊戲。若您使用帳號功能或雲端排行榜，我們可能會收集您的登入認證資訊（例如匿名識別碼或由 Firebase Authentication 產生的 Token）、遊戲分數、傻豬幣餘額及遊戲成就數據。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>2. 資料的使用方式</h3>
            <p>
              收集到的資料將僅用於：維持您的登入狀態、更新全球/區域摸魚排行榜、記錄您的遊戲存檔與成就進度、防止排行榜作弊或操縱，以及優化本站遊戲的運作效能。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>3. 資料的安全保護</h3>
            <p>
              我們使用安全的 Firebase 雲端資料庫保存排行榜與帳戶數據，並採用多重加密與認證防護以防止資料外洩。請妥善保管您的本機憑證。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>4. Cookie 的使用</h3>
            <p>
              本站會於您的瀏覽器寫入本機快取（Local Storage）以記錄您的遊戲進度及認證狀態。這不屬於敏感追蹤，您隨時可透過瀏覽器設定清除快取。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>5. 政策更新與聯絡</h3>
            <p>
              我們可能會不定期更新本私隱政策。若有任何疑問，歡迎隨時聯絡我們的管理團隊。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
