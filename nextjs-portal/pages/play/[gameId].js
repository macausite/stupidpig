import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { UniversalGameWrapper } from '../../components/GameWrapper';
import { gamesData } from '../../components/DashboardGrid';

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

export default function PlayPage({ onUpdateCoins, onUpdatePoints }) {
  const router = useRouter();
  const { gameId } = router.query;
  const orientation = GAME_ORIENTATIONS[gameId] || 'portrait';
  const [game, setGame] = useState(null);

  // Live leaderboard state for gameplay engagement
  const [leaderboard, setLeaderboard] = useState([
    { name: '🥇 傻豬王', score: 12500 },
    { name: '🥈 蛋撻狂人', score: 9800 },
    { name: '🥉 燒賣戰神', score: 7400 },
    { name: '4. 奶茶大師', score: 5200 },
    { name: '5. 菠蘿油殺手', score: 3800 }
  ]);

  useEffect(() => {
    if (gameId) {
      const found = gamesData.find(g => g.id === gameId);
      if (found) {
        if (found.externalUrl) {
          setGame({
            ...found,
            url: found.externalUrl
          });
        } else {
          const queryParam = gameId === 'merge' ? 'racing' : gameId;
          const gameUrl = `http://127.0.0.1:3005/?game=${queryParam}`;
          setGame({
            ...found,
            url: gameUrl
          });
        }
      }
    }
  }, [gameId]);

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
          <title>{game.name} - StupidPig Portal</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />
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
        <title>Playing - {game.name}</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐷</text></svg>" />
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {game.emoji} {game.name}
            </h2>
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
        <div className="play-grid">
          <div className={`play-container-wrapper ${orientation}-frame`}>
            <UniversalGameWrapper
              gameUrl={game.url}
              gameId={game.id}
              allowedOrigin="*"
              onScoreSubmitted={handleScoreSubmitted}
            />
          </div>

          {/* SIDEBAR PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* LEADERBOARD CARD */}
            <div className="panel-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '16px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#ffb300' }}>
                🏆 當局排行榜 (Leaderboard)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#8c89ad', marginBottom: '12px' }}>
                同同區摸魚玩家一較高下，挑戰最高極限！
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {leaderboard.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: item.name.includes('你') ? 'rgba(0, 113, 227, 0.25)' : '#161527',
                      border: item.name.includes('你') ? '1px solid #0071e3' : '1px solid #23223f',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: item.name.includes('你') ? '#6bb5ff' : '#ffffff',
                      fontWeight: item.name.includes('你') ? 'bold' : 'normal'
                    }}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontFamily: 'monospace', color: '#00ff66', fontWeight: 'bold' }}>
                      {item.score.toLocaleString()} 分
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONTROLS CARD */}
            <div className="panel-card" style={{ padding: '16px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#00d8ff' }}>
                🎮 遊戲操作指南
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#8c89ad', marginBottom: '8px' }}>
                支持鍵盤與滑鼠流暢操作：
              </p>
              <div
                style={{
                  backgroundColor: '#161527',
                  border: '1px solid #23223f',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  color: '#ffffff'
                }}
              >
                {controlsText}
              </div>
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

export async function getStaticProps() {
  return { props: {} };
}
