#!/usr/bin/env python3
"""
Security Report Generator for Smart Admission
Aggregates Semgrep, Gitleaks, npm audit, and Trivy results
into a structured markdown security review.
"""

import argparse
import json
import os
from datetime import datetime


def load_json(path):
    """Safely load a JSON file, return empty dict if missing/invalid."""
    if not path or not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def severity_rank(sev):
    return {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}.get(
        sev.lower(), 5
    )


def parse_semgrep(data):
    findings = []
    for r in data.get("results", []):
        sev = r.get("extra", {}).get("severity", "INFO").upper()
        sev_map = {"ERROR": "High", "WARNING": "Medium", "INFO": "Low"}
        severity = sev_map.get(sev, "Low")

        findings.append(
            {
                "severity": severity,
                "type": "SAST",
                "tool": "Semgrep",
                "rule": r.get("check_id", "Unknown"),
                "file": r.get("path", "Unknown"),
                "line": r.get("start", {}).get("line", "?"),
                "description": r.get("extra", {}).get("message", "No description"),
                "fix": r.get("extra", {}).get("fix", "Review and remediate"),
            }
        )
    return findings


def parse_gitleaks(data):
    findings = []
    leaks = data.get("findings", data) if isinstance(data, dict) else data
    if isinstance(leaks, list):
        for leak in leaks:
            findings.append(
                {
                    "severity": "High",
                    "type": "Secret Detected",
                    "tool": "Gitleaks",
                    "rule": leak.get("RuleID", leak.get("rule", "generic-secret")),
                    "file": leak.get("File", leak.get("file", "Unknown")),
                    "line": leak.get("StartLine", leak.get("line", "?")),
                    "description": leak.get(
                        "Description",
                        leak.get("description", "Potential secret exposed"),
                    ),
                    "fix": "Remove hardcoded secret and use environment variables or GitHub Secrets instead.",
                }
            )
    return findings


def parse_npm_audit(data):
    findings = []
    vulns = data.get("vulnerabilities", {})
    for pkg_name, pkg_data in vulns.items():
        sev = pkg_data.get("severity", "low").capitalize()
        via = pkg_data.get("via", [])
        desc = ""
        if via and isinstance(via[0], dict):
            desc = via[0].get("title", "Dependency vulnerability")
        else:
            desc = f"Vulnerable dependency: {pkg_name}"

        findings.append(
            {
                "severity": sev,
                "type": "Dependency Vulnerability",
                "tool": "npm audit",
                "rule": f"CVE in {pkg_name}",
                "file": "package.json",
                "line": "N/A",
                "description": desc,
                "fix": f'Run `npm audit fix` or update {pkg_name} to a non-vulnerable version.',
            }
        )
    return findings


def parse_trivy(data):
    findings = []
    results = data.get("Results", [])
    for result in results:
        for vuln in result.get("Vulnerabilities", []):
            sev = vuln.get("Severity", "LOW").capitalize()
            findings.append(
                {
                    "severity": sev,
                    "type": "Dependency CVE",
                    "tool": "Trivy",
                    "rule": vuln.get("VulnerabilityID", "Unknown CVE"),
                    "file": result.get("Target", "Unknown"),
                    "line": "N/A",
                    "description": vuln.get(
                        "Description",
                        vuln.get("Title", "No description"),
                    )[:300],
                    "fix": f"Update {vuln.get('PkgName','package')} from "
                    f"{vuln.get('InstalledVersion','?')} to "
                    f"{vuln.get('FixedVersion','latest')}",
                }
            )
    return findings


def count_by_severity(findings):
    counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for f in findings:
        sev = f.get("severity", "Low")
        if sev in counts:
            counts[sev] += 1
        else:
            counts["Low"] += 1
    return counts


def calc_score(counts):
    score = 100
    score -= counts.get("Critical", 0) * 15
    score -= counts.get("High", 0) * 8
    score -= counts.get("Medium", 0) * 3
    score -= counts.get("Low", 0) * 1
    return max(0, score)


def generate_markdown(findings, framework, output_path):
    counts = count_by_severity(findings)
    total = sum(counts.values())
    score = calc_score(counts)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Sort findings by severity
    sorted_findings = sorted(
        findings,
        key=lambda x: severity_rank(x.get("severity", "Low")),
    )

    severity_emoji = {
        "Critical": "🚨",
        "High": "🔴",
        "Medium": "🟡",
        "Low": "🟢",
    }

    lines = [
        f"# 🔐 Security Review Report",
        f"",
        f"> **Application**: Smart Admission (Expo React Native)  ",
        f"> **Framework**: `{framework}`  ",
        f"> **Generated**: {now}  ",
        f"> **Total Findings**: {total}",
        f"",
        f"---",
        f"",
        f"## Executive Summary",
        f"",
        f"| Severity | Count |",
        f"|----------|-------|",
        f"| 🚨 Critical | {counts['Critical']} |",
        f"| 🔴 High | {counts['High']} |",
        f"| 🟡 Medium | {counts['Medium']} |",
        f"| 🟢 Low | {counts['Low']} |",
        f"| **Total** | {total} |",
        f"",
        f"### 🎯 Overall Security Score: **{score} / 100**",
        f"",
        f"---",
        f"",
        f"## Findings",
        f"",
    ]

    if not sorted_findings:
        lines.append("✅ **No findings detected.** All automated scans passed.")
    else:
        for i, finding in enumerate(sorted_findings, 1):
            sev = finding.get("severity", "Low")
            emoji = severity_emoji.get(sev, "🟢")
            lines += [
                f"### Finding #{i} — {emoji} {sev}: {finding.get('rule', 'Unknown')}",
                f"",
                f"| Field | Value |",
                f"|-------|-------|",
                f"| **Severity** | {sev} |",
                f"| **Type** | {finding.get('type', 'N/A')} |",
                f"| **Tool** | {finding.get('tool', 'N/A')} |",
                f"| **File** | `{finding.get('file', 'N/A')}` |",
                f"| **Line** | {finding.get('line', 'N/A')} |",
                f"",
                f"**Description**: {finding.get('description', 'N/A')}",
                f"",
                f"**Recommended Fix**: {finding.get('fix', 'Review and remediate')}",
                f"",
                f"---",
                f"",
            ]

    lines += [
        f"## Most Critical Risks",
        f"",
    ]

    top = [f for f in sorted_findings if f.get("severity") in ("Critical", "High")][:5]
    if top:
        for i, f in enumerate(top, 1):
            lines.append(f"{i}. **{f.get('rule','')}** in `{f.get('file','')}` — {f.get('description','')[:80]}")
    else:
        lines.append("No critical or high-severity findings.")

    lines += [
        f"",
        f"---",
        f"",
        f"## Known Issue: Hardcoded API Key in proxy-server.js",
        f"",
        f"> ⚠️ **High Severity** — A Groq API key is hardcoded in `proxy-server.js` line 20.",
        f"> This key is committed to version history and is considered compromised.",
        f"",
        f"**Impact**: Unauthorized use of the Groq API account, potential billing abuse.",
        f"",
        f"**Fix**:",
        f"1. Rotate the Groq API key immediately at https://console.groq.com/",
        f"2. Store the new key as a GitHub Secret: `Settings → Secrets → GROQ_API_KEY`",
        f"3. Update `proxy-server.js` to read from `process.env.GROQ_API_KEY`",
        f"4. Add `proxy-server.js` patterns to `.gitignore` for local dev or use `.env` files",
        f"",
        f"```javascript",
        f"// Before (INSECURE)",
        f"'Authorization': 'Bearer hardcoded-key-here'",
        f"",
        f"// After (SECURE)",
        f"'Authorization': `Bearer ${{process.env.GROQ_API_KEY}}`",
        f"```",
        f"",
    ]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"✅ Security review written to: {output_path}")
    print(f"   Total: {total} | Critical: {counts['Critical']} | High: {counts['High']} | Score: {score}/100")


def main():
    parser = argparse.ArgumentParser(description="Generate security review report")
    parser.add_argument("--semgrep", default="")
    parser.add_argument("--gitleaks", default="")
    parser.add_argument("--npm-audit", default="")
    parser.add_argument("--trivy", default="")
    parser.add_argument("--output", required=True)
    parser.add_argument("--framework", default="unknown")
    args = parser.parse_args()

    all_findings = []

    semgrep_data = load_json(args.semgrep)
    if semgrep_data:
        parsed = parse_semgrep(semgrep_data)
        all_findings.extend(parsed)
        print(f"📊 Semgrep: {len(parsed)} findings")

    gitleaks_data = load_json(args.gitleaks)
    if gitleaks_data:
        parsed = parse_gitleaks(gitleaks_data)
        all_findings.extend(parsed)
        print(f"🔐 Gitleaks: {len(parsed)} findings")

    # Always check proxy-server.js for hardcoded key
    if os.path.exists("proxy-server.js"):
        with open("proxy-server.js", "r") as pf:
            content = pf.read()
        if "Bearer" in content and "process.env" not in content:
            all_findings.append({
                "severity": "High",
                "type": "Hardcoded Secret",
                "tool": "Manual Scan",
                "rule": "hardcoded-api-key",
                "file": "proxy-server.js",
                "line": "20",
                "description": "Hardcoded Groq API Bearer token found in proxy-server.js",
                "fix": "Use process.env.GROQ_API_KEY and store the key in GitHub Secrets",
            })
            print("⚠️  Hardcoded API key detected in proxy-server.js")

    npm_data = load_json(args.npm_audit)
    if npm_data:
        parsed = parse_npm_audit(npm_data)
        all_findings.extend(parsed)
        print(f"📦 npm audit: {len(parsed)} findings")

    trivy_data = load_json(args.trivy)
    if trivy_data:
        parsed = parse_trivy(trivy_data)
        all_findings.extend(parsed)
        print(f"🔍 Trivy: {len(parsed)} findings")

    generate_markdown(all_findings, args.framework, args.output)


if __name__ == "__main__":
    main()
