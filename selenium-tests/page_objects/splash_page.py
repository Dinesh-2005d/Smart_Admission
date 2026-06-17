"""Splash Screen Page Object – Smart Admission animated splash/loading screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SplashPage(BasePage):
    """
    Covers the Animated Splash Screen (initial app entry point):
    - Splash animation visible
    - App logo/branding visible
    - Transition to main app (login or home)
    """

    SPLASH_KEYWORDS = ["Smart", "Admission", "🎓", "Loading", "campus"]

    def load_and_wait(self, splash_wait: int = 4) -> "SplashPage":
        """Navigate to root URL and observe the splash screen."""
        self.driver.get(self.base_url)
        time.sleep(splash_wait)
        return self

    def is_splash_or_app_visible(self) -> bool:
        """Returns True if either the splash or main app is visible."""
        src = self.get_page_source()
        return any(kw in src for kw in self.SPLASH_KEYWORDS) or len(src) > 200

    def is_app_logo_visible(self) -> bool:
        src = self.get_page_source()
        return "Smart" in src or "🎓" in src or "Admission" in src

    def has_transitioned_past_splash(self) -> bool:
        """Returns True if the app has moved past the splash to login or home."""
        src = self.get_page_source()
        return (
            "Sign In" in src or "Login" in src
            or "State" in src or "Board" in src
            or "Search" in src or "Step" in src
        )

    def splash_page_load_time(self) -> float:
        """Returns the time taken (seconds) for the page to complete loading."""
        import time as _time
        start = _time.time()
        self.driver.get(self.base_url)
        self.wait_for_page_load(timeout=30)
        return _time.time() - start

    def get_resource_timing(self) -> dict:
        """Get page performance resource timing from browser."""
        try:
            timing = self.driver.execute_script(
                "const t = performance.timing; "
                "return {"
                "  dns: t.domainLookupEnd - t.domainLookupStart,"
                "  tcp: t.connectEnd - t.connectStart,"
                "  ttfb: t.responseStart - t.requestStart,"
                "  dom_load: t.domContentLoadedEventEnd - t.navigationStart,"
                "  full_load: t.loadEventEnd - t.navigationStart"
                "};"
            )
            return timing or {}
        except Exception:
            return {}

    def get_paint_metrics(self) -> dict:
        """Get First Contentful Paint and other paint timings."""
        try:
            metrics = self.driver.execute_script(
                "const entries = performance.getEntriesByType('paint');"
                "const result = {};"
                "entries.forEach(e => result[e.name] = Math.round(e.startTime));"
                "return result;"
            )
            return metrics or {}
        except Exception:
            return {}
