import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { UniversalGameWrapper } from '../../components/GameWrapper';
import { gamesData, GAME_SCREENSHOTS } from '../../components/DashboardGrid';

const CONTROLS_MAP = {
  doom: '【W/A/S/D 或 方向鍵】移動 | 【Space/Ctrl】開槍 | 【1-9】換武器',
  wolf3d: '【W/A/S/D 或 方向鍵】移動 | 【Space/Ctrl】開槍 | 【1-9】換武器',
  game2048: '【方向鍵】移動滑動方塊 | 合併相同數值點心以獲取更高分數',
  hextris: '【方向鍵左右】旋轉六角形 | 【方向鍵下】加速方塊下落',
  adarkroom: '【滑鼠點擊】選擇操作、點燃營火同進行荒野探索',
  fnf: '【方向鍵 或 W/A/S/D】對準音樂節拍按下對應方向鍵面臨挑戰',
  catburglar: '【A/D 或 左右方向鍵】左右移動 | 【W 或 Space】跳躍',
  gaiamaker: '【滑鼠點擊】點擊並拖動天體設置質量與初始速度',
  clumsybird: '【滑鼠點擊 或 Space】控制小鳥飛行高度避開綠色水管',
  browserquest: '【滑鼠點擊】點擊地面移動，點擊怪物進行普通攻擊',
  cubes2: '【W/A/S/D】控制飛行方向 | 【滑鼠點擊/Space】發射子彈',
  snowboarder: '【A/D 或 左右鍵】左右滑行避開障礙物同松樹',
  snowling: '【滑鼠拖拽/移動】控制雪球滾動軌跡，撞倒企鵝保齡球',
  snowball: '【W/A/S/D】控制雪球滾動，避開障礙並儘量變大',
  spaceminer: '【滑鼠移動】控制准心 | 【滑鼠點擊】開槍採礦 | 【W/A/S/D】移動飛船',
  spherecollider: '【滑鼠移動/拖動】控制防禦罩方向，擊碎來襲球體',
  seapusher: '【滑鼠點擊】在上方滑軌點擊投入金幣推動寶藏',
  tuxpusher: '【滑鼠點擊】在滑軌點擊投放金幣，推落企鵝玩具',
  seriousshooter: '【滑鼠移動】瞄準紅黃色靶標 | 【滑鼠點擊】射擊標靶',
  porydrive: '【W/A/S/D 或 方向鍵】駕駛賽車 | 【Space】煞車飄移',
  tuxscape: '【A/D 或 左右方向鍵】避開冰川障礙 | 【Space】跳躍',
  tuxocide: '【W/A/S/D】控制移動 | 【滑鼠點擊】開槍射擊恐龍',
  aigeneratedgame: '【滑鼠點擊】控制射擊方向，彈射方塊獲得分數',
  tuxvsdragon: '【W/A/S/D】移動 | 【Space】掟雪球 | 【C】換相機視角',
};

const GAME_ORIENTATIONS = {
  // Portrait games
  'stupidpig-escape': 'portrait',
  'villain-hitting': 'portrait',
  'temple-chim': 'portrait',
  'red-minibus': 'portrait',
  'rainbow-toss': 'portrait',
  'waiter-frenzy': 'portrait',
  'fish-prawn-crab': 'portrait',
  'interview-hell': 'portrait',
  'hotpot-battle': 'portrait',
  'typhoon-commute': 'portrait',
  'bargaining-master': 'portrait',
  'k1945': 'portrait',
  'game2048': 'portrait',
  'hextris': 'portrait',
  'clumsybird': 'portrait',
  'snowling': 'portrait',
  'snowball': 'portrait',
  'spherecollider': 'portrait',
  'seapusher': 'portrait',
  'tuxpusher': 'portrait',

  // Landscape games
  'doom': 'landscape',
  'wolf3d': 'landscape',
  'porydrive': 'landscape',
  'snowboarder': 'landscape',
  'cubes2': 'landscape',
  'spaceminer': 'landscape',
  'tuxocide': 'landscape',
  'tuxscape': 'landscape',
  'tuxvsdragon': 'landscape',
  'seriousshooter': 'landscape',
  'browserquest': 'landscape',
  'adarkroom': 'landscape',
  'gaiamaker': 'landscape'
};

export default function PlayPage({ gameData, onUpdateCoins, onUpdatePoints }) {
  const router = useRouter();
  const { gameId } = router.query;
  const orientation = GAME_ORIENTATIONS[gameId] || 'portrait';

  // Initialize state synchronously with build-time/SSR gameData if available
  const [game, setGame] = useState(() => {
    if (!gameData) return null;
    const url = gameData.externalUrl || (gameData.id === 'merge' ? 'racing' : gameData.id);
    const gameUrl = gameData.externalUrl ? gameData.externalUrl : `http://127.0.0.1:3005/?game=${url}`;
    return {
      ...gameData,
      url: gameUrl
    };
  });

  // Live leaderboard state for gameplay engagement
  const [leaderboard, setLeaderboard] = useState([
    { name: '🥇 傻豬王', score: 12500 },
    { name: '🥈 蛋撻狂人', score: 9800 },
    { name: '🥉 燒賣戰神', score: 7400 },
    { name: '4. 奶茶大師', score: 5200 },
    { name: '5. 菠蘿油殺手', score: 3800 }
  ]);

  // Keep state in sync with props changes
  useEffect(() => {
    if (gameData) {
      const url = gameData.externalUrl || (gameData.id === 'merge' ? 'racing' : gameData.id);
      const gameUrl = gameData.externalUrl ? gameData.externalUrl : `http://127.0.0.1:3005/?game=${url}`;
      setGame({
        ...gameData,
        url: gameUrl
      });
    }
  }, [gameData]);

  const handleScoreSubmitted = (payload) => {
    // Update global state
    onUpdatePoints(payload.score);
    onUpdateCoins(payload.coinsEarned);

    // Update real-time leaderboard with the player's own score
    setLeaderboard(prev => {
      const newList = [...prev, { name: '⭐ 你 (You)', score: payload.score }];
      newList.sort((a, b) => b.score - a.score);
      return newList.slice(0, 5);
    });
  };

  const handleRestartClick = () => {
    const iframe = document.getElementById(`stupidpig-frame-${gameId}`);
    if (iframe) {
      console.log("[Portal] Posting restart message to game iframe...");
      iframe.contentWindow.postMessage({ type: 'STUPIDPIG_RESTART_GAME' }, '*');
    }
  };

  if (!game) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0914' }}>
        <p>正在加載遊戲模組...</p>
      </div>
    );
  }

  if (game.isDownloadOnly) {
    return (
      <div className="portal-shell">
        <Head>
          <title>{`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`}</title>
          <meta name="description" content={`${game.name} - ${game.desc} | 免下載網頁遊戲、即點即玩，支持一鍵 Excel 扮工隱藏！`} />
          <link rel="canonical" href={`https://stupidpig.com/play/${game.id}`} />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`} />
          <meta property="og:description" content={game.desc} />
          <meta property="og:url" content={`https://stupidpig.com/play/${game.id}`} />
          <meta property="og:site_name" content="StupidPig 傻豬遊戲網" />
          <meta property="og:image" content={`https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`} />
          <meta property="og:locale" content="zh_HK" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`} />
          <meta name="twitter:description" content={game.desc} />
          <meta name="twitter:image" content={`https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`} />

          {/* Schema.org Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VideoGame",
                "name": game.name,
                "description": game.desc,
                "genre": game.category === "hyper_casual" ? "Casual Game" : game.category === "puzzle" ? "Puzzle Game" : "Arcade Game",
                "playMode": "SinglePlayer",
                "applicationCategory": "GameApplication",
                "operatingSystem": "Windows, macOS, Linux, iOS, Android",
                "url": `https://stupidpig.com/play/${game.id}`,
                "image": `https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`,
                "screenshot": `https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`,
                "publisher": {
                  "@type": "Organization",
                  "name": "StupidPig"
                }
              })
            }}
          />
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

        <main className="play-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(91,33,182,0.15) 0%, rgba(10,9,20,0.6) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ backgroundColor: '#5b21b6', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>
                ⬇ PC 桌面下載版精選
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 8px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {game.emoji} {game.name}
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#8c89ad' }}>
                這是一款高階 3D 精品遊戲，需要下載到本機電腦運行以獲得最佳性能與畫質。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {game.downloadLinks?.steam && (
                <a href={game.downloadLinks.steam} target="_blank" rel="noopener noreferrer" style={{
                  backgroundColor: '#1b2838', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #2a475e', transition: 'all 0.2s'
                }}>
                  🎮 Steam 免費下載
                </a>
              )}
              {game.downloadLinks?.itch && (
                <a href={game.downloadLinks.itch} target="_blank" rel="noopener noreferrer" style={{
                  backgroundColor: '#fa5c5c', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                }}>
                  💧 Itch.io 下載頁
                </a>
              )}
            </div>
          </div>

          <div className="download-grid">
            {/* LEFT COLUMN: TRAILER & SCREENSHOTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* VIDEO EMBED */}
              {game.youtubeId && (
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: '#000'
                }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={`https://www.youtube.com/embed/${game.youtubeId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* DESCRIPTION & FEATURES */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginTop: 0, marginBottom: '12px' }}>
                  📝 遊戲簡介 (About Game)
                </h3>
                <p style={{ color: '#8c89ad', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  {game.desc}
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
                  ⚡ 特色亮點 (Highlights)
                </h3>
                <ul style={{ color: '#8c89ad', fontSize: '0.85rem', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                  <li>🎛️ 支援各類飛行手把 (Flight sticks / HOTAS)</li>
                  <li>👓 支援 OpenXR 虛擬實境 (VR Headset Support)</li>
                  <li>📊 Steam 自動同步排行榜及飛行 Replay / Ghost 數據</li>
                  <li>🌌 無限随机地形生成，自由享受急速穿梭快感</li>
                  <li>👥 支持多人連線競速模式，與全球玩家極限尬車</li>
                </ul>
              </div>

              {/* SCREENSHOTS GALLERY */}
              {game.screenshots && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginTop: 0, marginBottom: '12px' }}>
                    🖼️ 遊戲圖庫 (Screenshots)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {game.screenshots.map((url, i) => (
                      <div key={i} style={{
                        borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', aspectRatio: '16/9', backgroundColor: '#0a0914'
                      }}>
                        <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: SIDE DETAILS & METRICS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* DETAILS CARD */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffb300', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📊 遊戲詳細資料 (Specifications)
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: '#8c89ad' }}>遊戲引擎:</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>Unity 3D</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: '#8c89ad' }}>授權方式:</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>MIT 開源協議 (Free & Open Source)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: '#8c89ad' }}>VR 支援:</span>
                    <span style={{ color: '#00ff66', fontWeight: '600' }}>OpenXR VR (Windows)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: '#8c89ad' }}>外設支援:</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>搖桿/鍵鼠/遊戲手把</span>
                  </div>
                  {game.sourceUrl && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <span style={{ color: '#8c89ad' }}>GitHub 原始碼:</span>
                      <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007aff', textDecoration: 'underline' }}>
                        jukibom/FlyDangerous
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* GITHUB OVERVIEW CARD */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(36,41,47,0.6) 0%, rgba(10,9,20,0.85) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🐈‍⬛</span>
                <h4 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: '700' }}>本站開源聯動精選</h4>
                <p style={{ color: '#c5c2e0', fontSize: '0.75rem', lineHeight: '1.4', margin: '0 0 16px 0' }}>
                  StupidPig 精心整理 Github 優質開源遊戲專案。下載安裝，隨時隨地，暢快摸魚！
                </p>
                <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                  backgroundColor: '#24292f', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-block', transition: 'all 0.2s'
                }}>
                  ⭐ 前往 Github 點個 Star
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const controlsText = CONTROLS_MAP[gameId] || '【方向鍵 或 W/A/S/D】進行操作 | 【Space/Enter】確認或互動';

  return (
    <div className="portal-shell">
      <Head>
        <title>{`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`}</title>
        <meta name="description" content={`${game.name} - ${game.desc} | 免下載網頁遊戲、即點即玩，支持一鍵 Excel 扮工隱藏！`} />
        <link rel="canonical" href={`https://stupidpig.com/play/${game.id}`} />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`} />
        <meta property="og:description" content={game.desc} />
        <meta property="og:url" content={`https://stupidpig.com/play/${game.id}`} />
        <meta property="og:site_name" content="StupidPig 傻豬遊戲網" />
        <meta property="og:image" content={`https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`} />
        <meta property="og:locale" content="zh_HK" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${game.name} - 傻豬摸魚遊戲網 (StupidPig.com)`} />
        <meta name="twitter:description" content={game.desc} />
        <meta name="twitter:image" content={`https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`} />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              "name": game.name,
              "description": game.desc,
              "genre": game.category === "hyper_casual" ? "Casual Game" : game.category === "puzzle" ? "Puzzle Game" : "Arcade Game",
              "playMode": "SinglePlayer",
              "applicationCategory": "GameApplication",
              "operatingSystem": "Windows, macOS, Linux, iOS, Android",
              "url": `https://stupidpig.com/play/${game.id}`,
              "image": `https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`,
              "screenshot": `https://stupidpig.com${GAME_SCREENSHOTS[game.id] || '/game-screenshots/stupidpig-escape.png'}`,
              "publisher": {
                "@type": "Organization",
                "name": "StupidPig"
              }
            })
          }}
        />
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

      <main className="play-layout">
        <div className="play-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0' }}>
              {game.emoji} {game.name}
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#8c89ad' }}>
              類別: {game.category === 'hyper_casual' ? '休閒益智' : '開源精品'} | 引擎: WebGL/Emscripten
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="header-btn" onClick={handleRestartClick} style={{ backgroundColor: '#0071e3' }}>
              🔄 重新開始 (Restart Game)
            </button>
          </div>
        </div>

        {/* CONTAINER HOLDING SANDBOX IFRAME & LEADERBOARD/CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
          <div className={`play-container-wrapper ${orientation}-frame`} style={{ flex: 1, minHeight: '550px' }}>
            <UniversalGameWrapper
              gameUrl={game.url}
              gameId={game.id}
              allowedOrigin="*"
              onScoreSubmitted={handleScoreSubmitted}
            />
          </div>

          {/* CONTROLS CARD */}
          <div className="panel-card" style={{ padding: '20px' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.05rem', color: '#00d8ff', marginTop: 0, marginBottom: '8px' }}>
              🎮 遊戲操作指南 (Controls Guide)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#8c89ad', marginBottom: '10px' }}>
              支持鍵盤與滑鼠流暢操作：
            </p>
            <div
              style={{
                backgroundColor: '#161527',
                border: '1px solid #23223f',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                lineHeight: '1.6',
                color: '#ffffff'
              }}
            >
              {controlsText}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = gamesData.map(g => ({
    params: { gameId: g.id }
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { gameId } = params;
  const gameData = gamesData.find(g => g.id === gameId) || null;
  return {
    props: {
      gameData
    }
  };
}
