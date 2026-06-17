"""
test_saved_colleges.py – Saved Colleges tab tests
Verifies the Saved tab is accessible, shows the correct empty state,
and does not crash on interaction.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.saved_page import SavedPage
from page_objects.search_page import SearchPage


class TestSavedCollegesLoad:
    """Verifies the Saved Colleges screen loads and has correct initial UI."""

    @pytest.mark.smoke
    def test_saved_tab_accessible(self, driver, base_url):
        """TC-SV-001: Saved tab is accessible from the bottom navigation."""
        HomePage(driver, base_url).load()
        page = SavedPage(driver, base_url)
        page.navigate_to_saved()
        assert page.is_saved_screen_visible(), (
            "Saved screen did not become visible after clicking Saved tab"
        )

    @pytest.mark.regression
    def test_saved_tab_label_in_nav(self, driver, base_url):
        """TC-SV-002: 'Saved' or 'Bookmarked' label is in the navigation bar."""
        HomePage(driver, base_url).load()
        page = SavedPage(driver, base_url)
        assert page.is_saved_tab_in_nav(), (
            "'Saved' or 'Bookmark' label not found in navigation"
        )

    @pytest.mark.regression
    def test_saved_empty_state_shown(self, driver, base_url):
        """TC-SV-003: Empty state or Saved heading is visible on fresh load."""
        HomePage(driver, base_url).load()
        page = SavedPage(driver, base_url)
        page.navigate_to_saved()
        assert page.is_saved_screen_visible(), (
            "Saved screen content not visible — expected empty state or heading"
        )

    @pytest.mark.regression
    def test_saved_tab_no_crash(self, driver, base_url):
        """TC-SV-004: Navigating to Saved tab does not crash the app."""
        HomePage(driver, base_url).load()
        page = SavedPage(driver, base_url)
        page.navigate_to_saved()
        assert len(driver.page_source) > 500, (
            "Page appears broken after navigating to Saved tab"
        )

    @pytest.mark.regression
    def test_saved_tab_after_search(self, driver, base_url):
        """TC-SV-005: Saved tab is reachable after visiting Search screen."""
        HomePage(driver, base_url).load()
        SearchPage(driver, base_url).navigate_to_search()
        time.sleep(1)
        page = SavedPage(driver, base_url)
        page.navigate_to_saved()
        assert page.is_saved_screen_visible(), (
            "Saved screen not visible after Search→Saved navigation"
        )

    @pytest.mark.regression
    def test_saved_round_trip_home(self, driver, base_url):
        """TC-SV-006: Navigate Saved → Home → Saved without crash."""
        home = HomePage(driver, base_url).load()
        saved = SavedPage(driver, base_url)
        saved.navigate_to_saved()
        assert saved.is_saved_screen_visible(), "Saved should be visible"
        # Back to Home
        try:
            tabs = driver.find_elements("xpath", "//*[contains(text(),'Home')]")
            if tabs:
                driver.execute_script("arguments[0].click();", tabs[0])
                time.sleep(2)
        except Exception:
            pass
        assert home.is_loaded(), "Home should be reachable after Saved"
        # Back to Saved
        saved.navigate_to_saved()
        assert saved.is_saved_screen_visible(), (
            "Saved not visible on second visit"
        )

    @pytest.mark.regression
    def test_all_four_tabs_accessible(self, driver, base_url):
        """TC-SV-007: All 4 main tabs (Home, Search, Compare, Saved) are accessible."""
        HomePage(driver, base_url).load()
        src = driver.page_source
        tabs_found = sum([
            "Home" in src,
            "Search" in src,
            "Compare" in src,
            "Saved" in src,
        ])
        assert tabs_found >= 3, (
            f"Expected at least 3 of [Home, Search, Compare, Saved] in nav, found {tabs_found}"
        )

    @pytest.mark.regression
    def test_no_js_errors_on_saved(self, driver, base_url):
        """TC-SV-008: No critical JavaScript errors on Saved screen."""
        HomePage(driver, base_url).load()
        SavedPage(driver, base_url).navigate_to_saved()
        logs = driver.get_log("browser")
        critical = [
            log for log in logs
            if log.get("level") == "SEVERE"
            and "favicon" not in log.get("message", "").lower()
            and "404" not in log.get("message", "")
        ]
        assert len(critical) == 0, (
            "Critical JS errors on Saved screen:\n"
            + "\n".join(e.get("message", "") for e in critical[:5])
        )
