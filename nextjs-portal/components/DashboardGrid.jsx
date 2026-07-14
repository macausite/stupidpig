import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// NEW = added recently, HOT = high play count signal
const GAME_BADGES = {
  'stupidpig-escape': 'NEW',
  k1945: 'HOT',
  hextris: 'HOT',
  game2048: 'HOT',
  snowboarder: 'HOT',
  cubes2: 'NEW',
  clumsybird: 'HOT',
};

function trackGamePlay(gameId) {
  if (typeof window === 'undefined') return;
  // Track recent games (for continue playing panel)
  const recent = JSON.parse(localStorage.getItem('stupidpig_recent_games') || '[]');
  const updated = [gameId, ...recent.filter(id => id !== gameId)].slice(0, 20);
  localStorage.setItem('stupidpig_recent_games', JSON.stringify(updated));
  // Track all played games (for achievements)
  const played = JSON.parse(localStorage.getItem('stupidpig_played_games') || '[]');
  if (!played.includes(gameId)) {
    played.push(gameId);
    localStorage.setItem('stupidpig_played_games', JSON.stringify(played));
  }
}
export const gamesData = [
  {
    id: 'stupidpig-escape',
    name: '傻豬辦公室大逃亡 (StupidPig Escape)',
    category: 'arcade',
    emoji: '🐷',
    desc: 'StupidPig 旗艦招牌神作！老細突擊巡房，跳躍避開辦公桌雜物、狂食點心，按 [空格鍵] 即刻切換 Excel 扮工 camouflage！',
    externalUrl: '/games/stupidpig-escape/index.html',
    sourceUrl: 'https://github.com/Stupidpig/stupidpig-escape'
  },
  {
    id: 'villain-hitting',
    name: '鵝頸橋打小人 (Villain Hitting)',
    category: 'hyper_casual',
    emoji: '🥿',
    desc: '香港非物質文化遺產！喺鵝頸橋底，用經典紅拖鞋狠狠抽打小人（賤老細、二五仔、衰小人）！配備神奇「Excel 扮工遮蔽」同開運燒紙虎！',
    externalUrl: '/games/villain-hitting/index.html',
    sourceUrl: 'https://github.com/Stupidpig/villain-hitting'
  },
  {
    id: 'temple-chim',
    name: '廟街求籤開運 (Temple Street Chim)',
    category: 'hyper_casual',
    emoji: '🏮',
    desc: '油麻地天后廟神籤！虔誠求取靈籤、投擲茭杯確認神明指引，附設盞鬼辦公室開運解籤書同一鍵 Excel 扮工隱蔽！',
    externalUrl: '/games/temple-chim/index.html',
    sourceUrl: 'https://github.com/Stupidpig/temple-chim'
  },
  {
    id: 'red-minibus',
    name: '亡命紅Van大挑戰 (Red Minibus)',
    category: 'hyper_casual',
    emoji: '🚐',
    desc: '深宵紅色小巴 Nathan Road 高速狂飆！在呼嘯而過之前，用最地道嘅乘客暗號（例如「銀行中心有落！」）大聲喊停落車！一鍵 Excel 扮工隱藏！',
    externalUrl: '/games/red-minibus/index.html',
    sourceUrl: 'https://github.com/Stupidpig/red-minibus'
  },
  {
    id: 'rainbow-toss',
    name: '澳葡夜市掟彩虹 (Rainbow Toss)',
    category: 'hyper_casual',
    emoji: '🪙',
    desc: '經典澳門夜市攤位！精確控制力道角度投擲金幣，完美落在彩虹色帶中而不砸界！贏取獎券兌換葡撻等精美摸魚珍藏！',
    externalUrl: '/games/rainbow-toss/index.html',
    sourceUrl: 'https://github.com/Stupidpig/rainbow-toss'
  },
  {
    id: 'waiter-frenzy',
    name: '茶餐廳夥計瘋狂接單 (Waiter Frenzy)',
    category: 'hyper_casual',
    emoji: '🧑‍🍳',
    desc: '港式茶餐廳極速傳單！解碼「靚仔」、「飛沙走奶」等伙計黑話暗號，在顧客發脾氣前極速上菜，更可拼裝招牌焗豬扒飯配意粉！',
    externalUrl: '/games/waiter-frenzy/index.html',
    sourceUrl: 'https://github.com/Stupidpig/waiter-frenzy'
  },
  {
    id: 'fish-prawn-crab',
    name: '街頭魚蝦蟹 (Fish-Prawn-Crab)',
    category: 'hyper_casual',
    emoji: '🎲',
    desc: '懷舊街頭骰子遊戲！在魚、蝦、蟹、雞、葫蘆、鹿六大木格中押注本金，搖起瓷碗骰盅揭曉乾坤，原汁原味瓷碰撞音效與開運派彩！',
    externalUrl: '/games/fish-prawn-crab/index.html',
    sourceUrl: 'https://github.com/Stupidpig/fish-prawn-crab'
  },
  {
    id: 'interview-hell',
    name: '職場地獄見工記 (Interview Hell)',
    category: 'hyper_casual',
    emoji: '💼',
    desc: '大灣區最真實嘅荒謬面試！迎戰古怪 HR 與老細，挑選最奴性、最圓滑嘅「辦公室術語」爭取高起薪，或者一秒切換 Excel 扮工隱藏！',
    externalUrl: '/games/interview-hell/index.html',
    sourceUrl: 'https://github.com/Stupidpig/interview-hell'
  },
  {
    id: 'hotpot-battle',
    name: '地獄黑仔王: 打邊爐搶食戰 (Hot Pot Battle)',
    category: 'hyper_casual',
    emoji: '🍲',
    desc: '廣東人最愛打邊爐！精準算好肥牛、牛丸與冬菇嘅熟透黃金時刻落筷搶食，防範 CPU 對手無情偷走你碗中美食，附帶 Excel 熱量表！',
    externalUrl: '/games/hotpot-battle/index.html',
    sourceUrl: 'https://github.com/Stupidpig/hotpot-battle'
  },
  {
    id: 'typhoon-commute',
    name: '十號風球返工記 (Typhoon Commute)',
    category: 'hyper_casual',
    emoji: '🌀',
    desc: '強風暴雨中嘅打工仔奇蹟！橫跨大淹水、閃避飛天垃圾桶，在狂風吹拂下撳掣抵抗逆風，只求 9 點準時到辦公室打卡！附帶避難守則表！',
    externalUrl: '/games/typhoon-commute/index.html',
    sourceUrl: 'https://github.com/Stupidpig/typhoon-commute'
  },
  {
    id: 'bargaining-master',
    name: '街市殺價大師 (Bargaining Master)',
    category: 'hyper_casual',
    emoji: '🥬',
    desc: '大埔/旺角傳統街市搏殺！面對惡相魚檔、暴躁肉佬同尖酸菜婆，精確控制殺價滑條，以最平價格買齊食材，否則會被怒吼廣東話髒話！',
    externalUrl: '/games/bargaining-master/index.html',
    sourceUrl: 'https://github.com/Stupidpig/bargaining-master'
  },
  {
    id: 'k1945',
    name: 'k1945 (雷霆戰機 1945)',
    category: 'arcade',
    emoji: '✈️',
    desc: '經典街機風格垂直捲軸空戰射擊神作！操控戰機，閃避彈幕，挑戰巨型鋼鐵 Boss 守領！',
    externalUrl: '/games/k1945/index.html',
    sourceUrl: 'https://github.com/bombzj/k1945'
  },
  {
    id: 'game2048',
    name: '2048 (Original)',
    category: 'puzzle',
    emoji: '🔢',
    desc: 'Gabriele Cirulli 原創開源數字合併益智神作！合併相同數字擺正位置拼出 2048！',
    externalUrl: '/games/2048/index.html',
    sourceUrl: 'https://github.com/gabrielecirulli/2048'
  },
  {
    id: 'hextris',
    name: 'Hextris (Hex Tetris)',
    category: 'puzzle',
    emoji: '⬡',
    desc: '開源六角形俄羅斯方塊！瘋狂旋轉中央六邊形，消除相連嘅彩色方塊！',
    externalUrl: '/games/hextris/index.html',
    sourceUrl: 'https://github.com/hextris/hextris'
  },
  {
    id: 'clumsybird',
    name: 'Clumsy Bird (原創開源)',
    category: 'hyper_casual',
    emoji: '🐤',
    desc: 'Ellison Leao 原創開源 Flappy Bird 經典像素移植！避開綠色水管衝擊最高得分！',
    externalUrl: '/games/clumsy-bird/index.html',
    sourceUrl: 'https://github.com/ellisonleao/clumsy-bird'
  },
  {
    id: 'porydrive',
    name: 'PoryDrive 2.0 (多邊形賽車)',
    category: 'arcade',
    emoji: '🏎️',
    desc: 'mrbid 原創開源 3D 多邊形賽車遊戲！喺複雜嘅彩色賽道上避開障礙、高速奔馳！',
    externalUrl: '/games/porydrive/index.html',
    sourceUrl: 'https://github.com/mrbid/PoryDrive-2.0'
  },
  {
    id: 'snowboarder',
    name: 'Snowboarder (3D 滑雪)',
    category: 'hyper_casual',
    emoji: '🏂',
    desc: 'mrbid 原創開源 3D 滑雪極限運動遊戲！左右點擊避開松樹同雪崩，衝擊更遠嘅極限距離！',
    externalUrl: '/games/snowboarder/index.html',
    sourceUrl: 'https://github.com/mrbid/Snowboarder'
  },
  {
    id: 'cubes2',
    name: 'Cube Shooter (Cubes 2)',
    category: 'arcade',
    emoji: '🟥',
    desc: 'mrbid 原創開源 3D 射擊遊戲！控制黃色方塊，喺不斷旋轉嘅星空中擊碎所有跌落黎嘅紅藍方塊！',
    externalUrl: '/games/cubes2/index.html',
    sourceUrl: 'https://github.com/mrbid/Cubes2'
  },
  {
    id: 'spaceminer',
    name: 'SpaceMiner (太空礦工)',
    category: 'arcade',
    emoji: '🚀',
    desc: 'mrbid 原創開源 3D 太空採礦射擊遊戲！喺小行星帶中收集礦石，閃開所有太空碎片！',
    externalUrl: '/games/spaceminer/index.html',
    sourceUrl: 'https://github.com/mrbid/SpaceMiner'
  },
  {
    id: 'tuxocide',
    name: 'Tuxocide (企鵝射擊手)',
    category: 'arcade',
    emoji: '⚔️',
    desc: 'mrbid 原創開源 3D 企鵝反擊戰！控制企鵝喺旋轉平台上面消滅所有來襲嘅恐龍！',
    externalUrl: '/games/tuxocide/index.html',
    sourceUrl: 'https://github.com/mrbid/Tuxocide'
  }
];

const getGameGradient = (gameId) => {
  const gradients = {
    // Office / Casual games - Muted Apple Satin Finishes
    office_farm: 'linear-gradient(180deg, #f4fbf7 0%, #dcf1e5 100%)', // Muted Sage Green
    paper_toss: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)',  // Soft Slate Blue
    striker: 'linear-gradient(180deg, #fffcf9 0%, #f7eae1 100%)',     // Satin Gold
    jumper: 'linear-gradient(180deg, #faf6fc 0%, #eddcf5 100%)',      // Soft Lavender
    snake: 'linear-gradient(180deg, #f4fcfc 0%, #dcfafa 100%)',       // Mint Cyan
    breaker: 'linear-gradient(180deg, #fcf4f6 0%, #f5dce3 100%)',     // Muted Rose Pink

    // Open Source / Arcade games
    doom: 'linear-gradient(180deg, #fbf4f4 0%, #f1dcdc 100%)',        // Delicate Clay Crimson
    wolf3d: 'linear-gradient(180deg, #fcf6f4 0%, #f5e2dc 100%)',      // Soft Peach Orange
    'stupidpig-escape': 'linear-gradient(180deg, #fff2f5 0%, #ffd0db 100%)', // Soft Pink pig color
    'villain-hitting': 'linear-gradient(180deg, #fff2eb 0%, #ffd1ba 100%)', // Orange/Firecracker red
    'temple-chim': 'linear-gradient(180deg, #fcf4f4 0%, #f5dcdc 100%)',      // Soft red temple lantern color
    'red-minibus': 'linear-gradient(180deg, #fff2f2 0%, #ffd9d9 100%)',      // Soft light red
    'rainbow-toss': 'linear-gradient(180deg, #fff2fa 0%, #ffd0eb 100%)',     // Soft light pink
    'waiter-frenzy': 'linear-gradient(180deg, #fffcf4 0%, #fcf0d0 100%)',    // Soft light yellow
    'fish-prawn-crab': 'linear-gradient(180deg, #f7f6fb 0%, #e2dcf2 100%)',   // Soft light purple
    'interview-hell': 'linear-gradient(180deg, #f4fbf7 0%, #dcf1e5 100%)',   // Muted Sage Green
    'hotpot-battle': 'linear-gradient(180deg, #fff2f2 0%, #ffd9d9 100%)',    // Soft light red
    'typhoon-commute': 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)',  // Soft Slate Blue
    'bargaining-master': 'linear-gradient(180deg, #fffcf4 0%, #fcf0d0 100%)', // Soft light yellow
    game2048: 'linear-gradient(180deg, #fcfbf4 0%, #f5f1dc 100%)',    // Satin Straw Yellow
    hextris: 'linear-gradient(180deg, #faf6fc 0%, #eddcf5 100%)',     // Soft Lavender
    fnf: 'linear-gradient(180deg, #fdf4fa 0%, #f7dceb 100%)',         // Soft Magenta Rose
    catburglar: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)',  // Soft Slate Blue
    gaiamaker: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',   // Anodized Aluminum Grey
    clumsybird: 'linear-gradient(180deg, #f4fbf7 0%, #dcf1e5 100%)',  // Muted Sage Green
    browserquest: 'linear-gradient(180deg, #faf6fc 0%, #eddcf5 100%)', // Soft Lavender

    // Local WebAssembly games
    cubes2: 'linear-gradient(180deg, #fcf4f6 0%, #f5dce3 100%)',      // Muted Rose Pink
    snowboarder: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)', // Soft Slate Blue
    snowling: 'linear-gradient(180deg, #f4fcfc 0%, #dcfafa 100%)',    // Mint Cyan
    snowball: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',    // Anodized Aluminum Grey
    spaceminer: 'linear-gradient(180deg, #fffcf9 0%, #f7eae1 100%)',  // Satin Gold
    spherecollider: 'linear-gradient(180deg, #faf6fc 0%, #eddcf5 100%)', // Soft Lavender
    seapusher: 'linear-gradient(180deg, #f4fbf7 0%, #dcf1e5 100%)',   // Muted Sage Green
    tuxpusher: 'linear-gradient(180deg, #fcf6f4 0%, #f5e2dc 100%)',   // Soft Peach Orange
    seriousshooter: 'linear-gradient(180deg, #fcf4f6 0%, #f5dce3 100%)', // Muted Rose Pink
    porydrive: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)',   // Soft Slate Blue
    tuxscape: 'linear-gradient(180deg, #f4fbf7 0%, #dcf1e5 100%)',    // Muted Sage Green
    tuxocide: 'linear-gradient(180deg, #fcf6f4 0%, #f5e2dc 100%)',    // Soft Peach Orange
    aigeneratedgame: 'linear-gradient(180deg, #f4fcfc 0%, #dcfafa 100%)', // Mint Cyan
    tuxvsdragon: 'linear-gradient(180deg, #fbf4f4 0%, #f1dcdc 100%)', // Delicate Clay Crimson
    k1945: 'linear-gradient(180deg, #f4f9fc 0%, #dcecf5 100%)'        // Soft Slate Blue
  };
  return gradients[gameId] || 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)';
};

// Map game IDs to their screenshot image paths (in /public/game-screenshots/)
export const GAME_SCREENSHOTS = {
  'stupidpig-escape': '/game-screenshots/stupidpig-escape.png',
  'villain-hitting': '/game-screenshots/villain-hitting.png',
  'temple-chim': '/game-screenshots/temple-chim.png',
  'red-minibus': '/game-screenshots/red-minibus.png',
  'rainbow-toss': '/game-screenshots/rainbow-toss.png',
  'waiter-frenzy': '/game-screenshots/waiter-frenzy.png',
  'fish-prawn-crab': '/game-screenshots/fish-prawn-crab.png',
  'interview-hell': '/game-screenshots/interview-hell.png',
  'hotpot-battle': '/game-screenshots/hotpot-battle.png',
  'typhoon-commute': '/game-screenshots/typhoon-commute.png',
  'bargaining-master': '/game-screenshots/bargaining-master.png',
  // Real Selenium screenshots (Canvas/HTML5 games that render in headless)
  game2048:       '/game-screenshots/game2048.png',
  hextris:        '/game-screenshots/hextris.png',
  clumsybird:     '/game-screenshots/clumsybird.png',
  k1945:          '/game-screenshots/k1945.png',
  // AI-generated thumbnails for concept games
  merge:          '/game-screenshots/merge.jpg',
  bungee:         '/game-screenshots/bungee.jpg',
  catcher:        '/game-screenshots/catcher.jpg',
  doodlejump:     '/game-screenshots/doodlejump.jpg',
  snake:          '/game-screenshots/snake.jpg',
  brickbreaker:   '/game-screenshots/brickbreaker.jpg',
  suika:          '/game-screenshots/suika.jpg',
  sokoban:        '/game-screenshots/sokoban.jpg',
  minesweeper:    '/game-screenshots/minesweeper.jpg',
  memory:         '/game-screenshots/memory.jpg',
  flappypig:      '/game-screenshots/flappypig.jpg',
  gomoku:         '/game-screenshots/gomoku.jpg',
  farming:        '/game-screenshots/farming.jpg',
  doom:           '/game-screenshots/doom.jpg',
  wolf3d:         '/game-screenshots/wolf3d.jpg',
  fnf:            '/game-screenshots/fnf.jpg',
  catburglar:     '/game-screenshots/catburglar.jpg',
  gaiamaker:      '/game-screenshots/gaiamaker.jpg',
  browserquest:   '/game-screenshots/browserquest.jpg',
  tuxvsdragon:    '/game-screenshots/tuxvsdragon.jpg',
  // AI fallbacks for WebGL/WASM games (will be replaced with real screens later)
  cubes2:         '/game-screenshots/cubes2.jpg',
  snowboarder:    '/game-screenshots/snowboarder.jpg',
  snowling:       '/game-screenshots/snowling.jpg',
  snowball:       '/game-screenshots/snowball.jpg',
  spaceminer:     '/game-screenshots/spaceminer.jpg',
  spherecollider: '/game-screenshots/spherecollider.jpg',
  seapusher:      '/game-screenshots/seapusher.jpg',
  tuxpusher:      '/game-screenshots/tuxpusher.jpg',
  seriousshooter: '/game-screenshots/seriousshooter.jpg',
  porydrive:      '/game-screenshots/porydrive.jpg',
  tuxscape:       '/game-screenshots/tuxscape.jpg',
  tuxocide:       '/game-screenshots/tuxocide.jpg',
};

function GameCardVisual({ gameId, emoji, gameBadge, catLabel, isDownloadOnly }) {
  const imgSrc = GAME_SCREENSHOTS[gameId];
  return (
    <div className="card-visual" style={{ position: 'relative', overflow: 'hidden', padding: 0, background: '#0a0914' }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={gameId}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.35s ease'
          }}
          loading="lazy"
        />
      ) : (
        <span className="game-emoji" style={{ fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{emoji}</span>
      )}
      {/* Download-only game: show prominent download overlay */}
      {isDownloadOnly && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(88,28,220,0.85) 0%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: '10px', height: '60%',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            ⬇ 免費下載 FREE DOWNLOAD
          </span>
        </div>
      )}
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {gameBadge === 'HOT' && (
          <span className="card-badge" style={{ backgroundColor: '#ff3b30', color: '#fff' }}>🔥 HOT</span>
        )}
        {gameBadge === 'NEW' && (
          <span className="card-badge" style={{ backgroundColor: '#007aff', color: '#fff' }}>✨ NEW</span>
        )}
        {isDownloadOnly && (
          <span className="card-badge" style={{ backgroundColor: '#5b21b6', color: '#fff' }}>⬇ PC</span>
        )}
        {!gameBadge && catLabel && !isDownloadOnly && (
          <span className="card-badge">{catLabel}</span>
        )}
        {!gameBadge && !catLabel && !isDownloadOnly && (
          <span className="card-badge" style={{ backgroundColor: '#107c41', color: '#fff' }}>Playable</span>
        )}
      </div>
    </div>
  );
}

export const DashboardGrid = ({ activeCategory }) => {
  const handlePlay = useCallback((gameId) => {
    trackGamePlay(gameId);
  }, []);
  if (activeCategory === 'open_source') {
    const openSourceGames = gamesData;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* BANNER */}
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          color: '#1d1d1f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ flex: '1' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px', color: 'var(--apple-blue)', marginTop: '0' }}>
              🌐 經典開源聯動精選
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '800px', lineHeight: '1.5', margin: '0' }}>
              精選自 GitHub 及 Itch.io 社區嘅經典開源 HTML5/WebGL 遊戲，完全本地加載，極速流暢！
              包含 3D 滑雪、推金幣、太空採礦以及經典節奏對戰等豐富神作。
            </p>
          </div>
        </div>

        {/* OPEN SOURCE GAMES GRID */}
        <div className="game-grid">
          {openSourceGames.map(game => {
            const gameBadge = GAME_BADGES[game.id];
            return (
              <div key={game.id} className="game-card">
                <GameCardVisual gameId={game.id} emoji={game.emoji} gameBadge={gameBadge} catLabel={null} isDownloadOnly={!!game.isDownloadOnly} />
                <div className="card-details">
                  <h3>{game.name}</h3>
                  <p>{game.desc}</p>
                  <div style={{ marginTop: 'auto', width: '100%' }}>
                    <Link href={`/play/${game.id}`} legacyBehavior>
                      <a
                        className="play-btn"
                        onClick={() => handlePlay(game.id)}
                        style={{
                          width: '100%',
                          backgroundColor: game.isDownloadOnly ? '#5b21b6' : 'var(--apple-blue)',
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          padding: '8px 4px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        {game.isDownloadOnly ? '⬇ 免費下載 (Download)' : '即刻玩 (Play)'}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const filteredGames = activeCategory === 'all'
    ? gamesData
    : gamesData.filter(game => game.category === activeCategory);

  return (
    <div className="game-grid">
      {filteredGames.map(game => {
        const gameBadge = GAME_BADGES[game.id];
        const catLabel = game.category === 'hyper_casual' ? 'casual' : game.category === 'puzzle' ? 'puzzle' : 'arcade';
        return (
          <div key={game.id} className="game-card">
            <GameCardVisual gameId={game.id} emoji={game.emoji} gameBadge={gameBadge} catLabel={catLabel} />
            <div className="card-details">
              <h3>{game.name}</h3>
              <p>{game.desc}</p>
              <Link href={`/play/${game.id}`} legacyBehavior>
                <a className="play-btn" onClick={() => handlePlay(game.id)}>即刻玩 (Play Now)</a>
              </Link>
            </div>
          </div>
        );
      })}
      {filteredGames.length === 0 && (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#8c89ad' }}>
          ☕ 摸魚開發中，敬請期待新遊戲上架！
        </div>
      )}
    </div>
  );
};

DashboardGrid.propTypes = {
  activeCategory: PropTypes.string.isRequired
};

export default DashboardGrid;
