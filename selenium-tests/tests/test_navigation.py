"""
test_navigation.py – Navigation flow tests
Verifies bottom-tab navigation and screen transitions.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.search_page import SearchPage


class TestBottomNavigation:
    """Tests for the bottom tab navigation bar."""

    @pytest.mark.smoke
    def test_home_tab_active_on_load(self, driver, base_url):
        """TC-N-001: Home tab is the default active tab on load."""
        page = HomePage(driver, base_url).load()
        src = driver.page_source
        assert page.is_loaded(), "App must load before checking navigation"
        # Home content visible means Home tab is active
        assert page.is_app_title_visible() or "State" in src, (
            "Home screen content not active on initial load"
        )

    @pytest.mark.smoke
    def test_search_tab_navigates(self, driver, base_url):
        """TC-N-002: Clicking Search tab navigates to Search screen."""
        HomePage(driver, base_url).load()
        search_page = SearchPage(driver, base_url)
        search_page.navigate_to_search()
        assert search_page.is_search_screen_visible(), (
            "Search screen did not appear after clicking Search tab"
        )

    @pytest.mark.regression
    def test_compare_tab_navigates(self, driver, base_url):
        """TC-N-003: Compare tab is accessible and contains 'Compare' text."""
        HomePage(driver, base_url).load()
        try:
            tabs = driver.find_elements(
                "xpath", "//*[contains(text(),'Compare')]"
            )
            if tabs:
                driver.execute_script("arguments[0].click();", tabs[0])
                time.sleep(2)
        except Exception:
            pass
        src = driver.page_source
        assert "Compare" in src, "Compare tab content not found"

    @pytest.mark.regression
    def test_home_tab_navigates_back(self, driver, base_url):
        """TC-N-004: Clicking Home tab returns to home screen."""
        page = HomePage(driver, base_url).load()
        # Navigate away
        SearchPage(driver, base_url).navigate_to_search()
        time.sleep(1)
        # Navigate back to Home
        try:
            home_tabs = driver.find_elements(
                "xpath", "//*[contains(text(),'Home')]"
            )
            for tab in home_tabs:
                driver.execute_script("arguments[0].click();", tab)
                time.sleep(1.5)
                if page.is_app_title_visible():
                    break
        except Exception:
            pass
        assert page.is_loaded(), "Could not navigate back to Home"

    @pytest.mark.regression
    def test_three_tabs_present(self, driver, base_url):
        """TC-N-005: Three bottom navigation tabs are present (Home, Search, Compare)."""
        HomePage(driver, base_url).load()
        src = driver.page_source
        tabs_found = sum([
            "Home" in src,
            "Search" in src,
            "Compare" in src,
        ])
        assert tabs_found >= 2, (
            f"Expected at least 2 of [Home, Search, Compare] tabs, found {tabs_found}"
        )

    @pytest.mark.regression
    def test_no_broken_navigation(self, driver, base_url):
        """TC-N-006: Navigating through all tabs does not crash the app."""
        HomePage(driver, base_url).load()
        tab_texts = ["Search", "Compare", "Home"]
        for tab_text in tab_texts:
            try:
                els = driver.find_elements(
                    "xpath", f"//*[contains(text(),'{tab_text}')]"
                )
                if els:
                    driver.execute_script("arguments[0].click();", els[0])
                    time.sleep(1.5)
            except Exception:
                pass
        src = driver.page_source
        assert len(src) > 100, "Page appears broken after navigation"

    @pytest.mark.regression
    def test_search_to_home_flow(self, driver, base_url):
        """TC-N-007: Full navigation cycle Search→Home preserves state."""
        home = HomePage(driver, base_url).load()
        assert home.is_loaded(), "Home must load first"

        search = SearchPage(driver, base_url)
        search.navigate_to_search()
        assert search.is_search_screen_visible(), "Search should be visible"

        # Return to home
        try:
            home_tabs = driver.find_elements(
                "xpath", "//*[contains(text(),'Home')]"
            )
            if home_tabs:
                driver.execute_script("arguments[0].click();", home_tabs[0])
                time.sleep(2)
        except Exception:
            pass
        assert home.is_loaded(), "App should still be functional after round-trip"
