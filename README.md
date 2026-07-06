# ⚾ Amateur Baseball Teams Portal (baseball)

아마추어 야구팀 **"Home_Instagram"**과 **"더이상은 NAVER"**의 2026 시즌 일정 및 타격 기록 시각화, 그리고 AI 라인업 추천기를 통합 제공하는 정적 웹 포털 사이트입니다.

## 🔗 사이트 주소
*   **포털 메인:** https://yhancsx.github.io/baseball/

---

## 📂 디렉토리 구조 및 구성
*   `index.html`: 두 야구팀 페이지로 이동할 수 있는 관문(Portal Dashboard) 페이지입니다.
*   `common.css`: 전체 페이지에서 사용하는 공통 UI 및 디자인 스타일시트입니다.
*   `config.js`: Gemini AI 연동 등을 위한 설정 파일입니다.
*   
*   ### 🏠 Home_Instagram (홈인스타그램)
    *   `home_instagram/2026/`: 2026 시즌 경기 일정 시각화 및 schedule.js 데이터
    *   `home_instagram/hit/`: 2024~2026 시즌 타자 통계 대시보드 및 JSON 데이터
    *   `home_instagram/lineup/`: 타격 데이터를 기반으로 최적 타순을 제안하는 AI 라인업 추천기
*   
*   ### 💚 더이상은 NAVER (naver)
    *   `naver/2026/`: 2026 시즌 경기 일정 시각화 및 schedule.js 데이터
    *   `naver/hit/`: 2024~2026 시즌 타자 통계 대시보드 및 JSON 데이터
    *   `naver/lineup/`: 타격 데이터를 기반으로 최적 타순을 제안하는 AI 라인업 추천기

---

## 🛠️ 개발 및 로컬 실행 방법
이 프로젝트는 정적 파일(HTML, CSS, JS)로만 이루어진 웹 애플리케이션 포털입니다.
로컬 환경에서 전체 동작을 온전히 로딩 및 테스트하려면 로컬 서버를 실행해야 합니다.

1.  **패키지 설치:**
    ```bash
    npm install
    ```
2.  **로컬 서버 실행 (serve):**
    ```bash
    npx serve .
    ```
    이후 브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

---

## 🤖 데이터 크롤링 자동 업데이트 (GameOne 연동)
Playwright 기반의 크롤러 스크립트들을 통해 게임원(GameOne) 웹사이트의 원본 데이터를 긁어와 로컬 파일로 저장합니다. 

### 1. 타자 통계 크롤러 (`scrape_hitter_ranking.js`)
*   **Home_Instagram (club_idx=36836):**
    ```bash
    npm run scrape:home:hitter
    ```
*   **더이상은 NAVER (club_idx=36972):**
    ```bash
    npm run scrape:naver:hitter
    ```

### 2. 경기 일정 크롤러 (`scrape_schedule.js`)
*   **Home_Instagram (club_idx=36836):**
    ```bash
    npm run scrape:home:schedule
    ```
*   **더이상은 NAVER (club_idx=36972):**
    ```bash
    npm run scrape:naver:schedule
    ```

---

## 🚀 CI/CD 및 자동 배포 (GitHub Actions)
GitHub 저장소에 변경사항이 푸시되면 GitHub Actions를 통해 사이트가 자동으로 GitHub Pages에 배포됩니다.
또한 매일/매주 단위로 최신 야구 경기 일정과 성적 데이터를 크롤링하는 자동 크론 워크플로가 가동됩니다.

*   **Home_Instagram 데이터 업데이트:** 매주 일요일 오후 8시 KST 실행 (`Scrape Home Instagram Data`)
*   **더이상은 NAVER 데이터 업데이트:** 매일 오전 8시 KST 실행 (`Scrape Naver Data`)
*   **Pages 자동 배포:** 크론 작업 또는 main 브랜치 푸시 완료 시 자동으로 빌드 및 배포 연동 (`Deploy to GitHub Pages`)