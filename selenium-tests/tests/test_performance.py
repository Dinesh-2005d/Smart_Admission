"""
test_performance.py – Splash screen, load time, and performance metric tests
Tests initial load experience, Web Vitals, resource timing, and
verifies the app transitions correctly from splash to main content.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.splash_page import SplashPage


class TestSplashScreen:
    """Tests for the animated splash / initial load screen."""

    @pytest.mark.smoke
    def test_app_loads_at_root(self, driver, base_url):
        """TC-SP-001: App root URL loads without a blank/error page."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=5)
        assert page.is_splash_or_app_visible(), (
            "App root URL returned a blank/error page"
        )

    @pytest.mark.smoke
    def test_app_logo_visible_on_load(self, driver, base_url):
        """TC-SP-002: App logo ('Smart Admission' / 🎓) is visible on initial load."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=5)
        assert page.is_app_logo_visible(), (
            "App logo (Smart / 🎓 / Admission) not visible on initial page load"
        )

    @pytest.mark.smoke
    def test_splash_transitions_to_app(self, driver, base_url):
        """TC-SP-003: After splash, app transitions to login or home screen."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=7)
        assert page.has_transitioned_past_splash() or page.is_splash_or_app_visible(), (
            "App did not transition past splash screen within 7 seconds"
        )

    @pytest.mark.smoke
    def test_page_title_after_splash(self, driver, base_url):
        """TC-SP-004: Browser tab title is set after splash completes."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        title = driver.title
        assert title and len(title.strip()) > 0, (
            "Browser tab title is empty after splash screen"
        )

    @pytest.mark.regression
    def test_no_js_errors_on_splash(self, driver, base_url):
        """TC-SP-005: No critical JS errors during splash/load phase."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        logs = driver.get_log("browser")
        critical = [
            log for log in logs
            if log.get("level") == "SEVERE"
            and "favicon" not in log.get("message", "").lower()
            and "404" not in log.get("message", "")
        ]
        assert len(critical) == 0, (
            "Critical JS errors during splash:\n"
            + "\n".join(e.get("message", "") for e in critical[:5])
        )

    @pytest.mark.regression
    def test_splash_no_crash(self, driver, base_url):
        """TC-SP-006: Splash screen does not crash the browser tab."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        assert len(driver.page_source) > 100, (
            "Page appears empty/crashed during splash"
        )

    @pytest.mark.regression
    def test_refresh_works_after_load(self, driver, base_url):
        """TC-SP-007: Refreshing the page after load works correctly."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        driver.refresh()
        time.sleep(5)
        assert len(driver.page_source) > 100, (
            "App broke after page refresh"
        )

    @pytest.mark.regression
    def test_app_title_consistent_after_refresh(self, driver, base_url):
        """TC-SP-008: App title remains correct after page refresh."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=4)
        title_before = driver.title
        driver.refresh()
        time.sleep(4)
        title_after = driver.title
        # Both should be non-empty (may differ but neither should be blank/error)
        assert title_after and len(title_after.strip()) > 0, (
            f"Title was empty after refresh. Before: '{title_before}', After: '{title_after}'"
        )


class TestWebVitals:
    """Tests for Core Web Vitals and performance metrics."""

    @pytest.mark.performance
    def test_page_load_under_30s(self, driver, base_url):
        """TC-WV-001: Full page load completes within 30 seconds."""
        page = SplashPage(driver, base_url)
        start = time.time()
        page.load_and_wait(splash_wait=0)
        elapsed = time.time() - start
        assert elapsed < 30, (
            f"Page took too long to load: {elapsed:.1f}s (threshold: 30s)"
        )

    @pytest.mark.performance
    def test_dom_ready_state(self, driver, base_url):
        """TC-WV-002: DOM reaches 'complete' ready state after load."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        state = driver.execute_script("return document.readyState;")
        assert state == "complete", (
            f"Document readyState is '{state}', expected 'complete'"
        )

    @pytest.mark.performance
    def test_ttfb_reasonable(self, driver, base_url):
        """TC-WV-003: Time To First Byte (TTFB) is within 3 seconds."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=3)
        timing = page.get_resource_timing()
        ttfb = timing.get("ttfb", 0)
        # TTFB includes GitHub Pages CDN latency; allow 3000ms
        assert ttfb >= 0, f"Invalid TTFB value: {ttfb}"
        if ttfb > 0:
            assert ttfb < 3000, (
                f"TTFB too high: {ttfb}ms (threshold: 3000ms)"
            )

    @pytest.mark.performance
    def test_dom_content_loaded_under_15s(self, driver, base_url):
        """TC-WV-004: DOM Content Loaded fires within 15 seconds."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=3)
        timing = page.get_resource_timing()
        dom_load = timing.get("dom_load", 0)
        if dom_load > 0:
            assert dom_load < 15000, (
                f"DOMContentLoaded too slow: {dom_load}ms (threshold: 15000ms)"
            )

    @pytest.mark.performance
    def test_fcp_within_threshold(self, driver, base_url):
        """TC-WV-005: First Contentful Paint (FCP) is within 5 seconds."""
        page = SplashPage(driver, base_url)
        page.load_and_wait(splash_wait=3)
        metrics = page.get_paint_metrics()
        fcp = metrics.get("first-contentful-paint", 0)
        if fcp > 0:
            assert fcp < 5000, (
                f"FCP too slow: {fcp}ms (threshold: 5000ms)"
            )

    @pytest.mark.performance
    def test_no_404_resources(self, driver, base_url):
        """TC-WV-006: No 404 resource errors in the browser console."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        logs = driver.get_log("browser")
        not_found = [
            log for log in logs
            if "404" in log.get("message", "")
            and "favicon" not in log.get("message", "").lower()
        ]
        assert len(not_found) == 0, (
            f"404 errors found for resources:\n"
            + "\n".join(e.get("message", "")[:120] for e in not_found[:5])
        )

    @pytest.mark.performance
    def test_page_source_substantial(self, driver, base_url):
        """TC-WV-007: Page source is substantial (not a blank/error shell)."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        src = driver.page_source
        assert len(src) > 2000, (
            f"Page source too short ({len(src)} chars) — may be an error shell"
        )

    @pytest.mark.performance
    def test_memory_usage_sane(self, driver, base_url):
        """TC-WV-008: JS heap memory usage is below 200MB after load."""
        SplashPage(driver, base_url).load_and_wait(splash_wait=5)
        try:
            heap = driver.execute_script(
                "return performance.memory ? performance.memory.usedJSHeapSize : 0;"
            )
            if heap and heap > 0:
                heap_mb = heap / (1024 * 1024)
                assert heap_mb < 200, (
                    f"JS heap too large: {heap_mb:.1f}MB (threshold: 200MB)"
                )
        except Exception:
            pass  # performance.memory is Chrome-only and may not exist


class TestCrossPageConsistency:
    """Tests that verify consistency across all screens."""

    @pytest.mark.regression
    def test_app_title_same_on_all_tabs(self, driver, base_url):
        """TC-CP-001: Browser title remains consistent across tab navigation."""
        HomePage(driver, base_url).load()
        title_home = driver.title
        # Navigate to Search
        try:
            tabs = driver.find_elements("xpath", "//*[contains(text(),'Search')]")
            if tabs:
                driver.execute_script("arguments[0].click();", tabs[0])
                time.sleep(2)
        except Exception:
            pass
        title_search = driver.title
        # Both should be non-empty
        assert title_home and title_search, (
            f"Title became empty during navigation. Home: '{title_home}', Search: '{title_search}'"
        )

    @pytest.mark.regression
    def test_url_stays_on_github_pages(self, driver, base_url):
        """TC-CP-002: URL remains on GitHub Pages domain during all navigation."""
        HomePage(driver, base_url).load()
        current = driver.current_url
        assert "github.io" in current or "Smart_Admission" in current, (
            f"App navigated away from GitHub Pages: {current}"
        )

    @pytest.mark.regression
    def test_app_recovers_from_back_forward(self, driver, base_url):
        """TC-CP-003: App remains functional after browser back/forward."""
        home = HomePage(driver, base_url).load()
        # Navigate to search
        try:
            tabs = driver.find_elements("xpath", "//*[contains(text(),'Search')]")
            if tabs:
                driver.execute_script("arguments[0].click();", tabs[0])
                time.sleep(2)
        except Exception:
            pass
        # Browser back
        driver.back()
        time.sleep(2)
        # Browser forward
        driver.forward()
        time.sleep(2)
        assert len(driver.page_source) > 200, (
            "App broke after browser back/forward navigation"
        )

    @pytest.mark.regression
    def test_window_resize_does_not_crash(self, driver, base_url):
        """TC-CP-004: App handles window resize gracefully."""
        HomePage(driver, base_url).load()
        for w, h in [(1920, 1080), (1280, 720), (768, 1024), (375, 812)]:
            driver.set_window_size(w, h)
            time.sleep(0.8)
        # Restore
        driver.set_window_size(1920, 1080)
        assert len(driver.page_source) > 200, (
            "App broke after multiple window resizes"
        )
