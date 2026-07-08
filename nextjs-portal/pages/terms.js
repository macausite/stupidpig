import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="portal-shell">
      <Head>
        <title>服務條款 (Terms of Service) - StupidPig.com</title>
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
            📜 服務條款 (Terms of Service)
          </h1>
          
          <div style={{ color: '#8c89ad', fontSize: '0.95rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>
              歡迎造訪 StupidPig.com（以下簡稱「本網站」或「我們」）。當您瀏覽、存取或使用本網站提供的任何服務及遊戲時，即表示您已閱讀、理解並同意接受以下服務條款的約束。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>1. 服務內容與免責聲明</h3>
            <p>
              本網站主要展示並收錄各類優質的開源 HTML5/WebGL 遊戲專案，旨在提供免費休閒摸魚娛樂。所有遊戲的原始碼所有權均歸其對應的開源專案作者所有。
              我們不對遊戲的運行穩定性、流暢度或分數儲存功能做任何形式的承諾或保證。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>2. 使用者守則</h3>
            <p>
              當您使用本站提供的服務（如排行榜、成就系統）時，您承諾不進行任何作弊、惡意修改網頁控制台或使用外掛以操縱遊戲數據的行為。
              我們保留隨時清除異常或作弊分數、甚至限制特定帳戶訪問的權利，以維護公平的摸魚環境。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>3. 關於「扮工隱蔽模式」</h3>
            <p>
              本站遊戲設有「Excel 扮工隱蔽模式」及快速鍵操作，僅為使用者提供趣味性的辦公室隱私保護輔助。
              使用者因在辦公或工作時間內遊玩遊戲而導致的任何工作過失、管理處分或連帶法律責任，本網站概不承擔任何形式的責任。請適度摸魚。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>4. 智慧財產權</h3>
            <p>
              本站大堂的介面設計、主頁美術圖案、StupidPig 商標所有權均屬於本網站。
              各開源遊戲專案則遵循其各自的 MIT/GPL/Apache 開源協議授權，任何人如需進行二次開發或商業用途，請自行前往對應遊戲的 GitHub 儲存庫確認協議授權。
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '12px' }}>5. 條款修改</h3>
            <p>
              我們保留隨時修改或終止本服務條款的權利。修改後的條款將直接更新於此頁面，恕不另行通知。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
