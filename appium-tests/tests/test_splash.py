"""
test_splash.py – Splash screen tests for Android
"""

import pytest
from page_objects.splash_screen import SplashScreen


class TestSplashScreen:
    """Verifies the animated splash screen behavior."""

    @pytest.mark.smoke
    @pytest.mark.splash
    def test_app_launches(self, driver):
        """TC-SP-001: App launches without crash."""
        splash = SplashScreen(driver)
        assert splash.is_splash_visible(), "App did not launch — no content visible"

    @pytest.mark.smoke
    @pytest.mark.splash
    def test_splash_completes(self, driver):
        """TC-SP-002: Splash animation completes and home screen appears."""
        splash = SplashScreen(driver)
        finished = splash.wait_for_splash_to_finish(timeout=15)
        assert finished, "Splash did not complete within 15 seconds"

    @pytest.mark.regression
    @pytest.mark.splash
    def test_splash_shows_branding(self, driver):
        """TC-SP-003: Splash screen shows app branding text."""
        splash = SplashScreen(driver)
        src = driver.page_source
        has_branding = "Smart" in src or "Admission" in src or "SmartCampus" in src
        assert has_branding, "No branding visible during splash"

    @pytest.mark.regression
    @pytest.mark.splash
    def test_post_splash_home_visible(self, driver):
        """TC-SP-004: After splash, home screen UI elements appear."""
        splash = SplashScreen(driver)
        splash.wait_for_splash_to_finish(timeout=15)
        assert splash.is_splash_finished(), (
            "Home screen elements not found after splash"
        )
