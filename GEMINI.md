This project is a static web application for the "Home_Instagram" baseball team, providing the 2026 season schedule, hitting statistics (2024-2026), and an AI-powered lineup generator. Data is rendered dynamically from JSON sources.

# Directory Structure & Key Files
*   `README.md`: Basic project title.
*   `2026/`: Contains the files for the 2026 season schedule.
    *   `2026/index.html`: Main schedule page.
    *   `2026/schedule.json`: Data source for game schedules.
*   `hit/`: Contains hitting statistics for 2024-2026.
    *   `hit/index.html`: Hitting statistics dashboard.
    *   `hit/202X_hit.json`: Data sources for yearly hitting statistics.
*   `lineup/`: Contains the AI-powered lineup generator.
    *   `lineup/index.html`: Lineup generation and management page.
*   `common.css`: Shared styling across all pages.

# Building and Running
As a static web project, there is no build step required.
To view the site with all features (JSON data loading) working correctly:
1.  Open your terminal in the project root directory.
2.  Run the following command to start a local server:
    ```bash
    npx serve .
    ```
3.  Open the provided local address (usually `http://localhost:3000`) in your browser.
4.  Navigate to:
    *   `/2026/`: Season Schedule
    *   `/hit/`: Hitting Statistics
    *   `/lineup/`: AI Lineup Generator

# Development Conventions
*   **Data Updates:** 
    *   Update schedules in `2026/schedule.json`.
    *   Update hitting stats in `hit/202X_hit.json`.
*   **Technologies:** Plain HTML, CSS (Vanilla), JavaScript (ES6+), and `html2canvas` for image downloads. AI features are powered by the Gemini API.
