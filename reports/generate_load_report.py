#!/usr/bin/env python3
"""
SmartCampusAI — Load Test Report Generator
────────────────────────────────────────────
Reads the JSON output from scripts/load-test.js and generates:
  1. A Markdown report  (results/load-test-report.md)
  2. Written to GITHUB_STEP_SUMMARY if running in CI

Usage:
  python3 reports/generate_load_report.py

Environment variables (set automatically in GitHub Actions):
  LOAD_TEST_JSON    — Path to the load test JSON result file
  OUTPUT_REPORT     — Output markdown file path
  GITHUB_STEP_SUMMARY, GITHUB_RUN_NUMBER, GITHUB_REF_NAME, GITHUB_SHA
"""

import os
import json
import glob
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────
RUN_NUMBER   = os.environ.get("GITHUB_RUN_NUMBER", "local")
BRANCH       = os.environ.get("GITHUB_REF_NAME",   "main")
SHA          = os.environ.get("GITHUB_SHA",         "local")[:8]
STEP_SUMMARY = os.environ.get("GITHUB_STEP_SUMMARY", "")
OUTPUT_MD    = os.environ.get("OUTPUT_REPORT", "results/load-test-report.md")
NOW          = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

# Find the most recent JSON report
def find_json():
    explicit = os.environ.get("LOAD_TEST_JSON", "")
    if explicit and os.path.exists(explicit):
        return explicit
    matches = sorted(glob.glob("reports/load-test-*.json"), reverse=True)
    return matches[0] if matches else None

# ── Rating helpers ─────────────────────────────────────────────────────────────
def rate_rps(rps):
    if rps >= 100: return "🟢 EXCELLENT"
    if rps >= 50:  return "🟢 GOOD"
    if rps >= 20:  return "🟡 ACCEPTABLE"
    return "🔴 POOR"

def rate_latency(ms):
    if ms is None: return "⚪ N/A"
    if ms <= 100:  return "🟢 FAST"
    if ms <= 300:  return "🟢 GOOD"
    if ms <= 800:  return "🟡 ACCEPTABLE"
    return "🔴 SLOW"

def rate_errors(rate):
    if rate == 0:    return "🟢 NONE"
    if rate < 0.01:  return "🟢 <1%"
    if rate < 0.05:  return "🟡 <5%"
    return "🔴 HIGH"

def fmt_ms(ms):
    if ms is None or ms == 0: return "N/A"
    if ms < 1000: return f"{ms:.0f}ms"
    return f"{ms/1000:.2f}s"

def fmt_num(n):
    return f"{n:,}" if n else "0"

def overall_verdict(endpoints):
    avg_rps = sum(e.get("rps", 0) for e in endpoints) / len(endpoints) if endpoints else 0
    avg_lat = sum(e.get("avgMs", 0) for e in endpoints) / len(endpoints) if endpoints else 0
    total_err = sum(e.get("errors", 0) for e in endpoints)
    if avg_rps >= 50 and avg_lat <= 300 and total_err == 0:
        return "✅ PASS", "🟢", "System handles 100 concurrent users with **excellent** performance!"
    if avg_rps >= 20 and avg_lat <= 800:
        return "⚠️ WARN", "🟡", "System is functional but may need **optimization** under high load."
    return "❌ FAIL", "🔴", "System **struggles** under 100 concurrent users — investigation needed!"

# ── Performance bar (ASCII) ────────────────────────────────────────────────────
def perf_bar(value, max_val, width=20):
    filled = min(int((value / max_val) * width), width) if max_val else 0
    return "█" * filled + "░" * (width - filled)

# ── Main report builder ────────────────────────────────────────────────────────
def build(data):
    config    = data.get("config", {})
    endpoints = data.get("endpoints", [])
    summary   = data.get("summary", {})
    timestamp = data.get("timestamp", NOW)

    connections = config.get("connections", 100)
    duration    = config.get("duration", 60)
    base_url    = config.get("baseUrl", "http://localhost:3002")

    total_rps      = summary.get("totalRPS", sum(e.get("rps", 0) for e in endpoints))
    total_requests = summary.get("totalRequests", sum(e.get("total", 0) for e in endpoints))
    total_errors   = summary.get("totalErrors", sum(e.get("errors", 0) for e in endpoints))
    error_rate     = (total_errors / total_requests * 100) if total_requests else 0
    avg_rps        = total_rps / len(endpoints) if endpoints else 0
    avg_latency    = sum(e.get("avgMs", 0) for e in endpoints) / len(endpoints) if endpoints else 0

    verdict_label, verdict_icon, verdict_text = overall_verdict(endpoints)
    max_rps = max((e.get("rps", 0) for e in endpoints), default=1)

    L = []

    # ── Title ─────────────────────────────────────────────────────────────────
    L += [
        "# ⚡ SmartCampusAI — Baseline Load Test Report",
        "",
        f"> **Build** #{RUN_NUMBER} | **Branch** `{BRANCH}` | **Commit** `{SHA}` | **Date** `{NOW}`",
        "",
        "---",
        "",
    ]

    # ── Test Configuration ────────────────────────────────────────────────────
    L += [
        "## 🎯 Test Configuration",
        "",
        "| Parameter | Value |",
        "|-----------|-------|",
        f"| 👥 Virtual Users | **{connections} concurrent** |",
        f"| ⏱️ Duration | **{duration} seconds** per endpoint |",
        f"| 🎯 Target | `{base_url}` |",
        f"| 🛠️ Tool | autocannon (Node.js HTTP benchmarker) |",
        f"| 📅 Executed | {NOW} |",
        f"| 📦 Endpoints Tested | {len(endpoints)} |",
        "",
        "---",
        "",
    ]

    # ── Executive Summary ─────────────────────────────────────────────────────
    L += [
        "## 📊 Executive Summary",
        "",
        f"### {verdict_icon} Overall Verdict: **{verdict_label}**",
        "",
        f"> {verdict_text}",
        "",
        "| Metric | Value | Rating |",
        "|--------|-------|--------|",
        f"| 🚀 Combined RPS | **{total_rps:.1f} req/s** | {rate_rps(avg_rps)} |",
        f"| ⏱️ Avg Response Time | **{fmt_ms(avg_latency)}** | {rate_latency(avg_latency)} |",
        f"| 📦 Total Requests | **{fmt_num(total_requests)}** | — |",
        f"| ⚠️ Total Errors | **{fmt_num(total_errors)}** | {rate_errors(error_rate / 100)} |",
        f"| 📉 Error Rate | **{error_rate:.2f}%** | {rate_errors(error_rate / 100)} |",
        "",
        "---",
        "",
    ]

    # ── Per-Endpoint Results ──────────────────────────────────────────────────
    L += [
        "## 📋 Endpoint-by-Endpoint Results",
        "",
    ]

    for i, ep in enumerate(endpoints, 1):
        name    = ep.get("endpoint", f"Endpoint {i}")
        rps     = ep.get("rps", 0)
        avg_ms  = ep.get("avgMs", 0)
        min_ms  = ep.get("minMs", 0)
        max_ms  = ep.get("maxMs", 0)
        p99_ms  = ep.get("p99Ms", 0)
        total   = ep.get("total", 0)
        errors  = ep.get("errors", 0)
        err_rt  = ep.get("errorRate", 0)
        bar     = perf_bar(rps, max_rps)

        L += [
            f"### {i}. `{name}`",
            "",
            f"**Throughput:** `{bar}` **{rps:.1f} req/s** {rate_rps(rps)}",
            "",
            "| Metric | Value | Rating |",
            "|--------|-------|--------|",
            f"| 🚀 Requests/sec | **{rps:.1f} req/s** | {rate_rps(rps)} |",
            f"| 📦 Total Requests | **{fmt_num(total)}** | — |",
            f"| ⏱️ Average Latency | **{fmt_ms(avg_ms)}** | {rate_latency(avg_ms)} |",
            f"| ⚡ Min Latency | **{fmt_ms(min_ms)}** | — |",
            f"| 🐌 Max Latency | **{fmt_ms(max_ms)}** | — |",
            f"| 📊 P99 Latency | **{fmt_ms(p99_ms)}** | {rate_latency(p99_ms)} |",
            f"| ⚠️ Errors | **{fmt_num(errors)}** | {rate_errors(err_rt)} |",
            f"| 📉 Error Rate | **{err_rt*100:.2f}%** | {rate_errors(err_rt)} |",
            "",
        ]

    L.append("---")
    L.append("")

    # ── Comparison Table ──────────────────────────────────────────────────────
    L += [
        "## 🏆 All Endpoints Comparison",
        "",
        "| # | Endpoint | RPS | Avg | Min | Max | P99 | Errors | Status |",
        "|---|----------|-----|-----|-----|-----|-----|--------|--------|",
    ]
    for i, ep in enumerate(endpoints, 1):
        name   = ep.get("endpoint", f"ep{i}")
        rps    = ep.get("rps", 0)
        avg_ms = ep.get("avgMs", 0)
        min_ms = ep.get("minMs", 0)
        max_ms = ep.get("maxMs", 0)
        p99_ms = ep.get("p99Ms", 0)
        errors = ep.get("errors", 0)
        err_rt = ep.get("errorRate", 0)
        icon   = "🔴" if err_rt >= 0.05 else ("🟡" if avg_ms > 500 else "🟢")
        L.append(
            f"| {i} | `{name}` | {rps:.1f} | {fmt_ms(avg_ms)} | "
            f"{fmt_ms(min_ms)} | {fmt_ms(max_ms)} | {fmt_ms(p99_ms)} | "
            f"{errors} | {icon} |"
        )
    L += ["", "---", ""]

    # ── Performance Interpretation ────────────────────────────────────────────
    L += [
        "## 📖 How to Interpret These Results",
        "",
        "### Requests Per Second (RPS)",
        "",
        "| RPS Range | Rating | Meaning |",
        "|-----------|--------|---------|",
        "| ≥ 100 req/s | 🟢 EXCELLENT | Handles heavy traffic effortlessly |",
        "| 50–100 req/s | 🟢 GOOD | Handles 100 users comfortably |",
        "| 20–50 req/s | 🟡 ACCEPTABLE | Adequate for moderate load |",
        "| < 20 req/s | 🔴 POOR | Bottleneck — needs investigation |",
        "",
        "### Response Time",
        "",
        "| Latency | Rating | User Experience |",
        "|---------|--------|-----------------|",
        "| ≤ 100ms | 🟢 FAST | Instant — users barely notice |",
        "| 100–300ms | 🟢 GOOD | Very responsive |",
        "| 300–800ms | 🟡 ACCEPTABLE | Noticeable but tolerable |",
        "| > 800ms | 🔴 SLOW | Frustrating — needs optimization |",
        "",
        "### Error Rate",
        "",
        "| Error Rate | Rating | Action |",
        "|------------|--------|--------|",
        "| 0% | 🟢 NONE | Perfect — no issues |",
        "| < 1% | 🟢 OK | Minimal transient errors |",
        "| 1–5% | 🟡 WARN | Investigate under load |",
        "| ≥ 5% | 🔴 FAIL | Critical — must fix before production |",
        "",
        "> **Note:** Login/Register endpoints use bcrypt (CPU-heavy) — expect lower RPS.",
        "> This is by design for security. The P99 latency is the most important metric for UX.",
        "",
        "---",
        "",
        f"*Generated by SmartCampusAI CI/CD Pipeline — Build #{RUN_NUMBER} — {NOW}*",
    ]

    return "\n".join(L)


def build_fallback():
    """Generate a placeholder report when no JSON data is available."""
    L = [
        "# ⚡ SmartCampusAI — Baseline Load Test Report",
        "",
        f"> **Build** #{RUN_NUMBER} | **Date** `{NOW}`",
        "",
        "---",
        "",
        "## ⚠️ No Load Test Data Available",
        "",
        "The load test JSON output was not found. This can happen when:",
        "- The auth server failed to start",
        "- The load test script encountered an error",
        "- This is the first run (no previous results)",
        "",
        "## 🎯 Test Configuration (Planned)",
        "",
        "| Parameter | Value |",
        "|-----------|-------|",
        "| 👥 Virtual Users | **100 concurrent** |",
        "| ⏱️ Duration | **60 seconds** per endpoint |",
        "| 🛠️ Tool | autocannon |",
        "",
        "## 📋 Endpoints to be Tested",
        "",
        "| # | Endpoint | Purpose |",
        "|---|----------|---------|",
        "| 1 | `GET  /auth/me` | Health / unauthenticated check |",
        "| 2 | `POST /auth/login` | User login (bcrypt) |",
        "| 3 | `POST /auth/register` | User registration |",
        "| 4 | `POST /auth/forgot-password` | OTP trigger |",
        "| 5 | `POST /auth/verify-otp` | OTP verification |",
        "",
        "---",
        "",
        f"*Generated by SmartCampusAI CI/CD Pipeline — Build #{RUN_NUMBER} — {NOW}*",
    ]
    return "\n".join(L)


def main():
    os.makedirs(os.path.dirname(OUTPUT_MD) if os.path.dirname(OUTPUT_MD) else ".", exist_ok=True)

    json_path = find_json()
    if json_path:
        print(f"📂 Reading load test data from: {json_path}")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        report = build(data)
    else:
        print("⚠️  No load test JSON found — generating placeholder report")
        report = build_fallback()

    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"✅ Report written to: {OUTPUT_MD}")

    if STEP_SUMMARY:
        with open(STEP_SUMMARY, "a", encoding="utf-8") as f:
            f.write("\n\n")
            f.write(report)
        print("✅ GitHub Step Summary updated.")


if __name__ == "__main__":
    main()
