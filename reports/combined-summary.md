# 🎓 SmartCampusAI — Comprehensive Verification Dashboard

This dashboard shows the unified verification status for the entire SmartCampusAI workspace, including **Website E2E tests**, **Mobile App E2E tests**, **Backend Security Audit**, and **Load Test**.

**Build** #local | **Branch** `main` | **Commit** `local` | **Date** `2026-06-23T08:01:51.203+00:00Z`

---

## 🚀 Workspace Status Overview

| Component | Suite | Passed | Failed | Pass Rate | Status |
|-----------|-------|--------|--------|-----------|--------|
| Website E2E | SmartCampusAI Web — Full E2E Workflow | 47 | 0 | 100% | 🟢 PASSING |
| Mobile App E2E | SmartCampusAI Mobile — Full E2E Workflow | 18 | 0 | 100% | 🟢 PASSING |
| Backend Security | SmartCampusAI Security Suite | 18 | 0 | 100.0% | 🟢 PASSING |
| Backend Service Tests | SmartCampusAI Backend — Service Tests | 325 | 0 | 100% | 🟢 PASSING |
| Load Test (100u×60s) | Auth Server — 5 Endpoints | 5 | 0 | 100% | ⚠️ WARN |

> **Overall: ✅ ALL PASSING** — 408/408 checks + 5 load tests passing

---

## 🌐 Website E2E Verification Details

| Metric | Value |
|--------|-------|
| Total Test Cases | 47 |
| Passed | ✅ 47 |
| Failed | ❌ 0 |
| Pass Rate | 100% |
| Verification Date | 2026-06-23T08:01:51.203+00:00Z |

<details>
<summary>🔍 Click to view all Website Test Cases (47 total)</summary>

| # | Suite | Test Case | Status | Duration |
|---|-------|-----------|--------|----------|
| 1 | test_home.py | test_page_returns_200_and_loads | ✅ PASS | — |
| 2 | test_home.py | test_app_title_visible | ✅ PASS | — |
| 3 | test_home.py | test_page_document_title | ✅ PASS | — |
| 4 | test_home.py | test_tagline_visible | ✅ PASS | — |
| 5 | test_home.py | test_state_selector_present | ✅ PASS | — |
| 6 | test_home.py | test_board_selector_present | ✅ PASS | — |
| 7 | test_home.py | test_next_button_present | ✅ PASS | — |
| 8 | test_home.py | test_stats_row_visible | ✅ PASS | — |
| 9 | test_home.py | test_feature_cards_visible | ✅ PASS | — |
| 10 | test_home.py | test_india_badge_visible | ✅ PASS | — |
| 11 | test_home.py | test_free_badge_visible | ✅ PASS | — |
| 12 | test_home.py | test_step_indicator_visible | ✅ PASS | — |
| 13 | test_home.py | test_page_is_scrollable | ✅ PASS | — |
| 14 | test_home.py | test_state_dropdown_clickable | ✅ PASS | — |
| 15 | test_home.py | test_no_console_critical_errors | ✅ PASS | — |
| 16 | test_home.py | test_url_is_correct_base | ✅ PASS | — |
| 17 | test_home.py | test_page_load_within_timeout | ✅ PASS | — |
| 18 | test_accessibility.py | test_page_has_html_lang | ✅ PASS | — |
| 19 | test_accessibility.py | test_page_has_viewport_meta | ✅ PASS | — |
| 20 | test_accessibility.py | test_page_has_title | ✅ PASS | — |
| 21 | test_accessibility.py | test_page_has_charset | ✅ PASS | — |
| 22 | test_accessibility.py | test_no_broken_images | ✅ PASS | — |
| 23 | test_accessibility.py | test_page_is_not_empty | ✅ PASS | — |
| 24 | test_accessibility.py | test_text_content_readable | ✅ PASS | — |
| 25 | test_accessibility.py | test_page_font_size_not_tiny | ✅ PASS | — |
| 26 | test_accessibility.py | test_page_loads_under_15_seconds | ✅ PASS | — |
| 27 | test_accessibility.py | test_dom_content_loaded | ✅ PASS | — |
| 28 | test_accessibility.py | test_page_source_has_content | ✅ PASS | — |
| 29 | test_accessibility.py | test_no_http_error_in_title | ✅ PASS | — |
| 30 | test_search.py | test_search_screen_accessible | ✅ PASS | — |
| 31 | test_search.py | test_search_input_present | ✅ PASS | — |
| 32 | test_search.py | test_popular_tags_visible | ✅ PASS | — |
| 33 | test_search.py | test_search_suggestions_visible | ✅ PASS | — |
| 34 | test_search.py | test_multiple_tags_present | ✅ PASS | — |
| 35 | test_search.py | test_click_engineering_tag | ✅ PASS | — |
| 36 | test_search.py | test_click_medical_tag | ✅ PASS | — |
| 37 | test_search.py | test_search_for_iit | ✅ PASS | — |
| 38 | test_search.py | test_search_for_government | ✅ PASS | — |
| 39 | test_search.py | test_search_no_results_message | ✅ PASS | — |
| 40 | test_search.py | test_search_clear_returns_suggestions | ✅ PASS | — |
| 41 | test_navigation.py | test_home_tab_active_on_load | ✅ PASS | — |
| 42 | test_navigation.py | test_search_tab_navigates | ✅ PASS | — |
| 43 | test_navigation.py | test_compare_tab_navigates | ✅ PASS | — |
| 44 | test_navigation.py | test_home_tab_navigates_back | ✅ PASS | — |
| 45 | test_navigation.py | test_three_tabs_present | ✅ PASS | — |
| 46 | test_navigation.py | test_no_broken_navigation | ✅ PASS | — |
| 47 | test_navigation.py | test_search_to_home_flow | ✅ PASS | — |

</details>

---

## 📱 Mobile App E2E Verification Details

| Metric | Value |
|--------|-------|
| Total Test Cases | 18 |
| Passed | ✅ 18 |
| Failed | ❌ 0 |
| Pass Rate | 100% |
| Verification Date | 2026-06-23T08:01:51.203+00:00Z |

<details>
<summary>🔍 Click to view all Mobile Test Cases (18 total)</summary>

| # | Suite | Test Case | Status | Duration |
|---|-------|-----------|--------|----------|
| 1 | test_home_flow.py | test_home_screen_loads | ✅ PASS | — |
| 2 | test_home_flow.py | test_title_visible | ✅ PASS | — |
| 3 | test_home_flow.py | test_tagline_visible | ✅ PASS | — |
| 4 | test_home_flow.py | test_state_selector_present | ✅ PASS | — |
| 5 | test_home_flow.py | test_board_selector_present | ✅ PASS | — |
| 6 | test_home_flow.py | test_next_button_present | ✅ PASS | — |
| 7 | test_home_flow.py | test_scroll_reveals_stats | ✅ PASS | — |
| 8 | test_home_flow.py | test_state_dropdown_tappable | ✅ PASS | — |
| 9 | test_home_flow.py | test_no_crash_on_navigation | ✅ PASS | — |
| 10 | test_search.py | test_search_tab_accessible | ✅ PASS | — |
| 11 | test_search.py | test_popular_tags_visible | ✅ PASS | — |
| 12 | test_search.py | test_search_iit | ✅ PASS | — |
| 13 | test_search.py | test_search_nonsense_no_results | ✅ PASS | — |
| 14 | test_search.py | test_search_engineering | ✅ PASS | — |
| 15 | test_splash.py | test_app_launches | ✅ PASS | — |
| 16 | test_splash.py | test_splash_completes | ✅ PASS | — |
| 17 | test_splash.py | test_splash_shows_branding | ✅ PASS | — |
| 18 | test_splash.py | test_post_splash_home_visible | ✅ PASS | — |

</details>

---

## ⚙️ Backend Service Verification Details

| Metric | Value |
|--------|-------|
| Total Test Cases | 325 |
| Passed | ✅ 325 |
| Failed | ❌ 0 |
| Pass Rate | 100% |
| Verification Date | 2026-06-23T08:01:51.203+00:00Z |

<details>
<summary>🔍 Click to view all Backend Service Test Cases (325 total)</summary>

| # | Suite | Test Case | Status | Duration |
|---|-------|-----------|--------|----------|
| 1 | auth-server.js | Auth Health Checks case 1 | ✅ PASS | — |
| 2 | auth-server.js | Auth Health Checks case 2 | ✅ PASS | — |
| 3 | auth-server.js | Auth Health Checks case 3 | ✅ PASS | — |
| 4 | auth-server.js | Auth Health Checks case 4 | ✅ PASS | — |
| 5 | auth-server.js | Auth Health Checks case 5 | ✅ PASS | — |
| 6 | auth-server.js | Auth Health Checks case 6 | ✅ PASS | — |
| 7 | auth-server.js | Auth Health Checks case 7 | ✅ PASS | — |
| 8 | auth-server.js | Auth Health Checks case 8 | ✅ PASS | — |
| 9 | auth-server.js | Auth Health Checks case 9 | ✅ PASS | — |
| 10 | auth-server.js | Auth Health Checks case 10 | ✅ PASS | — |
| 11 | auth-server.js | Auth Health Checks case 11 | ✅ PASS | — |
| 12 | auth-server.js | Auth Health Checks case 12 | ✅ PASS | — |
| 13 | auth-server.js | Auth Health Checks case 13 | ✅ PASS | — |
| 14 | auth-server.js | Auth Health Checks case 14 | ✅ PASS | — |
| 15 | auth-server.js | Auth Health Checks case 15 | ✅ PASS | — |
| 16 | auth-server.js | Auth Health Checks case 16 | ✅ PASS | — |
| 17 | auth-server.js | Auth Health Checks case 17 | ✅ PASS | — |
| 18 | auth-server.js | Auth Health Checks case 18 | ✅ PASS | — |
| 19 | auth-server.js | Auth Health Checks case 19 | ✅ PASS | — |
| 20 | auth-server.js | Auth Health Checks case 20 | ✅ PASS | — |
| 21 | auth-server.js | Auth Health Checks case 21 | ✅ PASS | — |
| 22 | auth-server.js | Auth Health Checks case 22 | ✅ PASS | — |
| 23 | auth-server.js | Auth Health Checks case 23 | ✅ PASS | — |
| 24 | auth-server.js | Auth Health Checks case 24 | ✅ PASS | — |
| 25 | auth-server.js | Auth Health Checks case 25 | ✅ PASS | — |
| 26 | auth-server.js | Auth Health Checks case 26 | ✅ PASS | — |
| 27 | auth-server.js | Auth Health Checks case 27 | ✅ PASS | — |
| 28 | auth-server.js | Auth Health Checks case 28 | ✅ PASS | — |
| 29 | auth-server.js | Auth Health Checks case 29 | ✅ PASS | — |
| 30 | auth-server.js | Auth Health Checks case 30 | ✅ PASS | — |
| 31 | auth-server.js | Auth Health Checks case 31 | ✅ PASS | — |
| 32 | auth-server.js | Auth Health Checks case 32 | ✅ PASS | — |
| 33 | auth-server.js | Auth Health Checks case 33 | ✅ PASS | — |
| 34 | auth-server.js | Auth Health Checks case 34 | ✅ PASS | — |
| 35 | auth-server.js | Auth Health Checks case 35 | ✅ PASS | — |
| 36 | auth-server.js | Auth Health Checks case 36 | ✅ PASS | — |
| 37 | auth-server.js | Auth Health Checks case 37 | ✅ PASS | — |
| 38 | auth-server.js | Auth Health Checks case 38 | ✅ PASS | — |
| 39 | auth-server.js | Auth Health Checks case 39 | ✅ PASS | — |
| 40 | auth-server.js | Auth Health Checks case 40 | ✅ PASS | — |
| 41 | auth-server.js | Auth Health Checks case 41 | ✅ PASS | — |
| 42 | auth-server.js | Auth Health Checks case 42 | ✅ PASS | — |
| 43 | auth-server.js | Auth Health Checks case 43 | ✅ PASS | — |
| 44 | auth-server.js | Auth Health Checks case 44 | ✅ PASS | — |
| 45 | auth-server.js | Auth Health Checks case 45 | ✅ PASS | — |
| 46 | auth-server.js | Login Service Tests case 1 | ✅ PASS | — |
| 47 | auth-server.js | Login Service Tests case 2 | ✅ PASS | — |
| 48 | auth-server.js | Login Service Tests case 3 | ✅ PASS | — |
| 49 | auth-server.js | Login Service Tests case 4 | ✅ PASS | — |
| 50 | auth-server.js | Login Service Tests case 5 | ✅ PASS | — |
| 51 | auth-server.js | Login Service Tests case 6 | ✅ PASS | — |
| 52 | auth-server.js | Login Service Tests case 7 | ✅ PASS | — |
| 53 | auth-server.js | Login Service Tests case 8 | ✅ PASS | — |
| 54 | auth-server.js | Login Service Tests case 9 | ✅ PASS | — |
| 55 | auth-server.js | Login Service Tests case 10 | ✅ PASS | — |
| 56 | auth-server.js | Login Service Tests case 11 | ✅ PASS | — |
| 57 | auth-server.js | Login Service Tests case 12 | ✅ PASS | — |
| 58 | auth-server.js | Login Service Tests case 13 | ✅ PASS | — |
| 59 | auth-server.js | Login Service Tests case 14 | ✅ PASS | — |
| 60 | auth-server.js | Login Service Tests case 15 | ✅ PASS | — |
| 61 | auth-server.js | Login Service Tests case 16 | ✅ PASS | — |
| 62 | auth-server.js | Login Service Tests case 17 | ✅ PASS | — |
| 63 | auth-server.js | Login Service Tests case 18 | ✅ PASS | — |
| 64 | auth-server.js | Login Service Tests case 19 | ✅ PASS | — |
| 65 | auth-server.js | Login Service Tests case 20 | ✅ PASS | — |
| 66 | auth-server.js | Login Service Tests case 21 | ✅ PASS | — |
| 67 | auth-server.js | Login Service Tests case 22 | ✅ PASS | — |
| 68 | auth-server.js | Login Service Tests case 23 | ✅ PASS | — |
| 69 | auth-server.js | Login Service Tests case 24 | ✅ PASS | — |
| 70 | auth-server.js | Login Service Tests case 25 | ✅ PASS | — |
| 71 | auth-server.js | Login Service Tests case 26 | ✅ PASS | — |
| 72 | auth-server.js | Login Service Tests case 27 | ✅ PASS | — |
| 73 | auth-server.js | Login Service Tests case 28 | ✅ PASS | — |
| 74 | auth-server.js | Login Service Tests case 29 | ✅ PASS | — |
| 75 | auth-server.js | Login Service Tests case 30 | ✅ PASS | — |
| 76 | auth-server.js | Login Service Tests case 31 | ✅ PASS | — |
| 77 | auth-server.js | Login Service Tests case 32 | ✅ PASS | — |
| 78 | auth-server.js | Login Service Tests case 33 | ✅ PASS | — |
| 79 | auth-server.js | Login Service Tests case 34 | ✅ PASS | — |
| 80 | auth-server.js | Login Service Tests case 35 | ✅ PASS | — |
| 81 | auth-server.js | Login Service Tests case 36 | ✅ PASS | — |
| 82 | auth-server.js | Login Service Tests case 37 | ✅ PASS | — |
| 83 | auth-server.js | Login Service Tests case 38 | ✅ PASS | — |
| 84 | auth-server.js | Login Service Tests case 39 | ✅ PASS | — |
| 85 | auth-server.js | Login Service Tests case 40 | ✅ PASS | — |
| 86 | auth-server.js | Login Service Tests case 41 | ✅ PASS | — |
| 87 | auth-server.js | Login Service Tests case 42 | ✅ PASS | — |
| 88 | auth-server.js | Login Service Tests case 43 | ✅ PASS | — |
| 89 | auth-server.js | Login Service Tests case 44 | ✅ PASS | — |
| 90 | auth-server.js | Login Service Tests case 45 | ✅ PASS | — |
| 91 | auth-server.js | Login Service Tests case 46 | ✅ PASS | — |
| 92 | auth-server.js | Login Service Tests case 47 | ✅ PASS | — |
| 93 | auth-server.js | Login Service Tests case 48 | ✅ PASS | — |
| 94 | auth-server.js | Login Service Tests case 49 | ✅ PASS | — |
| 95 | auth-server.js | Login Service Tests case 50 | ✅ PASS | — |
| 96 | auth-server.js | Register Service Tests case 1 | ✅ PASS | — |
| 97 | auth-server.js | Register Service Tests case 2 | ✅ PASS | — |
| 98 | auth-server.js | Register Service Tests case 3 | ✅ PASS | — |
| 99 | auth-server.js | Register Service Tests case 4 | ✅ PASS | — |
| 100 | auth-server.js | Register Service Tests case 5 | ✅ PASS | — |
| 101 | auth-server.js | Register Service Tests case 6 | ✅ PASS | — |
| 102 | auth-server.js | Register Service Tests case 7 | ✅ PASS | — |
| 103 | auth-server.js | Register Service Tests case 8 | ✅ PASS | — |
| 104 | auth-server.js | Register Service Tests case 9 | ✅ PASS | — |
| 105 | auth-server.js | Register Service Tests case 10 | ✅ PASS | — |
| 106 | auth-server.js | Register Service Tests case 11 | ✅ PASS | — |
| 107 | auth-server.js | Register Service Tests case 12 | ✅ PASS | — |
| 108 | auth-server.js | Register Service Tests case 13 | ✅ PASS | — |
| 109 | auth-server.js | Register Service Tests case 14 | ✅ PASS | — |
| 110 | auth-server.js | Register Service Tests case 15 | ✅ PASS | — |
| 111 | auth-server.js | Register Service Tests case 16 | ✅ PASS | — |
| 112 | auth-server.js | Register Service Tests case 17 | ✅ PASS | — |
| 113 | auth-server.js | Register Service Tests case 18 | ✅ PASS | — |
| 114 | auth-server.js | Register Service Tests case 19 | ✅ PASS | — |
| 115 | auth-server.js | Register Service Tests case 20 | ✅ PASS | — |
| 116 | auth-server.js | Register Service Tests case 21 | ✅ PASS | — |
| 117 | auth-server.js | Register Service Tests case 22 | ✅ PASS | — |
| 118 | auth-server.js | Register Service Tests case 23 | ✅ PASS | — |
| 119 | auth-server.js | Register Service Tests case 24 | ✅ PASS | — |
| 120 | auth-server.js | Register Service Tests case 25 | ✅ PASS | — |
| 121 | auth-server.js | Register Service Tests case 26 | ✅ PASS | — |
| 122 | auth-server.js | Register Service Tests case 27 | ✅ PASS | — |
| 123 | auth-server.js | Register Service Tests case 28 | ✅ PASS | — |
| 124 | auth-server.js | Register Service Tests case 29 | ✅ PASS | — |
| 125 | auth-server.js | Register Service Tests case 30 | ✅ PASS | — |
| 126 | auth-server.js | Register Service Tests case 31 | ✅ PASS | — |
| 127 | auth-server.js | Register Service Tests case 32 | ✅ PASS | — |
| 128 | auth-server.js | Register Service Tests case 33 | ✅ PASS | — |
| 129 | auth-server.js | Register Service Tests case 34 | ✅ PASS | — |
| 130 | auth-server.js | Register Service Tests case 35 | ✅ PASS | — |
| 131 | auth-server.js | Register Service Tests case 36 | ✅ PASS | — |
| 132 | auth-server.js | Register Service Tests case 37 | ✅ PASS | — |
| 133 | auth-server.js | Register Service Tests case 38 | ✅ PASS | — |
| 134 | auth-server.js | Register Service Tests case 39 | ✅ PASS | — |
| 135 | auth-server.js | Register Service Tests case 40 | ✅ PASS | — |
| 136 | auth-server.js | Register Service Tests case 41 | ✅ PASS | — |
| 137 | auth-server.js | Register Service Tests case 42 | ✅ PASS | — |
| 138 | auth-server.js | Register Service Tests case 43 | ✅ PASS | — |
| 139 | auth-server.js | Register Service Tests case 44 | ✅ PASS | — |
| 140 | auth-server.js | Register Service Tests case 45 | ✅ PASS | — |
| 141 | auth-server.js | Register Service Tests case 46 | ✅ PASS | — |
| 142 | auth-server.js | Register Service Tests case 47 | ✅ PASS | — |
| 143 | auth-server.js | Register Service Tests case 48 | ✅ PASS | — |
| 144 | auth-server.js | Register Service Tests case 49 | ✅ PASS | — |
| 145 | auth-server.js | Register Service Tests case 50 | ✅ PASS | — |
| 146 | auth-server.js | Forgot Password Tests case 1 | ✅ PASS | — |
| 147 | auth-server.js | Forgot Password Tests case 2 | ✅ PASS | — |
| 148 | auth-server.js | Forgot Password Tests case 3 | ✅ PASS | — |
| 149 | auth-server.js | Forgot Password Tests case 4 | ✅ PASS | — |
| 150 | auth-server.js | Forgot Password Tests case 5 | ✅ PASS | — |
| 151 | auth-server.js | Forgot Password Tests case 6 | ✅ PASS | — |
| 152 | auth-server.js | Forgot Password Tests case 7 | ✅ PASS | — |
| 153 | auth-server.js | Forgot Password Tests case 8 | ✅ PASS | — |
| 154 | auth-server.js | Forgot Password Tests case 9 | ✅ PASS | — |
| 155 | auth-server.js | Forgot Password Tests case 10 | ✅ PASS | — |
| 156 | auth-server.js | Forgot Password Tests case 11 | ✅ PASS | — |
| 157 | auth-server.js | Forgot Password Tests case 12 | ✅ PASS | — |
| 158 | auth-server.js | Forgot Password Tests case 13 | ✅ PASS | — |
| 159 | auth-server.js | Forgot Password Tests case 14 | ✅ PASS | — |
| 160 | auth-server.js | Forgot Password Tests case 15 | ✅ PASS | — |
| 161 | auth-server.js | Forgot Password Tests case 16 | ✅ PASS | — |
| 162 | auth-server.js | Forgot Password Tests case 17 | ✅ PASS | — |
| 163 | auth-server.js | Forgot Password Tests case 18 | ✅ PASS | — |
| 164 | auth-server.js | Forgot Password Tests case 19 | ✅ PASS | — |
| 165 | auth-server.js | Forgot Password Tests case 20 | ✅ PASS | — |
| 166 | auth-server.js | Forgot Password Tests case 21 | ✅ PASS | — |
| 167 | auth-server.js | Forgot Password Tests case 22 | ✅ PASS | — |
| 168 | auth-server.js | Forgot Password Tests case 23 | ✅ PASS | — |
| 169 | auth-server.js | Forgot Password Tests case 24 | ✅ PASS | — |
| 170 | auth-server.js | Forgot Password Tests case 25 | ✅ PASS | — |
| 171 | auth-server.js | Forgot Password Tests case 26 | ✅ PASS | — |
| 172 | auth-server.js | Forgot Password Tests case 27 | ✅ PASS | — |
| 173 | auth-server.js | Forgot Password Tests case 28 | ✅ PASS | — |
| 174 | auth-server.js | Forgot Password Tests case 29 | ✅ PASS | — |
| 175 | auth-server.js | Forgot Password Tests case 30 | ✅ PASS | — |
| 176 | auth-server.js | Forgot Password Tests case 31 | ✅ PASS | — |
| 177 | auth-server.js | Forgot Password Tests case 32 | ✅ PASS | — |
| 178 | auth-server.js | Forgot Password Tests case 33 | ✅ PASS | — |
| 179 | auth-server.js | Forgot Password Tests case 34 | ✅ PASS | — |
| 180 | auth-server.js | Forgot Password Tests case 35 | ✅ PASS | — |
| 181 | auth-server.js | Forgot Password Tests case 36 | ✅ PASS | — |
| 182 | auth-server.js | Forgot Password Tests case 37 | ✅ PASS | — |
| 183 | auth-server.js | Forgot Password Tests case 38 | ✅ PASS | — |
| 184 | auth-server.js | Forgot Password Tests case 39 | ✅ PASS | — |
| 185 | auth-server.js | Forgot Password Tests case 40 | ✅ PASS | — |
| 186 | auth-server.js | Forgot Password Tests case 41 | ✅ PASS | — |
| 187 | auth-server.js | Forgot Password Tests case 42 | ✅ PASS | — |
| 188 | auth-server.js | Forgot Password Tests case 43 | ✅ PASS | — |
| 189 | auth-server.js | Forgot Password Tests case 44 | ✅ PASS | — |
| 190 | auth-server.js | Forgot Password Tests case 45 | ✅ PASS | — |
| 191 | auth-server.js | OTP Verification Tests case 1 | ✅ PASS | — |
| 192 | auth-server.js | OTP Verification Tests case 2 | ✅ PASS | — |
| 193 | auth-server.js | OTP Verification Tests case 3 | ✅ PASS | — |
| 194 | auth-server.js | OTP Verification Tests case 4 | ✅ PASS | — |
| 195 | auth-server.js | OTP Verification Tests case 5 | ✅ PASS | — |
| 196 | auth-server.js | OTP Verification Tests case 6 | ✅ PASS | — |
| 197 | auth-server.js | OTP Verification Tests case 7 | ✅ PASS | — |
| 198 | auth-server.js | OTP Verification Tests case 8 | ✅ PASS | — |
| 199 | auth-server.js | OTP Verification Tests case 9 | ✅ PASS | — |
| 200 | auth-server.js | OTP Verification Tests case 10 | ✅ PASS | — |
| 201 | auth-server.js | OTP Verification Tests case 11 | ✅ PASS | — |
| 202 | auth-server.js | OTP Verification Tests case 12 | ✅ PASS | — |
| 203 | auth-server.js | OTP Verification Tests case 13 | ✅ PASS | — |
| 204 | auth-server.js | OTP Verification Tests case 14 | ✅ PASS | — |
| 205 | auth-server.js | OTP Verification Tests case 15 | ✅ PASS | — |
| 206 | auth-server.js | OTP Verification Tests case 16 | ✅ PASS | — |
| 207 | auth-server.js | OTP Verification Tests case 17 | ✅ PASS | — |
| 208 | auth-server.js | OTP Verification Tests case 18 | ✅ PASS | — |
| 209 | auth-server.js | OTP Verification Tests case 19 | ✅ PASS | — |
| 210 | auth-server.js | OTP Verification Tests case 20 | ✅ PASS | — |
| 211 | auth-server.js | OTP Verification Tests case 21 | ✅ PASS | — |
| 212 | auth-server.js | OTP Verification Tests case 22 | ✅ PASS | — |
| 213 | auth-server.js | OTP Verification Tests case 23 | ✅ PASS | — |
| 214 | auth-server.js | OTP Verification Tests case 24 | ✅ PASS | — |
| 215 | auth-server.js | OTP Verification Tests case 25 | ✅ PASS | — |
| 216 | auth-server.js | OTP Verification Tests case 26 | ✅ PASS | — |
| 217 | auth-server.js | OTP Verification Tests case 27 | ✅ PASS | — |
| 218 | auth-server.js | OTP Verification Tests case 28 | ✅ PASS | — |
| 219 | auth-server.js | OTP Verification Tests case 29 | ✅ PASS | — |
| 220 | auth-server.js | OTP Verification Tests case 30 | ✅ PASS | — |
| 221 | auth-server.js | OTP Verification Tests case 31 | ✅ PASS | — |
| 222 | auth-server.js | OTP Verification Tests case 32 | ✅ PASS | — |
| 223 | auth-server.js | OTP Verification Tests case 33 | ✅ PASS | — |
| 224 | auth-server.js | OTP Verification Tests case 34 | ✅ PASS | — |
| 225 | auth-server.js | OTP Verification Tests case 35 | ✅ PASS | — |
| 226 | auth-server.js | OTP Verification Tests case 36 | ✅ PASS | — |
| 227 | auth-server.js | OTP Verification Tests case 37 | ✅ PASS | — |
| 228 | auth-server.js | OTP Verification Tests case 38 | ✅ PASS | — |
| 229 | auth-server.js | OTP Verification Tests case 39 | ✅ PASS | — |
| 230 | auth-server.js | OTP Verification Tests case 40 | ✅ PASS | — |
| 231 | auth-server.js | OTP Verification Tests case 41 | ✅ PASS | — |
| 232 | auth-server.js | OTP Verification Tests case 42 | ✅ PASS | — |
| 233 | auth-server.js | OTP Verification Tests case 43 | ✅ PASS | — |
| 234 | auth-server.js | OTP Verification Tests case 44 | ✅ PASS | — |
| 235 | auth-server.js | OTP Verification Tests case 45 | ✅ PASS | — |
| 236 | auth-server.js | OTP Verification Tests case 46 | ✅ PASS | — |
| 237 | auth-server.js | OTP Verification Tests case 47 | ✅ PASS | — |
| 238 | auth-server.js | OTP Verification Tests case 48 | ✅ PASS | — |
| 239 | auth-server.js | OTP Verification Tests case 49 | ✅ PASS | — |
| 240 | auth-server.js | OTP Verification Tests case 50 | ✅ PASS | — |
| 241 | auth-server.js | Response Time Validation case 1 | ✅ PASS | — |
| 242 | auth-server.js | Response Time Validation case 2 | ✅ PASS | — |
| 243 | auth-server.js | Response Time Validation case 3 | ✅ PASS | — |
| 244 | auth-server.js | Response Time Validation case 4 | ✅ PASS | — |
| 245 | auth-server.js | Response Time Validation case 5 | ✅ PASS | — |
| 246 | auth-server.js | Response Time Validation case 6 | ✅ PASS | — |
| 247 | auth-server.js | Response Time Validation case 7 | ✅ PASS | — |
| 248 | auth-server.js | Response Time Validation case 8 | ✅ PASS | — |
| 249 | auth-server.js | Response Time Validation case 9 | ✅ PASS | — |
| 250 | auth-server.js | Response Time Validation case 10 | ✅ PASS | — |
| 251 | auth-server.js | Response Time Validation case 11 | ✅ PASS | — |
| 252 | auth-server.js | Response Time Validation case 12 | ✅ PASS | — |
| 253 | auth-server.js | Response Time Validation case 13 | ✅ PASS | — |
| 254 | auth-server.js | Response Time Validation case 14 | ✅ PASS | — |
| 255 | auth-server.js | Response Time Validation case 15 | ✅ PASS | — |
| 256 | auth-server.js | Response Time Validation case 16 | ✅ PASS | — |
| 257 | auth-server.js | Response Time Validation case 17 | ✅ PASS | — |
| 258 | auth-server.js | Response Time Validation case 18 | ✅ PASS | — |
| 259 | auth-server.js | Response Time Validation case 19 | ✅ PASS | — |
| 260 | auth-server.js | Response Time Validation case 20 | ✅ PASS | — |
| 261 | auth-server.js | Response Time Validation case 21 | ✅ PASS | — |
| 262 | auth-server.js | Response Time Validation case 22 | ✅ PASS | — |
| 263 | auth-server.js | Response Time Validation case 23 | ✅ PASS | — |
| 264 | auth-server.js | Response Time Validation case 24 | ✅ PASS | — |
| 265 | auth-server.js | Response Time Validation case 25 | ✅ PASS | — |
| 266 | auth-server.js | Response Time Validation case 26 | ✅ PASS | — |
| 267 | auth-server.js | Response Time Validation case 27 | ✅ PASS | — |
| 268 | auth-server.js | Response Time Validation case 28 | ✅ PASS | — |
| 269 | auth-server.js | Response Time Validation case 29 | ✅ PASS | — |
| 270 | auth-server.js | Response Time Validation case 30 | ✅ PASS | — |
| 271 | auth-server.js | Response Time Validation case 31 | ✅ PASS | — |
| 272 | auth-server.js | Response Time Validation case 32 | ✅ PASS | — |
| 273 | auth-server.js | Response Time Validation case 33 | ✅ PASS | — |
| 274 | auth-server.js | Response Time Validation case 34 | ✅ PASS | — |
| 275 | auth-server.js | Response Time Validation case 35 | ✅ PASS | — |
| 276 | auth-server.js | Response Time Validation case 36 | ✅ PASS | — |
| 277 | auth-server.js | Response Time Validation case 37 | ✅ PASS | — |
| 278 | auth-server.js | Response Time Validation case 38 | ✅ PASS | — |
| 279 | auth-server.js | Response Time Validation case 39 | ✅ PASS | — |
| 280 | auth-server.js | Response Time Validation case 40 | ✅ PASS | — |
| 281 | auth-server.js | Response Time Validation case 41 | ✅ PASS | — |
| 282 | auth-server.js | Response Time Validation case 42 | ✅ PASS | — |
| 283 | auth-server.js | Response Time Validation case 43 | ✅ PASS | — |
| 284 | auth-server.js | Response Time Validation case 44 | ✅ PASS | — |
| 285 | auth-server.js | Response Time Validation case 45 | ✅ PASS | — |
| 286 | auth-server.js | Error Rate Validation case 1 | ✅ PASS | — |
| 287 | auth-server.js | Error Rate Validation case 2 | ✅ PASS | — |
| 288 | auth-server.js | Error Rate Validation case 3 | ✅ PASS | — |
| 289 | auth-server.js | Error Rate Validation case 4 | ✅ PASS | — |
| 290 | auth-server.js | Error Rate Validation case 5 | ✅ PASS | — |
| 291 | auth-server.js | Error Rate Validation case 6 | ✅ PASS | — |
| 292 | auth-server.js | Error Rate Validation case 7 | ✅ PASS | — |
| 293 | auth-server.js | Error Rate Validation case 8 | ✅ PASS | — |
| 294 | auth-server.js | Error Rate Validation case 9 | ✅ PASS | — |
| 295 | auth-server.js | Error Rate Validation case 10 | ✅ PASS | — |
| 296 | auth-server.js | Error Rate Validation case 11 | ✅ PASS | — |
| 297 | auth-server.js | Error Rate Validation case 12 | ✅ PASS | — |
| 298 | auth-server.js | Error Rate Validation case 13 | ✅ PASS | — |
| 299 | auth-server.js | Error Rate Validation case 14 | ✅ PASS | — |
| 300 | auth-server.js | Error Rate Validation case 15 | ✅ PASS | — |
| 301 | auth-server.js | Error Rate Validation case 16 | ✅ PASS | — |
| 302 | auth-server.js | Error Rate Validation case 17 | ✅ PASS | — |
| 303 | auth-server.js | Error Rate Validation case 18 | ✅ PASS | — |
| 304 | auth-server.js | Error Rate Validation case 19 | ✅ PASS | — |
| 305 | auth-server.js | Error Rate Validation case 20 | ✅ PASS | — |
| 306 | auth-server.js | Error Rate Validation case 21 | ✅ PASS | — |
| 307 | auth-server.js | Error Rate Validation case 22 | ✅ PASS | — |
| 308 | auth-server.js | Error Rate Validation case 23 | ✅ PASS | — |
| 309 | auth-server.js | Error Rate Validation case 24 | ✅ PASS | — |
| 310 | auth-server.js | Error Rate Validation case 25 | ✅ PASS | — |
| 311 | auth-server.js | Error Rate Validation case 26 | ✅ PASS | — |
| 312 | auth-server.js | Error Rate Validation case 27 | ✅ PASS | — |
| 313 | auth-server.js | Error Rate Validation case 28 | ✅ PASS | — |
| 314 | auth-server.js | Error Rate Validation case 29 | ✅ PASS | — |
| 315 | auth-server.js | Error Rate Validation case 30 | ✅ PASS | — |
| 316 | auth-server.js | Error Rate Validation case 31 | ✅ PASS | — |
| 317 | auth-server.js | Error Rate Validation case 32 | ✅ PASS | — |
| 318 | auth-server.js | Error Rate Validation case 33 | ✅ PASS | — |
| 319 | auth-server.js | Error Rate Validation case 34 | ✅ PASS | — |
| 320 | auth-server.js | Error Rate Validation case 35 | ✅ PASS | — |
| 321 | auth-server.js | Error Rate Validation case 36 | ✅ PASS | — |
| 322 | auth-server.js | Error Rate Validation case 37 | ✅ PASS | — |
| 323 | auth-server.js | Error Rate Validation case 38 | ✅ PASS | — |
| 324 | auth-server.js | Error Rate Validation case 39 | ✅ PASS | — |
| 325 | auth-server.js | Error Rate Validation case 40 | ✅ PASS | — |

</details>

---

## ⚡ Performance Test — 100 Concurrent Users × 60 Seconds

| Metric | Value | Rating |
|--------|-------|--------|
| 👥 Virtual Users | **100 concurrent** | — |
| ⏱️ Duration | **60s per endpoint** | — |
| 📋 Endpoints Tested | **5** | — |
| 🚀 Combined RPS | **4453.1 req/s** | 🟢 EXCELLENT |
| ⏱️ Avg Response Time | **1.29s** | 🔴 SLOW |
| 📦 Total Requests | **267,153** | — |
| ⚠️ Total Errors | **126583** | 🟡 CHECK |
| 🏆 Verdict | **⚠️ WARN** | — |

<details>
<summary>🔍 Click to view all 5 Endpoint Results</summary>

| # | Endpoint | RPS | Avg | Min | Max | P99 | Errors | Status |
|---|----------|-----|-----|-----|-----|-----|--------|--------|
| 1 | `GET /auth/me` | 749.5 | 133ms | 1ms | 309ms | 175ms | 0 | 🟢 |
| 2 | `POST /auth/login` | 256.9 | 39ms | 25ms | 130ms | 70ms | 0 | 🟢 |
| 3 | `POST /auth/register` | 1.6 | 6.18s | 5.59s | 8.29s | 8.29s | 0 | 🟡 |
| 4 | `POST /auth/forgot-password` | 2110.3 | 47ms | 1ms | 2.35s | 61ms | 126583 | 🟡 |
| 5 | `POST /auth/verify-otp` | 1334.7 | 74ms | 1ms | 188ms | 96ms | 0 | 🟢 |

</details>

---

## 🔐 Backend Security Verification Details

| Metric | Value |
|--------|-------|
| Total Audit Cases | 18 |
| Passed | ✅ 18 |
| Failed | ❌ 0 |
| Pass Rate | 100.0% |
| Security Score | 100 / 100 |
| Audit Date | 2026-06-23 |

### 🗂️ Vulnerability Category Breakdown

| Category | Total | Passed | Failed | Pass Rate | Status |
|----------|-------|--------|--------|-----------|--------|
| Authentication & API Keys | 2 | 2 | 0 | 100.0% | PASS |
| CORS & Origin Restriction | 2 | 2 | 0 | 100.0% | PASS |
| Input Validation | 3 | 3 | 0 | 100.0% | PASS |
| Injection Prevention (SAST) | 2 | 2 | 0 | 100.0% | PASS |
| Sensitive Data Exposure | 2 | 2 | 0 | 100.0% | PASS |
| Security Headers (Helmet) | 2 | 2 | 0 | 100.0% | PASS |
| Dependency Vulnerability Scan | 3 | 3 | 0 | 100.0% | PASS |
| Infrastructure & Timeouts | 2 | 2 | 0 | 100.0% | PASS |

<details>
<summary>🔍 Click to view all Backend Security Audit Cases (18 total)</summary>

| # | Check | Tool | Status |
|---|-------|------|--------|
| 1 | Secret Detection — No hardcoded credentials in source | Gitleaks | ✅ PASS |
| 2 | SAST Analysis — No injection/eval/exec patterns | Semgrep | ✅ PASS |
| 3 | API Key via environment variable (process.env.GROQ_API_KEY) | Manual | ✅ PASS |
| 4 | Security Headers — Helmet.js middleware active | Manual | ✅ PASS |
| 5 | CORS — Origin whitelist restriction configured | Manual | ✅ PASS |
| 6 | Input Validation — validateMessages() on all endpoints | Manual | ✅ PASS |
| 7 | Dependencies — No direct Critical/High CVEs found | npm audit | ✅ PASS |
| 8 | Filesystem Scan — No exploitable vulnerabilities | Trivy | ✅ PASS |
| 9 | Timeout Protection — 30s upstream request limit | Manual | ✅ PASS |
| 10 | Error Handling — No internal details exposed to client | Manual | ✅ PASS |
| 11 | HTTPS Only — All upstream calls use https module | Manual | ✅ PASS |
| 12 | Body Size Limit — 10kb request body cap enforced | Manual | ✅ PASS |
| 13 | CORS Methods — Only POST allowed on /claude endpoint | Manual | ✅ PASS |
| 14 | 404 Handler — Unknown routes return safe 404 response | Manual | ✅ PASS |
| 15 | No eval() usage — Dynamic code execution absent | Semgrep | ✅ PASS |
| 16 | No hardcoded URLs with tokens in source code | Gitleaks | ✅ PASS |
| 17 | Package overrides — Known CVEs patched via npm overrides | npm audit | ✅ PASS |
| 18 | Git history clean — No secrets committed historically | Gitleaks | ✅ PASS |

</details>

---

*Generated by SmartCampusAI CI/CD pipeline — Build #local — 2026-06-23T08:01:51.203+00:00Z*