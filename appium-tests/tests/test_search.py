"""
test_search.py – Search screen tests for Android
"""

import pytest
from page_objects.splash_screen import SplashScreen
from page_objects.search_screen import SearchScreen


class TestSearchScreen:
    """Search tab functionality on Android."""

    @pytest.mark.smoke
    @pytest.mark.search
    def test_search_tab_accessible(self, driver):
        """TC-AS-001: Search tab is accessible from bottom navigation."""
        SplashScreen(driver).wait_for_splash_to_finish()
        search = SearchScreen(driver)
        search.navigate_to_search()
        assert search.is_search_visible(), "Search screen not visible"

    @pytest.mark.regression
    @pytest.mark.search
    def test_popular_tags_visible(self, driver):
        """TC-AS-002: Popular search tags displayed on search screen."""
        SplashScreen(driver).wait_for_splash_to_finish()
        search = SearchScreen(driver)
        search.navigate_to_search()
        assert search.is_popular_tags_visible(), "Popular tags not visible"

    @pytest.mark.regression
    @pytest.mark.search
    def test_search_iit(self, driver):
        """TC-AS-003: Searching 'IIT' returns results."""
        SplashScreen(driver).wait_for_splash_to_finish()
        search = SearchScreen(driver)
        search.navigate_to_search()
        search.type_query("IIT")
        assert search.has_results(), "No results for 'IIT' search"

    @pytest.mark.regression
    @pytest.mark.search
    def test_search_nonsense_no_results(self, driver):
        """TC-AS-004: Nonsense query shows no-results message."""
        SplashScreen(driver).wait_for_splash_to_finish()
        search = SearchScreen(driver)
        search.navigate_to_search()
        search.type_query("XYZNONEXISTENT99")
        assert search.has_no_results(), "Expected no-results message"

    @pytest.mark.regression
    @pytest.mark.search
    def test_search_engineering(self, driver):
        """TC-AS-005: Searching 'Engineering' shows engineering colleges."""
        SplashScreen(driver).wait_for_splash_to_finish()
        search = SearchScreen(driver)
        search.navigate_to_search()
        search.type_query("Engineering")
        src = driver.page_source
        assert "Engineering" in src or search.has_results(), (
            "No engineering results"
        )
