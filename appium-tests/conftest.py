"""
conftest.py – Shared fixtures for Appium E2E tests
Smart Admission Android App
"""

import os
import time
import pytest
from appium import webdriver as appium_driver
from appium.options.android import UiAutomator2Options
from selenium.webdriver.support.ui import WebDriverWait

# ─── Environment Config ──────────────────────────────────────────────────────
APPIUM_HOST = os.environ.get("APPIUM_HOST", "localhost")
APPIUM_PORT = os.environ.get("APPIUM_PORT", "4723")
APP_PACKAGE = os.environ.get("APP_PACKAGE", "com.deepanjagan.SmartCampusAI")
APP_ACTIVITY = os.environ.get("APP_ACTIVITY", ".MainActivity")
SCREENSHOTS_DIR = os.environ.get("SCREENSHOTS_DIR", "../Test Results/Screenshots")
IMPLICIT_WAIT = int(os.environ.get("IMPLICIT_WAIT", "15"))


def get_appium_url():
    return f"http://{APPIUM_HOST}:{APPIUM_PORT}"


def get_capabilities():
    opts = UiAutomator2Options()
    opts.platform_name = "Android"
    opts.device_name = os.environ.get("DEVICE_NAME", "emulator-5554")
    opts.app_package = APP_PACKAGE
    opts.app_activity = APP_ACTIVITY
    opts.automation_name = "UiAutomator2"
    opts.no_reset = False
    opts.full_reset = False
    opts.new_command_timeout = 300
    opts.auto_grant_permissions = True

    # If an APK path is provided
    apk_path = os.environ.get("APK_PATH", "")
    if apk_path and os.path.exists(apk_path):
        opts.app = os.path.abspath(apk_path)

    return opts


# ─── Fixtures ─────────────────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def driver(request):
    """Create an Appium driver instance for each test."""
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    opts = get_capabilities()

    try:
        drv = appium_driver.Remote(
            command_executor=get_appium_url(),
            options=opts,
        )
        drv.implicitly_wait(IMPLICIT_WAIT)
    except Exception as e:
        pytest.skip(f"Could not connect to Appium at {get_appium_url()}: {e}")
        return

    yield drv

    # Screenshot on failure
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        _capture_failure_screenshot(drv, request.node.name)

    try:
        drv.quit()
    except Exception:
        pass


@pytest.fixture(scope="function")
def wait(driver):
    return WebDriverWait(driver, 20)


# ─── Hooks ────────────────────────────────────────────────────────────────────
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)

    if rep.when == "call" and rep.failed:
        driver_fixture = item.funcargs.get("driver")
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
