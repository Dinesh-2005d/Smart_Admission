"""
test_home_flow.py – Home screen flow tests for Android
"""

import pytest
from page_objects.splash_screen import SplashScreen
from page_objects.home_screen import HomeScreen


class TestHomeScreen:
    """Home screen UI and interaction tests."""

    @pytest.mark.smoke
    @pytest.mark.home
    def test_home_screen_loads(self, driver):
        """TC-HF-001: Home screen loads after splash."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_home_loaded(), "Home screen did not load"

    @pytest.mark.smoke
    @pytest.mark.home
    def test_title_visible(self, driver):
        """TC-HF-002: App title is visible on home screen."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_title_visible(), "Title not visible"

    @pytest.mark.regression
    @pytest.mark.home
    def test_tagline_visible(self, driver):
        """TC-HF-003: App tagline/subtitle is visible."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_tagline_visible(), "Tagline not visible"

    @pytest.mark.regression
    @pytest.mark.home
    def test_state_selector_present(self, driver):
        """TC-HF-004: State selector exists on home screen."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_state_selector_present(), "State selector missing"

    @pytest.mark.regression
    @pytest.mark.home
    def test_board_selector_present(self, driver):
        """TC-HF-005: Board selector exists on home screen."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_board_selector_present(), "Board selector missing"

    @pytest.mark.regression
    @pytest.mark.home
    def test_next_button_present(self, driver):
        """TC-HF-006: Next/Continue button is present."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        assert home.is_next_button_present(), "Next button missing"

    @pytest.mark.regression
    @pytest.mark.home
    def test_scroll_reveals_stats(self, driver):
        """TC-HF-007: Scrolling down reveals stats row."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        home.scroll_down()
        home.scroll_down()
        assert home.is_stats_visible(), "Stats row not visible after scrolling"

    @pytest.mark.regression
    @pytest.mark.home
    def test_state_dropdown_tappable(self, driver):
        """TC-HF-008: State dropdown responds to tap."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        tapped = home.try_tap_state_selector()
        # App should still be alive
        assert home.is_home_loaded(), "App crashed after tapping state selector"

    @pytest.mark.regression
    @pytest.mark.home
    def test_no_crash_on_navigation(self, driver):
        """TC-HF-009: App does not crash during basic navigation."""
        SplashScreen(driver).wait_for_splash_to_finish()
        home = HomeScreen(driver)
        home.scroll_down()
        home.scroll_up()
        home.scroll_down()
        assert home.is_home_loaded(), "App crashed during scroll navigation"
