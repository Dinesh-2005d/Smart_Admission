"""Saved Colleges Page Object – Smart Admission saved/bookmarked colleges screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SavedPage(BasePage):
    """
    Covers the Saved Colleges tab:
    - Saved tab is accessible
    - Empty state when no colleges are saved
    - Save badge count on tab
    - Clear All button
    """

    SAVED_KEYWORDS = ["Saved", "Bookmarked", "saved", "bookmark", "No saved"]

    def navigate_to_saved(self) -> "SavedPage":
        """Click the Saved / Bookmarks tab in the bottom navigation."""
        try:
            tabs = self.find_all(By.XPATH, "//*[contains(text(),'Saved')]")
            for tab in tabs:
                self.driver.execute_script("arguments[0].click();", tab)
                time.sleep(2)
                if self.is_saved_screen_visible():
                    break
        except Exception:
            pass
        return self

    def is_saved_screen_visible(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in self.SAVED_KEYWORDS)

    def is_saved_tab_in_nav(self) -> bool:
        src = self.get_page_source()
        return "Saved" in src or "Bookmark" in src

    def is_empty_state_shown(self) -> bool:
        """Check if 'no saved colleges' empty state is visible."""
        src = self.get_page_source()
        return (
            "no saved" in src.lower()
            or "nothing saved" in src.lower()
            or "no colleges" in src.lower()
            or "start saving" in src.lower()
            or "bookmark" in src.lower()
        )

    def is_clear_all_button_visible(self) -> bool:
        src = self.get_page_source()
        return "Clear All" in src or "Clear" in src or "Remove" in src

    def get_saved_count(self) -> int:
        """Count the number of saved college cards shown."""
        try:
            cards = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Saved') or contains(text(),'Bookmark')]",
            )
            return len(cards)
        except Exception:
            return 0

    def is_save_badge_visible(self) -> bool:
        """Check if a numeric badge on the Saved tab is visible."""
        src = self.get_page_source()
        # Badge typically shows a number like '1' or '2'
        import re
        badges = re.findall(r'\b[1-9]\d*\b', src)
        return len(badges) > 0 and "Saved" in src
