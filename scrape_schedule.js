import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

// Usage: node scrape_schedule.js <club_idx> <team_name> <out_path>
// Example: node scrape_schedule.js 36972 "더이상은 NAVER" naver/2026/schedule.js
const CLUB_IDX = process.argv[2] ?? "36972";
const TEAM_NAME = process.argv[3] ?? "더이상은 NAVER";
const OUT_PATH = process.argv[4] ?? "naver/2026/schedule.js";

const TARGET_URL = `https://www.gameone.kr/club/info/schedule/table?club_idx=${CLUB_IDX}`;

async function scrapeSchedule() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log(`[*] 일정 페이지 로드 중: ${TARGET_URL}`);
  try {
    const games = [];
    let currentPage = 1;
    let hasMorePages = true;

    await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    while (hasMorePages) {
      console.log(`[*] ${currentPage} 페이지 파싱 중...`);

      const table = await page.$("table");
      if (!table) {
        console.error("[!] 일정을 찾을 수 없습니다 (테이블 없음).");
        break;
      }

      const rows = await table.$$("tbody tr");
      console.log(`[*] ${currentPage} 페이지 데이터 행 수: ${rows.length}`);

      for (let i = 0; i < rows.length; i++) {
        const cells = await rows[i].$$("td");
        if (cells.length < 5) continue;

        const date = await cells[0].innerText().then(t => t.replace(/\s+/g, " ").trim());
        const category = await cells[1].innerText().then(t => t.replace(/\s+/g, " ").trim());

        // 구장 정보는 표시 제외
        const displayCategory = category;

        // 매치 정보 추출 (Emblem + Name + Score)
        const matchData = await cells[3].evaluate((cell) => {
          const team1El = cell.querySelector('.game > .team1, .game > a > .team1');
          const team2El = cell.querySelector('.game > .team2, .game > a > .team2');

          const team1Name = team1El ? team1El.querySelector('.team_name').innerText.trim() : '';
          const team1Score = team1El ? team1El.querySelector('.score').innerText.trim() : '';

          const team2Name = team2El ? team2El.querySelector('.team_name').innerText.trim() : '';
          const team2Score = team2El ? team2El.querySelector('.score').innerText.trim() : '';

          return { team1Name, team1Score, team2Name, team2Score };
        });

        const { team1Name, team1Score: team1ScoreText, team2Name, team2Score: team2ScoreText } = matchData;
        const match = `${team1Name} vs ${team2Name}`;

        let result = null;
        let score = null;

        if (team1ScoreText && team2ScoreText) {
          const s1 = parseInt(team1ScoreText, 10);
          const s2 = parseInt(team2ScoreText, 10);

          if (!isNaN(s1) && !isNaN(s2)) {
            // target team이 Team 1인 경우
            if (team1Name.includes(TEAM_NAME)) {
              score = `${s1}:${s2}`;
              if (s1 > s2) result = "승";
              else if (s1 < s2) result = "패";
              else result = "무";
            }
            // target team이 Team 2인 경우
            else if (team2Name.includes(TEAM_NAME)) {
              score = `${s2}:${s1}`;
              if (s2 > s1) result = "승";
              else if (s2 < s1) result = "패";
              else result = "무";
            }
            // target team이 둘 다 없는 경우 (그냥 team1 vs team2 순서)
            else {
              score = `${s1}:${s2}`;
              if (s1 > s2) result = "승";
              else if (s1 < s2) result = "패";
              else result = "무";
            }
          }
        }

        games.push({
          date,
          category: displayCategory,
          match,
          result,
          score
        });
      }

      // 다음 페이지 링크 확인
      const nextPageNum = currentPage + 1;
      const nextPageEl = await page.$(`a[href*="page=${nextPageNum}"]`);
      if (nextPageEl) {
        const relativeHref = await nextPageEl.getAttribute("href");
        const nextUrl = new URL(relativeHref, page.url()).toString();
        console.log(`[*] 다음 페이지로 이동: ${nextUrl}`);
        await page.goto(nextUrl, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(2000);
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    // 크로놀로지컬 정렬 (날짜 오름차순)
    // GameOne에서 긁은 것은 최근 경기 순이므로 뒤집어 줌
    games.reverse();

    // ID 부여
    const finalGames = games.map((game, idx) => ({
      id: idx + 1,
      ...game
    }));

    // 폴더 생성 및 저장
    mkdirSync(dirname(OUT_PATH), { recursive: true });

    const content = `const scheduleData = ${JSON.stringify(finalGames, null, 4)};\n`;
    writeFileSync(OUT_PATH, content, "utf8");
    console.log(`[✓] 일정 저장 완료: ${OUT_PATH} (${finalGames.length} 경기)`);
    
  } catch (error) {
    console.error("[!] 에러 발생:", error);
  } finally {
    await browser.close();
  }
}

scrapeSchedule();
