#!/usr/bin/env python3
"""
Generate a combined test summary report from Selenium, Appium, and Security scan results.
Reads test-results.json files and security-review.md and outputs a unified Markdown report.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

# ── Paths passed as env vars (with fallbacks for local dev) ─────────────────
SELENIUM_JSON = os.environ.get("SELENIUM_RESULTS", "results/selenium/test-results.json")
APPIUM_JSON   = os.environ.get("APPIUM_RESULTS",   "results/appium/test-results.json")
SECURITY_MD   = os.environ.get("SECURITY_REPORT",  "results/security/security-review.md")
OUTPUT_MD     = os.environ.get("OUTPUT_REPORT",     "results/combined-summary.md")
RUN_NUMBER    = os.environ.get("GITHUB_RUN_NUMBER", "local")
BRANCH        = os.environ.get("GITHUB_REF_NAME",   "main")
SHA           = os.environ.get("GITHUB_SHA",        "local")[:8]
STEP_SUMMARY  = os.environ.get("GITHUB_STEP_SUMMARY", "")


def load_pytest_json(path):
    """Load a pytest-json-report JSON file, return summary + tests list."""
    if not os.path.exists(path):
        return None, []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        summary = data.get("summary", {})
        tests   = data.get("tests", [])
        return summary, tests
    except Exception as e:
        print(f"  Warning: could not read {path}: {e}", file=sys.stderr)
        return None, []


def test_rows(tests, suite_name):
    """Generate markdown table rows for each test case."""
    rows = []
    for t in tests:
        name    = t.get("nodeid", "?").split("::")[-1]
        outcome = t.get("outcome", "unknown")
        dur     = t.get("duration", 0)
        icon    = "✅" if outcome == "passed" else ("❌" if outcome == "failed" else "⏭️")
        err     = ""
        if outcome == "failed":
            err = str(t.get("call", {}).get("longrepr", ""))[:100].replace("\n", " ")
        rows.append(f"| {suite_name} | {name} | {icon} {outcome.upper()} | {dur:.2f}s | {err} |")
    return rows


def parse_security_score(path):
    """Extract score, critical, high, medium, low from security-review.md."""
    result = {"score": "N/A", "critical": 0, "high": 0, "medium": 0, "low": 0}
    if not os.path.exists(path):
        return result
    try:
        content = open(path, encoding="utf-8").read()
        m = re.search(r"Security Score: \*\*(\d+) / 100\*\*", content)
        if m:
            result["score"] = int(m.group(1))
        for line in content.split("\n"):
            if re.match(r"^### Finding #\d+", line):
                if "Critical:" in line:  result["critical"] += 1
                elif "High:" in line:    result["high"] += 1
                elif "Medium:" in line:  result["medium"] += 1
                elif "Low:" in line:     result["low"] += 1
    except Exception as e:
        print(f"  Warning: could not parse {path}: {e}", file=sys.stderr)
    return result


def build_report():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # ── Load results ─────────────────────────────────────────────────────────
    sel_summary, sel_tests   = load_pytest_json(SELENIUM_JSON)
    app_summary, app_tests   = load_pytest_json(APPIUM_JSON)
    sec                      = parse_security_score(SECURITY_MD)

    sel_total   = sel_summary.get("total",   0) if sel_summary else 0
    sel_passed  = sel_summary.get("passed",  0) if sel_summary else 0
    sel_failed  = sel_summary.get("failed",  0) if sel_summary else 0
    sel_skipped = sel_summary.get("skipped", 0) if sel_summary else 0

    app_total   = app_summary.get("total",   0) if app_summary else 0
    app_passed  = app_summary.get("passed",  0) if app_summary else 0
    app_failed  = app_summary.get("failed",  0) if app_summary else 0

    grand_total  = sel_total  + app_total
    grand_passed = sel_passed + app_passed
    grand_failed = sel_failed + app_failed

    sel_rate = f"{int(sel_passed/sel_total*100)}%" if sel_total else "N/A"
    app_rate = f"{int(app_passed/app_total*100)}%" if app_total else "N/A"
    all_rate = f"{int(grand_passed/grand_total*100)}%" if grand_total else "N/A"

    overall_status = "PASSED" if grand_failed == 0 and grand_total > 0 else ("FAILED" if grand_failed > 0 else "PENDING")

    # ── Build Markdown ────────────────────────────────────────────────────────
    lines = []
    lines += [
        f"# Combined Test Summary Report - {overall_status}",
        "",
        f"| Field | Value |",
        f"|-------|-------|",
        f"| Build | #{RUN_NUMBER} |",
        f"| Date | {now} |",
        f"| Branch | {BRANCH} |",
        f"| Commit | {SHA} |",
        "",
        "## Overall Results",
        "",
        "| Workflow | Total | Passed | Failed | Pass Rate |",
        "|----------|-------|--------|--------|-----------|",
        f"| Selenium E2E | {sel_total} | {sel_passed} | {sel_failed} | {sel_rate} |",
        f"| Appium E2E | {app_total} | {app_passed} | {app_failed} | {app_rate} |",
        f"| **TOTAL** | **{grand_total}** | **{grand_passed}** | **{grand_failed}** | **{all_rate}** |",
        "",
        "## Security Scan",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Security Score | {sec['score']} / 100 |",
        f"| Critical | {sec['critical']} |",
        f"| High | {sec['high']} |",
        f"| Medium | {sec['medium']} |",
        f"| Low | {sec['low']} |",
        "",
    ]

    # ── Selenium test cases ───────────────────────────────────────────────────
    if sel_tests:
        lines += [
            "## Selenium E2E Test Cases (47 total)",
            "",
            "| Suite | Test Name | Status | Duration | Error |",
            "|-------|-----------|--------|----------|-------|",
        ]
        for t in sel_tests:
            name    = t.get("nodeid", "?")
            suite   = name.split("/")[-1].split("::")[0] if "/" in name else name.split("::")[0]
            tname   = name.split("::")[-1]
            outcome = t.get("outcome", "unknown")
            dur     = t.get("duration", 0)
            icon    = "✅" if outcome == "passed" else ("❌" if outcome == "failed" else "⏭️")
            err     = ""
            if outcome == "failed":
                err = str(t.get("call", {}).get("longrepr", ""))[:80].replace("\n", " ")
            lines.append(f"| {suite} | {tname} | {icon} {outcome.upper()} | {dur:.2f}s | {err} |")
        lines.append("")
    else:
        lines += [
            "## Selenium E2E Test Cases",
            "",
            "| Suite | Test Name | Status |",
            "|-------|-----------|--------|",
            "| test_home.py | (47 tests — run workflow to see live results) | ⏳ |",
            "",
        ]

    # ── Appium test cases ─────────────────────────────────────────────────────
    if app_tests:
        lines += [
            "## Appium E2E Test Cases (18 total)",
            "",
            "| Suite | Test Name | Status | Duration | Error |",
            "|-------|-----------|--------|----------|-------|",
        ]
        for t in app_tests:
            name    = t.get("nodeid", "?")
            suite   = name.split("/")[-1].split("::")[0] if "/" in name else name.split("::")[0]
            tname   = name.split("::")[-1]
            outcome = t.get("outcome", "unknown")
            dur     = t.get("duration", 0)
            icon    = "✅" if outcome == "passed" else ("❌" if outcome == "failed" else "⏭️")
            err     = ""
            if outcome == "failed":
                err = str(t.get("call", {}).get("longrepr", ""))[:80].replace("\n", " ")
            lines.append(f"| {suite} | {tname} | {icon} {outcome.upper()} | {dur:.2f}s | {err} |")
        lines.append("")
    else:
        lines += [
            "## Appium E2E Test Cases",
            "",
            "| Suite | Test Name | Status |",
            "|-------|-----------|--------|",
            "| test_home_flow.py | (18 tests — run workflow to see live results) | ⏳ |",
            "",
        ]

    return "\n".join(lines)


def main():
    os.makedirs(os.path.dirname(OUTPUT_MD) if os.path.dirname(OUTPUT_MD) else ".", exist_ok=True)
    report = build_report()

    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"Report written to: {OUTPUT_MD}")

    # Also write to GitHub Step Summary if available
    if STEP_SUMMARY:
        with open(STEP_SUMMARY, "a", encoding="utf-8") as f:
            f.write(report)
        print("Step summary updated.")


if __name__ == "__main__":
    main()
