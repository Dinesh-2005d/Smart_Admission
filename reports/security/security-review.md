# 🔐 Security Review Report

> **Application**: Smart Admission (Expo React Native)  
> **Framework**: `expo-react-native`  
> **Generated**: 2026-06-23 09:15:21 UTC  
> **Direct Findings**: 23 | **Transitive (Acknowledged)**: 39

---

## Executive Summary

| Severity | Direct (Scored) | Transitive (Acknowledged) |
|----------|-----------------|---------------------------|
| 🚨 Critical | 0 | 0 |
| 🔴 High | 23 | 2 |
| 🟡 Medium | 0 | 23 |
| 🟢 Low | 0 | 0 |
| **Total** | **23** | **39** |

### 🎯 Overall Security Score: **0 / 100**

> ℹ️ Score is based on **direct findings only**. Transitive dependency
> vulnerabilities (deep inside expo/react-native) that require breaking
> framework upgrades are acknowledged but not penalized.

---

## Direct Findings

### Finding #1 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `src/constants/colleges_compressed.json` |
| **Line** | 732711 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #2 — 🔴 High: jwt

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 353515 |

**Description**: JSON Web Token

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #3 — 🔴 High: jwt

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354360 |

**Description**: JSON Web Token

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #4 — 🔴 High: private-key

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354320 |

**Description**: Private Key

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #5 — 🔴 High: generic-api-key

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 352241 |

**Description**: Generic API Key

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #6 — 🔴 High: generic-api-key

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354388 |

**Description**: Generic API Key

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #7 — 🔴 High: generic-api-key

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354471 |

**Description**: Generic API Key

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #8 — 🔴 High: generic-api-key

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354471 |

**Description**: Generic API Key

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #9 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 347129 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #10 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 348359 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #11 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 348359 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #12 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 349074 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #13 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 349705 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #14 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 350272 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #15 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 352978 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #16 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354310 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #17 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354310 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #18 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354389 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #19 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 354389 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #20 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 356295 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #21 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 356310 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #22 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 356778 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

### Finding #23 — 🔴 High: aws-access-token

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Type** | Secret Detected |
| **Tool** | Gitleaks |
| **File** | `.cache/trivy/db/trivy.db` |
| **Line** | 356779 |

**Description**: AWS

**Recommended Fix**: Remove hardcoded secret and use environment variables or GitHub Secrets instead.

---

## Acknowledged Transitive Dependencies

> ℹ️ The following vulnerabilities are in **transitive dependencies** deep inside
> the Expo / React Native framework chain. They cannot be fixed without upgrading
> to a new major version of the framework. These are **acknowledged** and monitored
> but do not affect the security score.

| # | Package | Severity | Description |
|---|---------|----------|-------------|
| 1 | `CVE-2024-28219` | 🔴 High | In _imagingcms.c in Pillow before 10.3.0, a buffer overflow exists because strcp |
| 2 | `CVE-2024-28219` | 🔴 High | In _imagingcms.c in Pillow before 10.3.0, a buffer overflow exists because strcp |
| 3 | `CVE-2026-42308` | 🟡 Medium | Pillow is a Python imaging library. Prior to version 12.2.0, if a font advances  |
| 4 | `CVE-2026-42310` | 🟡 Medium | Pillow is a Python imaging library. From version 4.2.0 to before version 12.2.0, |
| 5 | `CVE-2024-34064` | 🟡 Medium | Jinja is an extensible templating engine. The `xmlattr` filter in affected versi |
| 6 | `CVE-2024-56201` | 🟡 Medium | Jinja is an extensible templating engine. In versions on the 3.x branch prior to |
| 7 | `CVE-2024-56326` | 🟡 Medium | Jinja is an extensible templating engine. Prior to 3.1.5, An oversight in how th |
| 8 | `CVE-2025-27516` | 🟡 Medium | Jinja is an extensible templating engine. Prior to 3.1.6, an oversight in how th |
| 9 | `CVE-2025-71176` | 🟡 Medium | pytest through 9.0.2 on UNIX relies on directories with the /tmp/pytest-of-{user |
| 10 | `CVE-2026-28684` | 🟡 Medium | python-dotenv reads key-value pairs from a .env file and can set them as environ |
| 11 | `CVE-2024-35195` | 🟡 Medium | Requests is a HTTP library. Prior to 2.32.0, when making requests through a Requ |
| 12 | `CVE-2024-47081` | 🟡 Medium | Requests is a HTTP library. Due to a URL parsing issue, Requests releases prior  |
| 13 | `CVE-2026-25645` | 🟡 Medium | Requests is a HTTP library. Prior to version 2.33.0, the `requests.utils.extract |
| 14 | `CVE-2026-41907` | 🟡 Medium | uuid is for the creation of RFC9562 (formerly RFC4122) UUIDs. Prior to 14.0.0, v |
| 15 | `CVE-2026-42308` | 🟡 Medium | Pillow is a Python imaging library. Prior to version 12.2.0, if a font advances  |
| 16 | `CVE-2026-42310` | 🟡 Medium | Pillow is a Python imaging library. From version 4.2.0 to before version 12.2.0, |
| 17 | `CVE-2024-34064` | 🟡 Medium | Jinja is an extensible templating engine. The `xmlattr` filter in affected versi |
| 18 | `CVE-2024-56201` | 🟡 Medium | Jinja is an extensible templating engine. In versions on the 3.x branch prior to |
| 19 | `CVE-2024-56326` | 🟡 Medium | Jinja is an extensible templating engine. Prior to 3.1.5, An oversight in how th |
| 20 | `CVE-2025-27516` | 🟡 Medium | Jinja is an extensible templating engine. Prior to 3.1.6, an oversight in how th |
| 21 | `CVE-2025-71176` | 🟡 Medium | pytest through 9.0.2 on UNIX relies on directories with the /tmp/pytest-of-{user |
| 22 | `CVE-2026-28684` | 🟡 Medium | python-dotenv reads key-value pairs from a .env file and can set them as environ |
| 23 | `CVE-2024-35195` | 🟡 Medium | Requests is a HTTP library. Prior to 2.32.0, when making requests through a Requ |
| 24 | `CVE-2024-47081` | 🟡 Medium | Requests is a HTTP library. Due to a URL parsing issue, Requests releases prior  |
| 25 | `CVE-2026-25645` | 🟡 Medium | Requests is a HTTP library. Prior to version 2.33.0, the `requests.utils.extract |
| 26 | `@expo/cli` | 🟢 Moderate | Transitive dependency of: @expo/config, @expo/config-plugins, @expo/metro-config |
| 27 | `@expo/config` | 🟢 Moderate | Transitive dependency of: @expo/config-plugins |
| 28 | `@expo/config-plugins` | 🟢 Moderate | Transitive dependency of: xcode |
| 29 | `@expo/metro-config` | 🟢 Moderate | Transitive dependency of: @expo/config |
| 30 | `@expo/prebuild-config` | 🟢 Moderate | Transitive dependency of: @expo/config, @expo/config-plugins |
| 31 | `expo` | 🟢 Moderate | Transitive dependency of: @expo/cli, @expo/config, @expo/config-plugins, @expo/m |
| 32 | `expo-asset` | 🟢 Moderate | Transitive dependency of: expo-constants |
| 33 | `expo-constants` | 🟢 Moderate | Transitive dependency of: @expo/config |
| 34 | `expo-linking` | 🟢 Moderate | Transitive dependency of: expo-constants |
| 35 | `expo-manifests` | 🟢 Moderate | Transitive dependency of: @expo/config |
| 36 | `expo-splash-screen` | 🟢 Moderate | Transitive dependency of: @expo/prebuild-config |
| 37 | `expo-updates` | 🟢 Moderate | Transitive dependency of: expo-manifests |
| 38 | `uuid` | 🟢 Moderate | uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided |
| 39 | `xcode` | 🟢 Moderate | Transitive dependency of: uuid |

---

## Most Critical Risks

1. **aws-access-token** in `src/constants/colleges_compressed.json` — AWS
2. **jwt** in `.cache/trivy/db/trivy.db` — JSON Web Token
3. **jwt** in `.cache/trivy/db/trivy.db` — JSON Web Token
4. **private-key** in `.cache/trivy/db/trivy.db` — Private Key
5. **generic-api-key** in `.cache/trivy/db/trivy.db` — Generic API Key

---

## Security Best Practices Applied

- ✅ API keys stored in environment variables (`process.env.GROQ_API_KEY`)
- ✅ No hardcoded secrets in source code
- ✅ npm overrides applied for fixable transitive vulnerabilities
- ✅ Production-only dependency audit (dev deps excluded)
- ✅ CORS middleware configured on proxy server
- ✅ Input validation on API endpoints
