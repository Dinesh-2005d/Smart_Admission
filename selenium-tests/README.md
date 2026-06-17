# 🧪 Smart Admission – Selenium E2E Test Suite

A comprehensive Selenium WebDriver test suite for the **Smart Admission** web app deployed on GitHub Pages.

- **Total Tests:** 160
- **Test Files:** 11
- **Page Objects:** 11
- **Markers:** `smoke`, `regression`, `accessibility`, `performance`, `navigation`, `compare`, `saved`, `college_flow`, `seo`

---

## 📁 Directory Structure

```
selenium-tests/
├── conftest.py                    # Shared fixtures, Chrome options, failure screenshots
├── pytest.ini                     # Pytest config & marker definitions
│
├── page_objects/                  # Page Object Model (POM) classes
│   ├── __init__.py
│   ├── base_page.py               # Common helpers (find, click, scroll, screenshot)
│   ├── home_page.py               # Home screen (Step 1: state/board selection)
│   ├── search_page.py             # Search screen (search input, tags, results)
│   ├── compare_page.py            # Compare tab (empty state, 2-college view)
│   ├── saved_page.py              # Saved Colleges tab (bookmark list)
│   ├── marks_entry_page.py        # Marks Entry screen (Step 2: %, department)
│   ├── login_page.py              # Login/Auth screen (email, password, Google)
│   ├── details_page.py            # College Details screen (tabs, save, AI chat)
│   ├── ai_chat_page.py            # AI Chat screen (Groq-powered conversation)
│   └── splash_page.py             # Splash screen + Web Vitals timing helpers
│
├── tests/                         # Test suites
│   ├── test_home.py               # 17 tests – Home screen smoke & regression
│   ├── test_accessibility.py      # 12 tests – WCAG basics & performance
│   ├── test_search.py             # 11 tests – Search screen load & interaction
│   ├── test_navigation.py         #  7 tests – Bottom tab navigation flow
│   ├── test_compare.py            #  8 tests – Compare tab (empty state, nav)
│   ├── test_saved_colleges.py     #  8 tests – Saved Colleges tab
│   ├── test_college_flow.py       # 22 tests – Marks entry, college list, SEO
│   ├── test_login.py              # 15 tests – Auth screen (fields, validation)
│   ├── test_details_screen.py     # 20 tests – College details screen & tabs
│   ├── test_ai_chat.py            # 15 tests – AI Chat (Groq) screen
│   └── test_performance.py        # 25 tests – Splash, Web Vitals, consistency
│
└── utils/
    ├── excel_reporter.py           # Generates Automation_Test_Report.xlsx
    ├── report_generator.py         # Generates summary.md from JSON results
    └── screenshot_manager.py       # Screenshot capture helpers
```

---

## 🧩 Test Suite Breakdown

| Suite | Tests | Markers | What's Covered |
|-------|-------|---------|----------------|
| `test_home.py` | 17 | smoke, regression | App title, tagline, state/board selector, step indicator, stats row, feature cards, India badge, free badge, scroll, dropdown click, JS errors, URL, load time |
| `test_accessibility.py` | 12 | accessibility, performance | HTML lang, viewport meta, charset, broken images, readable content, font size, DOM ready, page source check, error title |
| `test_search.py` | 11 | smoke, regression | Search screen access, input field, popular tags (≥3), Engineering/Medical tag click, IIT/Govt search, no-results message, clear search |
| `test_navigation.py` | 7 | smoke, regression | Home tab default, Search tab nav, Compare tab, back to home, 3-tabs present, no broken nav, Search→Home cycle |
| `test_compare.py` | 8 | smoke, regression | Compare tab access, label in nav, heading, empty state, no crash, round-trip Home, Search→Compare cycle, no JS errors |
| `test_saved_colleges.py` | 8 | smoke, regression | Saved tab access, label in nav, empty state, no crash, after Search nav, round-trip Home, all 4 tabs accessible, no JS errors |
| `test_college_flow.py` | 22 | smoke, regression, accessibility | Step1/2 indicators, state selector list, board after state, search result cards (rating/placement/location/NAAC/type/AI badge), Medical/Govt search, load-more, OG meta, favicon, meta description, HTTPS, mobile 375px, tablet 768px |
| `test_login.py` | 15 | smoke, regression | App loads (auth or home), branding, email/password/login-btn/Google/register/forgot-pw present; type in fields, invalid login stays on auth, forgot-pw navigate, input count |
| `test_details_screen.py` | 20 | smoke, regression | Details screen opens, college name, rating, placement, location, NAAC/type, no crash, no JS errors; ≥2 tabs, Overview/Courses/Placement/Facilities labels; click Courses/Placement/Facilities tabs; save button, AI chat button, back nav, scroll |
| `test_ai_chat.py` | 15 | smoke, regression | Chat screen access, input, send button, AI branding, quick suggestions; type message, send, response/loading appears, suggestion chip, back nav, scroll, multiple messages |
| `test_performance.py` | 25 | smoke, regression, performance | Root URL loads, logo, splash→app transition, title after splash, no JS errors, no crash, refresh, title after refresh; TTFB, DOM ready, FCP, DOMContentLoaded, 404 resources, page source, JS heap; title consistency, URL stays on domain, back/forward, window resize |
| **Total** | **160** | | **All major screens + perf + SEO** |

---

## 🚀 Running Tests

### Prerequisites

```bash
pip install selenium webdriver-manager pytest pytest-json-report openpyxl
```

### Run all tests

```bash
cd selenium-tests
pytest -v
```

### Run by marker

```bash
# Only smoke tests (fast, ~5 min)
pytest -v -m smoke

# Only regression tests
pytest -v -m regression

# Only accessibility checks
pytest -v -m accessibility

# Only performance tests
pytest -v -m performance
```

### Run a specific suite

```bash
pytest tests/test_home.py -v
pytest tests/test_login.py -v
pytest tests/test_details_screen.py -v
```

### Run against a custom URL

```bash
pytest --base-url=https://your-deployment.github.io/App/ -v
```

### Generate JSON + Excel report

```bash
pytest -v --json-report --json-report-file=results.json
python utils/excel_reporter.py --results results.json --output reports/Automation_Test_Report.xlsx --base-url https://dinesh-2005d.github.io/Smart_Admission/
```

### Tune hydration wait (useful on slow CI)

```bash
pytest -v --hydration-wait=8
```

---

## ⚙️ Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `BASE_URL` | `https://dinesh-2005d.github.io/Smart_Admission/` | App URL |
| `HEADLESS` | `true` | Run Chrome in headless mode |
| `SCREENSHOTS_DIR` | `../Test Results/Screenshots` | Failure screenshot path |
| `IMPLICIT_WAIT` | `10` | Element wait timeout (seconds) |
| `PAGE_LOAD_TIMEOUT` | `30` | Page load timeout (seconds) |
| `HYDRATION_WAIT` | `5` | React Native Web hydration wait (seconds) |

---

## 🔖 Test ID Reference

| Range | Suite |
|-------|-------|
| TC-H-001 – TC-H-017 | Home screen |
| TC-A-001 – TC-A-008 | Accessibility |
| TC-P-001 – TC-P-004 | Performance (basic) |
| TC-S-001 – TC-S-011 | Search screen |
| TC-N-001 – TC-N-007 | Navigation |
| TC-C-001 – TC-C-008 | Compare screen |
| TC-SV-001 – TC-SV-008 | Saved Colleges |
| TC-ME-001 – TC-ME-005 | Marks Entry |
| TC-CL-001 – TC-CL-009 | College List |
| TC-SEO-001 – TC-SEO-006 | SEO / Responsive |
| TC-L-001 – TC-L-015 | Login / Auth |
| TC-D-001 – TC-D-020 | College Details |
| TC-AI-001 – TC-AI-015 | AI Chat |
| TC-SP-001 – TC-SP-008 | Splash Screen |
| TC-WV-001 – TC-WV-008 | Web Vitals |
| TC-CP-001 – TC-CP-004 | Cross-page Consistency |

---

## 🛠️ Design Notes

- **React Native Web Compatibility:** All locators use XPath text-content matching (`//*[contains(text(),'...')]`) or page-source checks instead of CSS classes, since RN Web renders generic `<div>` elements.
- **Graceful Skipping:** Login tests auto-skip if the user session is already authenticated (e.g., cached token in headless Chrome).
- **Failure Screenshots:** Automatically captured on test failure and saved to `../Test Results/Screenshots/FAIL_<name>_<ts>.png`.
- **Page Source Debug:** On failure, the first 800 chars of page source are printed to stdout for CI debugging.
- **Viewport Tests:** Mobile (375×812) and tablet (768×1024) viewport tests in `test_college_flow.py`.

---

*Generated by Antigravity IDE — Smart Admission Selenium E2E Suite*
