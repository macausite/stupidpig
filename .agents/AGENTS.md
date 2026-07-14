# StupidPig Customization Rules (AGENTS.md)

This file contains custom workspace rules and guidelines for developer agents working on **StupidPig.com** (Next.js office slacking game portal).

---

## 🎨 Design & Layout Rules

1. **Lobby Cleanliness**: Maintain a clean, premium, single-column Apple-style dashboard grid on the home page. Avoid adding unnecessary sidebars, blocks, or widgets that clutter the central category filter and game card list.
2. **Game Screenshots**:
   - **HTML5/Canvas Games**: Screenshots must display actual loaded gameplay. Take screenshots of *only* the iframe element area, ensuring that the navigation bar, sidebar, and loading screen overlays are hidden.
   - **WebGL/Wasm Games**: Because headless Chrome runners lack GPU environments and fail to render WebGL, always fall back to high-quality `.jpg` illustrative game art on the home page cards to prevent showing blank or loading screens.

---

## 💻 Tech Stack & Routing Guidelines

1. **Next.js Static Export**:
   - The Next.js portal is configured for static site export (`output: 'export'`).
   - All dynamic routes (e.g., `/play/[gameId].js`, `/category/[categoryId].js`) **MUST** implement `getStaticPaths` and `getStaticProps` correctly to pre-render static HTML outputs at build time.
2. **Boss Key (Excel Camouflage)**:
   - Preserving the "一鍵扮工掩護" (Boss Key / Excel cover) trigger is critical. When modifying any playable game page, verify that the `Spacebar` (or designated keyboard shortcut) successfully activates the camouflage view.

---

## 🚀 Deployment & Operations

1. **Production Deployment**:
   - Always run the sitemap generator (`npm run build` or `node scripts/generate-sitemap.js`) before compiling.
   - Deploy to production using the Firebase CLI command: `npx firebase deploy --only hosting`.
2. **GitHub Sync**:
   - Keep the workspace in sync by committing and pushing all updates to the remote GitHub repository.
3. **Local Testing & Selenium Environment**:
   - The path for the ChromeDriver executable on this system is `/Users/roberto/Downloads/chromedriver-mac-x64`. Use this path in options or system configurations during Selenium runs.
