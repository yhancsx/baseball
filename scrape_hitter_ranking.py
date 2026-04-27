#!/usr/bin/env python3
"""
gameone.kr 타자 랭킹 테이블 스크래퍼
Usage: python3 scrape_hitter_ranking.py

결과물:
  - hit/2026_타격.csv
  - hit/2026_타격.json
"""

import json
import csv
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

SEASON = 2026
URL = f"https://www.gameone.kr/club/info/ranking/hitter?club_idx=36836&kind=&season={SEASON}"


def normalize(text: str) -> str:
    """공백/줄바꿈 정규화"""
    return re.sub(r"\s+", " ", text.strip())


def scrape() -> list[dict]:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"[*] 페이지 로딩 중: {URL}")
        page.goto(URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)  # 동적 렌더링 대기

        # 데이터가 있는 첫 번째 테이블 선택
        tables = page.query_selector_all("table")
        target_table = None
        for table in tables:
            rows = table.query_selector_all("tbody tr")
            if rows:
                target_table = table
                break

        if target_table is None:
            print("[!] 테이블을 찾을 수 없습니다.")
            browser.close()
            return []

        # ── 헤더 추출 (thead > tr > th) ──────────────────────────────
        header_els = target_table.query_selector_all("thead tr th")
        headers = [normalize(th.inner_text()) for th in header_els]
        print(f"[*] 컬럼 수: {len(headers)}")
        print(f"[*] 헤더: {headers}")

        # ── 데이터 행 추출 ────────────────────────────────────────────
        # tbody 의 각 tr 에는 th (순위·이름) + td (나머지 통계) 가 혼용됨
        rows = target_table.query_selector_all("tbody tr")
        print(f"[*] 데이터 행 수: {len(rows)}")

        records = []
        for row in rows:
            # th + td 순서대로 모두 가져옴
            cells = row.query_selector_all("th, td")
            values = [normalize(cell.inner_text()) for cell in cells]

            # 헤더 수와 셀 수 맞추기
            if len(values) < len(headers):
                values += [""] * (len(headers) - len(values))
            elif len(values) > len(headers):
                values = values[: len(headers)]

            record = dict(zip(headers, values))
            records.append(record)

        browser.close()
        return records


OUT_DIR = Path("hit")
CSV_PATH = OUT_DIR / "2026_타격.csv"
JSON_PATH = OUT_DIR / "2026_타격.json"


def save_csv(records: list[dict], path: Path = CSV_PATH):
    if not records:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)
    print(f"[✓] CSV 저장 완료: {path}  ({len(records)}행)")


def save_json(records: list[dict], path: Path = JSON_PATH):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"[✓] JSON 저장 완료: {path}  ({len(records)}행)")


if __name__ == "__main__":
    data = scrape()
    if data:
        save_csv(data)
        save_json(data)
        print("\n[샘플 데이터 (첫 3행)]")
        for row in data[:3]:
            print(row)
    else:
        print("[!] 추출된 데이터가 없습니다.")
