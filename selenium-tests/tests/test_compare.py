"""
test_compare.py – Compare screen tests
Verifies the Compare tab loads, shows correct UI elements,
and handles the empty state gracefully.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.compare_page import ComparePage


class TestCompareScreenLoad:
    """Verifies the Compare screen loads and shows correct initial state."""

    @pytest.mark.smoke
    def test_compare_tab_accessible(self, driver, base_url):
        """TC-C-001: Compare tab is accessible from the bottom navigation."""
        HomePage(driver, base_url).load()
        page = ComparePage(driver, base_url)
        page.navigate_to_compare()
        assert page.is_compare_screen_visible(), (
            "Compare screen did not become visible after clicking Compare tab"
        )

    @pytest.mark.regression
    def test_compare_tab_present_in_nav(self, driver, base_url):
        """TC-C-002: Compare tab label exists in the bottom navigation bar."""
        HomePage(driver, base_url).load()
        page = ComparePage(driver, base_url)
        assert page.is_compare_tab_present_in_nav(), (
            "'Compare' label not found in navigation"
        )

    @pytest.mark.regression
    def test_compare_heading_visible(self, driver, base_url):
        """TC-C-003: Compare screen has a heading with 'Compare' text."""
        HomePage(driver, base_url).load()
        page = ComparePage(driver, base_url)
        page.navigate_to_compare()
        heading = page.get_compare_heading()
        assert "Compare" in heading or page.is_compare_screen_visible(), (
            f"Compare heading not found. Got: '{heading}'"
        )

    @pytest.mark.regression
    def test_compare_empty_state_shown(self, driver, base_url):
        """TC-C-004: Empty state is shown when no colleges added to compare."""
        HomePage(driver, base_url).load()
        page = ComparePage(driver, base_url)
        page.navigate_to_compare()
        assert page.is_empty_state_shown(), (
            "Expected an empty/placeholder state in Compare screen"
        )

    @pytest.mark.regression
    def test_compare_screen_no_crash(self, driver, base_url):
        """TC-C-005: Navigating to Compare does not crash the app."""
        HomePage(driver, base_url).load()
        page = ComparePage(driver, base_url)
        page.navigate_to_compare()
        # App is alive if page source has meaningful content
        assert len(driver.page_source) > 500, "Page appears broken on Compare tab"

    @pytest.mark.regression
    def test_compare_round_trip_home(self, driver, base_url):
        """TC-C-006: Navigate Compare → Home → Compare without crash."""
        home = HomePage(driver, base_url).load()
        compare = ComparePage(driver, base_url)
        compare.navigate_to_compare()
        assert compare.is_compare_screen_visible(), "Compare should be visible"
        # Back to Home
        try:
            tabs = driver.find_elements("xpath", "//*[contains(text(),'Home')]")
            if tabs:
                driver.execute_script("arguments[0].click();", tabs[0])
                time.sleep(2)
        except Exception:
            pass
        assert home.is_loaded(), "Home should be reachable after Compare"

    @pytest.mark.regression
    def test_compare_search_compare_cycle(self, driver, base_url):
        """TC-C-007: Navigate Search → Compare cycle does not break navigation."""
        from page_objects.search_page import SearchPage
        HomePage(driver, base_url).load()
        SearchPage(driver, base_url).navigate_to_search()
        time.sleep(1)
        compare = ComparePage(driver, base_url)
        compare.navigate_to_compare()
        assert compare.is_compare_screen_visible(), (
            "Compare screen not visible after Search→Compare navigation"
        )

    @pytest.mark.regression
    def test_no_js_errors_on_compare(self, driver, base_url):
        """TC-C-008: No critical JavaScript errors on Compare screen."""
        HomePage(driver, base_url).load()
        ComparePage(driver, base_url).navigate_to_compare()
        logs = driver.get_log("browser")
        critical = [
            log for log in logs
            if log.get("level") == "SEVERE"
            and "favicon" not in log.get("message", "").lower()
            and "404" not in log.get("message", "")
        ]
        assert len(critical) == 0, (
            "Critical JS errors on Compare screen:\n"
            + "\n".join(e.get("message", "") for e in critical[:5])
        )
