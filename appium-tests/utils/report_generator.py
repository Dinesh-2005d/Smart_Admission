#!/usr/bin/env python3
"""
report_generator.py – Generates summary.md from pytest JSON report
Used by the GitHub Actions workflow after Appium E2E execution.
"""

import argparse
import json
import os
from datetime import datetime


def load_results(path):
    if not path or not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_summary(results, platform, build_number, report_url, output_path):
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    summary = results.get("summary", {}) if results else {}
    total = summary.get("total", 0)
    passed = summary.get("passed", 0)
    failed = summary.get("failed", 0)
    skipped = summary.get("skipped", 0)
    duration = summary.get("duration", 0)

    pass_pct = f"{(passed / total * 100):.1f}%" if total > 0 else "N/A"
    status_emoji = "✅" if failed == 0 else "❌"

    lines = [
        f"# 🤖 {platform} Appium E2E Test Summary — {status_emoji}",
        f"",
        f"| | |",
        f"|---|---|",
        f"| **Build Number** | #{build_number} |",
        f"| **Execution Date** | {now} |",
        f"| **Duration** | {duration:.1f}s |",
        f"| **Platform** | {platform} |",
        f"",
        f"## 📊 Test Results",
        f"",
        f"| Metric | Count |",
        f"|--------|-------|",
        f"| **Total Tests** | {total} |",
        f"| ✅ Passed | {passed} |",
        f"| ❌ Failed | {failed} |",
        f"| ⏭️ Skipped | {skipped} |",
        f"| **Pass Rate** | {pass_pct} |",
        f"",
    ]

    if report_url:
        lines += [
            f"## 📊 Report URL",
            f"[{report_url}]({report_url})",
            f"",
        ]

    tests = results.get("tests", []) if results else []
    failed_tests = [t for t in tests if t.get("outcome") == "failed"]

    if failed_tests:
        lines.append("## ❌ Failed Tests")
        lines.append("")
        lines.append("| # | Test Name | Failure Reason |")
        lines.append("|---|-----------|----------------|")
        for i, t in enumerate(failed_tests[:20], 1):
            name = t.get("nodeid", "Unknown").split("::")[-1]
            reason = ""
            call_info = t.get("call", {})
            if isinstance(call_info, dict):
                reason = str(call_info.get("longrepr", "Unknown"))[:120]
            reason = reason.replace("|", "\\|").replace("\n", " ")
            lines.append(f"| {i} | `{name}` | {reason} |")
        lines.append("")
    else:
        lines.append("## ✅ All Tests Passed!")
        lines.append("")

    passed_tests = [t for t in tests if t.get("outcome") == "passed"]
    if passed_tests:
        lines.append("## ✅ Passed Tests")
        lines.append("")
        for t in passed_tests:
            name = t.get("nodeid", "Unknown").split("::")[-1]
            dur = t.get("call", {}).get("duration", 0) if isinstance(t.get("call"), dict) else 0
            lines.append(f"- ✅ `{name}` ({dur:.2f}s)")
        lines.append("")

    lines += [
        "## 📎 Artifacts",
        "",
        "- 📊 `Automation_Test_Report.xlsx`",
        "- 🌐 `execution-report.html`",
        "- 📸 Screenshots",
        "- 📋 Logs",
        "",
        "---",
        f"*Generated at {now}*",
    ]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"✅ Summary: {output_path} | Total: {total} | Passed: {passed}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--results", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--platform", default="Android")
    parser.add_argument("--build-number", default="0")
    parser.add_argument("--report-url", default="")
    parser.add_argument("--base-url", default="")
    parser.add_argument("--run-number", default="0")
    args = parser.parse_args()

    results = load_results(args.results)
    if results is None:
        results = {"summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0, "duration": 0}, "tests": []}

    build = args.build_number or args.run_number
    generate_summary(results, args.platform, build, args.report_url or args.base_url, args.output)


if __name__ == "__main__":
    main()
