import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardGrid from '../../components/DashboardGrid';

const CATEGORIES_DATA = {
  hyper_casual: {
    title: '🪂 辦公室扮工摸魚小遊戲 - 傻豬摸魚遊戲網 (StupidPig.com)',
    description: '精選香港打工仔專屬辦公室摸魚小遊戲！支持 Spacebar 一鍵切換 Excel / Outlook 畫面，即點即玩免下載，助你安全躲避老細突擊巡房！',
    label: '🪂 扮工摸魚 (Hyper-Casual)',
    heading: '🪂 辦公室扮工摸魚小遊戲精選',
    subtitle: '專為打工仔度身訂造嘅極速休閒摸魚遊戲，支持一鍵變 Excel，安心扮工無難度！',
    keywords: '辦公室摸魚, 扮工摸魚, 網頁小遊戲, 免下載遊戲, 廣東話遊戲, 打小人, 十號風球返工, 街市殺價'
  },
  puzzle: {
    title: '🧩 燒腦智力益智小遊戲 - 傻豬摸魚遊戲網 (StupidPig.com)',
    description: '挑戰 2048、六角俄羅斯方塊等開源益智燒腦神作！提升辦公室智力極限，免安裝即點即玩，輕鬆打發無聊工作時間！',
    label: '🧩 燒腦智力 (Puzzles)',
    heading: '🧩 燒腦智力益智小遊戲精選',
    subtitle: '訓練邏輯思維與空間感嘅益智燒腦遊戲，適度摸魚醒腦，效率事半功倍！',
    keywords: '智力遊戲, 2048網頁版, Hextris, 俄羅斯方塊, 燒腦遊戲, 益智小遊戲'
  },
  arcade: {
    title: '🕹️ 經典懷舊街機網頁遊戲 - 傻豬摸魚遊戲網 (StupidPig.com)',
    description: '重溫經典 Doom 3D、雷霆戰機、太空採礦等懷舊街機精品！配備一鍵 Excel 掩護功能，讓你在辦公室重溫熱血街機情懷！',
    label: '🕹️ 懷舊街機 (Arcade)',
    heading: '🕹️ 經典懷舊街機網頁遊戲精選',
    subtitle: '懷舊像素空戰、射擊與 3D 街機大作，帶你重溫童年經典，兼備一秒隱藏保護！',
    keywords: '街機遊戲, Doom網頁版, 經典空戰遊戲, 太空礦工, 3D射擊遊戲'
  },
  open_source: {
    title: '🌐 Github 精選開源網頁遊戲 - 傻豬摸魚遊戲網 (StupidPig.com)',
    description: '彙整 Github 頂級開源與 WebAssembly 網頁遊戲專案！支持 PC 桌面下載版與網頁即玩版，感受開源社群嘅 摸魚智慧！',
    label: '🌐 開源精選 (Open Source)',
    heading: '🌐 Github 精選開源網頁遊戲',
    subtitle: '源自開源社群極客智慧的熱門網頁精品，支持代碼學習、離線運行與即玩！',
    keywords: '開源遊戲, Github網頁遊戲, WebAssembly遊戲, 網頁免下載, 開源精品'
  }
};

export default function CategoryPage({ categoryId, category, userCoins, userPoints }) {
  if (!category) return null;

  return (
    <div className="portal-shell">
      <Head>
        <title>{category.title}</title>
        <meta name="description" content={category.description} />
        <meta name="keywords" content={`${category.keywords}, StupidPig, 傻豬遊戲網, 摸魚遊戲, 網頁遊戲`} />
        <link rel="canonical" href={`https://stupidpig.com/category/${categoryId}`} />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={category.title} />
        <meta property="og:description" content={category.description} />
        <meta property="og:url" content={`https://stupidpig.com/category/${categoryId}`} />
        <meta property="og:site_name" content="StupidPig 傻豬遊戲網" />
        <meta property="og:image" content="https://stupidpig.com/game-screenshots/stupidpig-escape.png" />
        <meta property="og:locale" content="zh_HK" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={category.title} />
        <meta name="twitter:description" content={category.description} />
        <meta name="twitter:image" content="https://stupidpig.com/game-screenshots/stupidpig-escape.png" />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": category.heading,
              "description": category.description,
              "url": `https://stupidpig.com/category/${categoryId}`,
              "publisher": {
                "@type": "Organization",
                "name": "StupidPig",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://stupidpig.com/favicon.ico"
                }
              }
            })
          }}
        />
      </Head>

      {/* HEADER NAVIGATION */}
      <nav className="portal-nav">
        <Link href="/" legacyBehavior>
          <a className="logo-section" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <span className="logo-emoji">🐷</span>
            <span className="logo-text">Stupid<span>Pig</span></span>
          </a>
        </Link>
        <div className="nav-stats">
          <div className="stat-chip">
            <span className="coin">🪙</span>
            <span>{userCoins || 100} 傻豬幣</span>
          </div>
          <div className="stat-chip">
            <span className="score">🏆</span>
            <span>{userPoints || 0} 點</span>
          </div>
        </div>
      </nav>

      {/* PORTAL CONTENT */}
      <main className="portal-content">
        <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0', letterSpacing: '-0.3px' }}>
              {category.heading}
            </h1>
            <Link href="/" legacyBehavior>
              <a
                style={{
                  backgroundColor: 'rgba(0, 113, 227, 0.08)',
                  border: '1px solid rgba(0, 113, 227, 0.2)',
                  color: '#0071e3',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                🏠 返回主頁
              </a>
            </Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', margin: '0' }}>
            {category.subtitle}
          </p>
        </div>

        <div className="dashboard-layout">
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0 }}>
            {/* Category selection header mimicking index filters but linked */}
            <div className="category-filters">
              <Link href="/" legacyBehavior>
                <a className="filter-btn" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  📂 全部遊戲
                </a>
              </Link>
              {Object.keys(CATEGORIES_DATA).map(catKey => {
                const isCurrent = catKey === categoryId;
                return (
                  <Link href={`/category/${catKey}`} key={catKey} legacyBehavior>
                    <a
                      className={`filter-btn ${isCurrent ? 'active' : ''}`}
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      {CATEGORIES_DATA[catKey].label}
                    </a>
                  </Link>
                );
              })}
            </div>

            <DashboardGrid activeCategory={categoryId} />
          </section>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
        <p>© 2026 StupidPig.com 傻豬遊戲網. All rights reserved.</p>
        <p style={{ marginTop: '6px', opacity: 0.85 }}>
          合作夥伴：<a href="https://macausite.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '500' }}>macausite.com 多媒體 (Macausite Multimedia)</a>
        </p>
        
        {/* Category cross links map */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', opacity: 0.8 }}>
          <strong>摸魚分類目錄：</strong>
          {Object.keys(CATEGORIES_DATA).map((catKey, i) => (
            <React.Fragment key={catKey}>
              <Link href={`/category/${catKey}`} legacyBehavior>
                <a style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
                  {CATEGORIES_DATA[catKey].label.split(' ')[1]}
                </a>
              </Link>
              {i < Object.keys(CATEGORIES_DATA).length - 1 && <span style={{ color: 'var(--border-color)' }}>•</span>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px' }}>
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

export async function getStaticPaths() {
  const paths = Object.keys(CATEGORIES_DATA).map(categoryId => ({
    params: { categoryId }
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { categoryId } = params;
  const category = CATEGORIES_DATA[categoryId] || null;
  return {
    props: {
      categoryId,
      category
    }
  };
}
