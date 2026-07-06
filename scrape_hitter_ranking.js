/**
 * gameone.kr 타자 랭킹 테이블 스크래퍼 (Node.js / Playwright)
 * Usage: node scrape_hitter_ranking.js
 *
 * 결과물:
 *   hit/2026_hit.csv
 *   hit/2026_hit.json
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── 상수 ──────────────────────────────────────────────────────────
// CLI 인수로 시즌 및 클럽 ID 지정 가능: node scrape_hitter_ranking.js 2026 36836
const SEASON = process.argv[2] ?? 2026;
const CLUB_IDX = process.argv[3] ?? "36836";
const URL = `https://www.gameone.kr/club/info/ranking/hitter?club_idx=${CLUB_IDX}&kind=&season=${SEASON}`;
const OUT_DIR = CLUB_IDX === "36972" ? "naver/hit" : "home_instagram/hit";
const CSV_PATH = join(OUT_DIR, `${SEASON}_hit.csv`);
const JSON_PATH = join(OUT_DIR, `${SEASON}_hit.json`);

// ── 유틸 ──────────────────────────────────────────────────────────
const normalize = (text) => text.replace(/\s+/g, " ").trim();

// ── 스크래핑 ──────────────────────────────────────────────────────
async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`[*] 페이지 로딩 중: ${URL}`);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2000);

  const tables = await page.$$("table");
  const records = [];
  console.log(`[*] 발견된 테이블 수: ${tables.length}`);

  for (let tIdx = 0; tIdx < tables.length; tIdx++) {
    const table = tables[tIdx];
    const rowCount = await table.$$eval("tbody tr", (rows) => rows.length);
    if (rowCount === 0) continue;

    console.log(`[*] 테이블 [${tIdx + 1}] 파싱 시작 (데이터 행 수: ${rowCount})`);

    // 헤더 추출 (thead > tr > th) 및 컬럼 통일 ("경기" -> "게임수")
    const headers = await table.$$eval("thead tr th", (ths) =>
      ths.map((th) => {
        const text = th.innerText.replace(/\s+/g, " ").trim();
        return text === "경기" ? "게임수" : text;
      })
    );

    if (headers.length === 0) {
      console.log(`[!] 테이블 [${tIdx + 1}] 헤더를 찾을 수 없어 건너뜁니다.`);
      continue;
    }

    console.log(`[*] 테이블 [${tIdx + 1}] 컬럼 수: ${headers.length}`);
    console.log(`[*] 테이블 [${tIdx + 1}] 헤더: ${headers.join(", ")}`);

    // 데이터 행 추출
    const rows = await table.$$("tbody tr");
    for (const row of rows) {
      const values = await row.$$eval("th, td", (cells) =>
        cells.map((c) => c.innerText.replace(/\s+/g, " ").trim())
      );

      // 헤더 수에 맞게 조정
      while (values.length < headers.length) values.push("");
      const sliced = values.slice(0, headers.length);

      const record = Object.fromEntries(headers.map((h, i) => [h, sliced[i]]));
      records.push(record);
    }
  }

  await browser.close();
  return records;
}

// ── CSV 저장 ──────────────────────────────────────────────────────
function saveCsv(records, path = CSV_PATH) {
  if (!records.length) return;
  mkdirSync(OUT_DIR, { recursive: true });

  const headers = Object.keys(records[0]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...records.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  // Excel 호환: UTF-8 BOM 추가
  writeFileSync(path, "\uFEFF" + lines.join("\n"), "utf8");
  console.log(`[✓] CSV 저장 완료: ${path}  (${records.length}행)`);
}

// ── JSON 저장 ─────────────────────────────────────────────────────
function saveJson(records, path = JSON_PATH) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(records, null, 2), "utf8");
  console.log(`[✓] JSON 저장 완료: ${path}  (${records.length}행)`);
}

// ── 메인 ─────────────────────────────────────────────────────────
const data = await scrape();

if (data.length) {
  saveCsv(data);
  saveJson(data);
  console.log("\n[샘플 데이터 (첫 3행)]");
  data.slice(0, 3).forEach((row) => console.log(JSON.stringify(row)));
} else {
  console.error("[!] 추출된 데이터가 없습니다.");
  process.exit(1);
}
