import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * UniversalGameWrapper
 * Secures, sandboxes, and handles real-time bridge communications
 * between external HTML5/WebGL games (running in iframe) and the Next.js portal shell.
 */
export const UniversalGameWrapper = ({
  gameUrl,
  gameId,
  allowedOrigin = '*',
  onGameLoaded,
  onScoreSubmitted,
  onProgressSaved,
  onRequireAuth
}) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  }, []);

  const keyboardWasmGames = ['porydrive', 'snowboarder', 'cubes2', 'spaceminer', 'tuxocide'];

  const getKeyCodeVal = (code) => {
    const vals = {
      'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40,
      'Space': 32, 'KeyW': 87, 'KeyA': 65, 'KeyS': 83, 'KeyD': 68
    };
    return vals[code] || 0;
  };

  const getMappedKey = (dir) => {
    if (gameId === 'tuxocide') {
      if (dir === 'up') return 'KeyW';
      if (dir === 'left') return 'KeyA';
      if (dir === 'down') return 'KeyS';
      if (dir === 'right') return 'KeyD';
    }
    if (dir === 'up') return 'ArrowUp';
    if (dir === 'left') return 'ArrowLeft';
    if (dir === 'down') return 'ArrowDown';
    if (dir === 'right') return 'ArrowRight';
    return '';
  };

  const sendKeyEvent = (type, keyCode) => {
    if (!keyCode) return;
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const e = new KeyboardEvent(type, {
          code: keyCode,
          key: keyCode,
          keyCode: getKeyCodeVal(keyCode),
          which: getKeyCodeVal(keyCode),
          bubbles: true,
          cancelable: true
        });
        iframeRef.current.contentWindow.dispatchEvent(e);
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (doc) doc.dispatchEvent(e);
      } catch (err) {
        console.warn("[GameWrapper] Failed to dispatch virtual key event:", err);
      }
    }
  };

  const sendMouseClick = (type) => {
    if (iframeRef.current) {
      try {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        const canvas = doc?.getElementById('canvas') || doc?.getElementById('game-canvas');
        if (canvas) {
          const e = new MouseEvent(type, {
            button: 0,
            bubbles: true,
            cancelable: true
          });
          canvas.dispatchEvent(e);
        }
      } catch (err) {
        console.warn("[GameWrapper] Failed to dispatch virtual click event:", err);
      }
    }
  };

  useEffect(() => {
    // 1. Establish window message event listener
    const handleGameMessage = (event) => {
      // Security check: validate origin if wildcard is not allowed
      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) {
        console.warn(`[Portal Shell] Rejected postMessage from untrusted origin: ${event.origin}`);
        return;
      }

      const { data } = event;
      if (!data || typeof data !== 'object') return;

      // Filter messages originating from this portal structure
      if (!data.type || !data.type.startsWith('STUPIDPIG_')) return;

      console.log(`[Portal Shell] Received event: ${data.type}`, data);

      switch (data.type) {
        case 'STUPIDPIG_GAME_LOADED':
          setIsLoading(false);
          if (onGameLoaded) onGameLoaded(data.gameId);
          // Send auth token back to iframe if needed
          sendAuthToken();
          break;

        case 'STUPIDPIG_SUBMIT_SCORE':
          if (onScoreSubmitted) {
            // Hand over score, points, and integrity signature to parent callback
            onScoreSubmitted({
              gameId: data.gameId || gameId,
              score: data.score,
              coinsEarned: data.coinsEarned || Math.floor(data.score / 10),
              signature: data.signature // HMAC generated inside game to prevent console manipulation
            });
          }
          break;

        case 'STUPIDPIG_SAVE_PROGRESS':
          if (onProgressSaved) {
            onProgressSaved({
              gameId: data.gameId || gameId,
              gameStateData: data.payload
            });
          }
          break;

        case 'STUPIDPIG_REQUIRE_AUTH':
          if (onRequireAuth) {
            onRequireAuth();
          }
          break;

        default:
          console.log(`[Portal Shell] Unhandled transaction topic: ${data.type}`);
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, [gameId, allowedOrigin, onGameLoaded, onScoreSubmitted, onProgressSaved, onRequireAuth]);

  /**
   * Dispatches current user credentials / JWT securely into the game sandbox
   */
  const sendAuthToken = () => {
    const token = localStorage.getItem('stupidpig_auth_token');
    if (token && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'PORTAL_AUTH_RESPONSE',
          token: token
        },
        allowedOrigin
      );
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (iframeRef.current) {
      try {
        iframeRef.current.focus();
      } catch (e) {
        console.warn("[GameWrapper] Failed to auto-focus on load:", e);
      }
    }
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleContainerClick = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  return (
    <div 
      className="game-wrapper-container" 
      onClick={handleContainerClick}
      onMouseEnter={handleContainerClick}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {isLoading && (
        <div className="loading-spinner-overlay" style={styles.overlay}>
          <div className="spinner"></div>
          <p style={{ marginTop: 10, color: '#107c41', fontFamily: 'sans-serif' }}>正在啟動遊戲模組...</p>
        </div>
      )}

      {hasError && (
        <div className="error-overlay" style={styles.overlay}>
          <p style={{ color: '#d83b01', fontWeight: 'bold' }}>❌ 載入遊戲失敗，請稍後再試！</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={gameUrl}
        id={`stupidpig-frame-${gameId}`}
        title={`StupidPig Game - ${gameId}`}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0a0914',
          borderRadius: '8px'
        }}
        allow="autoplay; fullscreen; geolocation; microphone; pointer-lock"
      />

      {/* Floating Virtual Controller Overlay for Wasm Games on Mobile/Touch screens */}
      {isTouchDevice && keyboardWasmGames.includes(gameId) && (
        <div style={styles.virtualGamepad}>
          {/* Left Side D-Pad */}
          <div style={styles.dpadContainer}>
            <div 
              style={{ ...styles.dpadBtn, gridArea: '1 / 2 / 2 / 3' }}
              onTouchStart={() => sendKeyEvent('keydown', getMappedKey('up'))}
              onTouchEnd={() => sendKeyEvent('keyup', getMappedKey('up'))}
            >
              ▲
            </div>
            <div 
              style={{ ...styles.dpadBtn, gridArea: '2 / 1 / 3 / 2' }}
              onTouchStart={() => sendKeyEvent('keydown', getMappedKey('left'))}
              onTouchEnd={() => sendKeyEvent('keyup', getMappedKey('left'))}
            >
              ◀
            </div>
            <div 
              style={{ ...styles.dpadBtn, gridArea: '2 / 3 / 3 / 4' }}
              onTouchStart={() => sendKeyEvent('keydown', getMappedKey('right'))}
              onTouchEnd={() => sendKeyEvent('keyup', getMappedKey('right'))}
            >
              ▶
            </div>
            <div 
              style={{ ...styles.dpadBtn, gridArea: '3 / 2 / 4 / 3' }}
              onTouchStart={() => sendKeyEvent('keydown', getMappedKey('down'))}
              onTouchEnd={() => sendKeyEvent('keyup', getMappedKey('down'))}
            >
              ▼
            </div>
          </div>

          {/* Right Side Action buttons */}
          <div style={styles.actionContainer}>
            <div 
              style={styles.actionBtn}
              onTouchStart={() => {
                sendKeyEvent('keydown', 'Space');
                sendMouseClick('mousedown');
              }}
              onTouchEnd={() => {
                sendKeyEvent('keyup', 'Space');
                sendMouseClick('mouseup');
              }}
            >
              ACT
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  virtualGamepad: {
    position: 'absolute',
    bottom: '25px',
    left: '20px',
    right: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    pointerEvents: 'none',
    zIndex: 100
  },
  dpadContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 46px)',
    gridTemplateRows: 'repeat(3, 46px)',
    gap: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '8px',
    borderRadius: '16px',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    pointerEvents: 'auto'
  },
  dpadBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '10px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    touchAction: 'none'
  },
  actionContainer: {
    pointerEvents: 'auto'
  },
  actionBtn: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 42, 42, 0.7)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(255, 42, 42, 0.35)',
    border: '2px solid rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none'
  }
};

UniversalGameWrapper.propTypes = {
  gameUrl: PropTypes.string.isRequired,
  gameId: PropTypes.string.isRequired,
  allowedOrigin: PropTypes.string,
  onGameLoaded: PropTypes.func,
  onScoreSubmitted: PropTypes.func,
  onProgressSaved: PropTypes.func,
  onRequireAuth: PropTypes.func
};
