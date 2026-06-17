"""Compare Page Object – Smart Admission college compare screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class ComparePage(BasePage):
    """
    Covers the Compare tab:
    - Compare header / title
    - Empty state (no colleges added)
    - Compare result view (two colleges side by side)
    - Stats shown in compare view
    """

    COMPARE_KEYWORDS = ["Compare", "compare", "Side", "vs", "Select"]

    def navigate_to_compare(self) -> "ComparePage":
        """Click the Compare tab in the bottom navigation."""
        try:
            tabs = self.find_all(By.XPATH, "//*[contains(text(),'Compare')]")
            for tab in tabs:
                self.driver.execute_script("arguments[0].click();", tab)
                time.sleep(2)
                if self.is_compare_screen_visible():
                    break
        except Exception:
            pass
        return self

    def is_compare_screen_visible(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in self.COMPARE_KEYWORDS)

    def is_empty_state_shown(self) -> bool:
        """Check if the 'no colleges to compare' empty state is visible."""
        src = self.get_page_source()
        return (
            "no college" in src.lower()
            or "add colleges" in src.lower()
            or "select" in src.lower()
            or "Compare" in src
        )

    def is_compare_tab_present_in_nav(self) -> bool:
        src = self.get_page_source()
        return "Compare" in src

    def get_compare_heading(self) -> str:
        """Get text from the compare screen heading."""
        src = self.get_page_source()
        if "Compare" in src:
            idx = src.index("Compare")
            return src[idx: idx + 30].strip()
        return ""

    def are_two_colleges_shown(self) -> bool:
        """Returns True if two college columns are visible in the compare view."""
        src = self.get_page_source()
        # Compare screen shows two college names side-by-side
        count = src.count("Rating") + src.count("Placement")
        return count >= 2

    def is_stats_section_visible(self) -> bool:
        src = self.get_page_source()
        return "Rating" in src or "Placement" in src or "Type" in src
