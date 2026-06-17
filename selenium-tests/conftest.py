"""
conftest.py – Shared fixtures for all Selenium E2E tests
Smart Admission Web App (GitHub Pages)
"""

import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

# ─── Environment ─────────────────────────────────────────────────────────────
BASE_URL = os.environ.get(
    "BASE_URL", "https://dinesh-2005d.github.io/Smart_Admission/"
).rstrip("/") + "/"

HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"
SCREENSHOTS_DIR = os.environ.get("SCREENSHOTS_DIR", "../Test Results/Screenshots")
IMPLICIT_WAIT    = int(os.environ.get("IMPLICIT_WAIT", "10"))
PAGE_LOAD_TIMEOUT = int(os.environ.get("PAGE_LOAD_TIMEOUT", "30"))
# How many extra seconds to wait for slow React Native Web hydration
HYDRATION_WAIT = int(os.environ.get("HYDRATION_WAIT", "5"))


# ─── Chrome Options ───────────────────────────────────────────────────────────
def get_chrome_options():
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
        opts.add_argument("--window-size=1366,768")
    else:
        # Visual mode for screen recording — match Xvfb display (1920×1080)
        opts.add_argument("--window-size=1920,1080")
        opts.add_argument("--start-maximized")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--disable-infobars")
    opts.add_argument("--disable-notifications")
    opts.add_argument("--log-level=3")
    opts.add_argument("--remote-debugging-port=9222")
    # Stable User-Agent for React Native Web
    opts.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    return opts


# ─── Driver factory ───────────────────────────────────────────────────────────
def _create_driver():
    opts = get_chrome_options()
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        service = Service(ChromeDriverManager().install())
        drv = webdriver.Chrome(service=service, options=opts)
    except Exception:
        drv = webdriver.Chrome(options=opts)
    drv.implicitly_wait(IMPLICIT_WAIT)
    drv.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return drv


# ─── Fixtures ─────────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="function")
def driver(request):
    """
    Chrome WebDriver – per test function.
    Takes a screenshot on failure and prints a page-source excerpt for debugging.
    """
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    drv = _create_driver()

    yield drv

    # ── Teardown ──────────────────────────────────────────────────────────────
    failed = (
        hasattr(request.node, "rep_call")
        and request.node.rep_call.failed
    )
    if failed:
        _capture_failure_screenshot(drv, request.node.name)
        # Print first 800 chars of source to help debug CI failures
        try:
            src = drv.page_source[:800]
            print(f"\n🔍 Page source on failure:\n{src}\n")
        except Exception:
            pass

    drv.quit()


@pytest.fixture(scope="function")
def slow_driver(request):
    """
    Chrome WebDriver with extra hydration wait — for tests that
    need more time for React Native Web to fully render.
    """
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    drv = _create_driver()

    yield drv

    failed = (
        hasattr(request.node, "rep_call")
        and request.node.rep_call.failed
    )
    if failed:
        _capture_failure_screenshot(drv, request.node.name)

    drv.quit()


@pytest.fixture(scope="function")
def wait(driver):
    return WebDriverWait(driver, 20)


@pytest.fixture(scope="function")
def app(driver, base_url):
    """Navigate to the app and wait for React Native Web to hydrate."""
    driver.get(base_url)
    time.sleep(HYDRATION_WAIT)
    return driver


@pytest.fixture(scope="function")
def app_slow(slow_driver, base_url):
    """Navigate with extended hydration wait (10s) for slower CI environments."""
    slow_driver.get(base_url)
    time.sleep(10)
    return slow_driver


# ─── Hooks ────────────────────────────────────────────────────────────────────
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)

    if rep.when == "call" and rep.failed:
        driver_fixture = item.funcargs.get("driver") or item.funcargs.get("slow_driver")
        if driver_fixture:
            _capture_failure_screenshot(driver_fixture, item.name)


def _capture_failure_screenshot(driver, test_name):
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    ts = time.strftime("%Y%m%d_%H%M%S")
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in test_name)
    path = os.path.join(SCREENSHOTS_DIR, f"FAIL_{safe_name}_{ts}.png")
    try:
        driver.save_screenshot(path)
        print(f"\n📸 Screenshot saved: {path}")
    except Exception as e:
        print(f"\n⚠️  Could not save screenshot: {e}")


# ─── CLI options ──────────────────────────────────────────────────────────────
def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default=BASE_URL,
        help="Base URL of the deployed app",
    )
    parser.addoption(
        "--hydration-wait",
        action="store",
        default=str(HYDRATION_WAIT),
        type=int,
        help="Extra seconds to wait for React Native Web hydration (default: 5)",
    )


def pytest_configure(config):
    global BASE_URL, HYDRATION_WAIT
    try:
        url = config.getoption("--base-url")
        if url:
            BASE_URL = url.rstrip("/") + "/"
    except (ValueError, AttributeError):
        pass
    try:
        hw = config.getoption("--hydration-wait")
        if hw is not None:
            HYDRATION_WAIT = int(hw)
    except (ValueError, AttributeError):
        pass


