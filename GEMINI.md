This project is a static web application portal for amateur baseball teams ("Home_Instagram" and "더이상은 NAVER"), providing their 2026 season schedules, hitting statistics (2024-2026), and AI-powered lineup generators. Data is rendered dynamically from JSON/JS sources.

# Directory Structure & Key Files
*   `index.html`: Main portal landing page (allows choosing between teams).
*   `common.css`: Shared styling across all pages.
*   `config.js`: API Keys and settings.
*   `scrape_hitter_ranking.js`: Node/Playwright scraper for hitter rankings on GameOne.
*   `scrape_schedule.js`: Node/Playwright scraper for club schedules on GameOne.
*   
*   ## Home_Instagram (Default Team)
    *   `home_instagram/2026/`: Files for the 2026 season schedule.
        *   `home_instagram/2026/index.html`: Main schedule page.
        *   `home_instagram/2026/schedule.js`: Data source for game schedules (manually managed).
    *   `home_instagram/hit/`: Hitting statistics (2024-2026).
        *   `home_instagram/hit/index.html`: Hitting statistics dashboard.
        *   `home_instagram/hit/202X_hit.json`: Data sources for yearly hitting statistics.
    *   `home_instagram/lineup/`: AI-powered lineup generator.
        *   `home_instagram/lineup/index.html`: Lineup generation page.

*   ## 더이상은 NAVER (Added Team)
    *   `naver/2026/`: Files for the 2026 season schedule.
        *   `naver/2026/index.html`: Main schedule page.
        *   `naver/2026/schedule.js`: Data source for game schedules (scraped).
    *   `naver/hit/`: Hitting statistics (2024-2026).
        *   `naver/hit/index.html`: Hitting statistics dashboard.
        *   `naver/hit/202X_hit.json`: Data sources for yearly hitting statistics.
    *   `naver/lineup/`: AI-powered lineup generator.
        *   `naver/lineup/index.html`: Lineup generation page.

# Building and Running
As a static web project, there is no build step required.
To view the site with all features (JSON data loading) working correctly:
1.  Open your terminal in the project root directory.
2.  Run the following command to start a local server:
    ```bash
    npx serve .
    ```
3.  Open the provided local address (usually `http://localhost:3000`) in your browser.

# Data Scraping and Updates
Data updates are automated via crawler scripts.

## Hitter Rankings (GameOne)
*   **Home_Instagram (club_idx=36836):**
    ```bash
    node scrape_hitter_ranking.js 2026 36836
    ```
    *(Scrapes into `home_instagram/hit/` directory)*
*   **더이상은 NAVER (club_idx=36972):**
    ```bash
    node scrape_hitter_ranking.js 2026 36972
    ```
    *(Scrapes into `naver/hit/` directory)*

## Schedules (GameOne)
*   **Home_Instagram (club_idx=36836):**
    ```bash
    node scrape_schedule.js 36836 "Home_Instagram" home_instagram/2026/schedule.js
    ```
    *(Scrapes and creates `home_instagram/2026/schedule.js`)*
*   **더이상은 NAVER (club_idx=36972):**
    ```bash
    node scrape_schedule.js 36972 "더이상은 NAVER" naver/2026/schedule.js
    ```
    *(Scrapes and creates `naver/2026/schedule.js`)*

# Development Conventions
*   **Technologies:** Plain HTML, CSS (Vanilla), JavaScript (ES6+), and `html2canvas` for image downloads. AI features are powered by the Gemini API.
