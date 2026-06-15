"""Splash Screen Page Object – Appium Android."""

import time
from .base_page import BasePage


class SplashScreen(BasePage):
    """Animated splash screen that plays on app launch."""

    def wait_for_splash_to_finish(self, timeout=15):
        """Wait for the splash animation to complete and home to appear."""
        end = time.time() + timeout
        while time.time() < end:
            src = self.get_page_source()
            # Splash done when home screen elements appear
            if any(kw in src for kw in ["State", "Board", "Step 1", "Choose"]):
                return True
            time.sleep(1)
        return False

    def is_splash_visible(self) -> bool:
        """Check if splash/loading content is still showing."""
        src = self.get_page_source()
        return "Smart" in src or "Admission" in src

    def is_splash_finished(self) -> bool:
        src = self.get_page_source()
        return "State" in src or "Choose" in src or "Board" in src
