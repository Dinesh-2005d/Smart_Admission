"""Search Page Object – Smart Admission college search screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SearchPage(BasePage):
    """
    Covers the Search tab:
    - Search input box
    - Popular search tags
    - Search suggestions
    - Result cards
    - Load more button
    """

    SEARCH_HEADER_TEXT  = "Search Colleges"
    POPULAR_TAG_TEXTS   = ["Engineering", "Medical", "Management", "Government"]
    RESULT_CARD_KEYWORD = "college"  # appears in results

    def navigate_to_search(self) -> "SearchPage":
        """Click the Search tab in the bottom navigation."""
        try:
            tabs = self.find_all(By.XPATH, "//*[contains(text(),'Search')]")
            for tab in tabs:
                self.driver.execute_script("arguments[0].click();", tab)
                time.sleep(1.5)
                if "Search" in self.get_page_source():
                    break
        except Exception:
            pass
        return self

    def is_search_screen_visible(self) -> bool:
        return "Search" in self.get_page_source()

    def is_search_input_present(self) -> bool:
        src = self.get_page_source()
        return "Engineering" in src or "e.g." in src or "search" in src.lower()

    def is_popular_tags_visible(self) -> bool:
        src = self.get_page_source()
        return any(tag in src for tag in self.POPULAR_TAG_TEXTS)

    def is_suggestions_visible(self) -> bool:
        src = self.get_page_source()
        return "Engineering colleges" in src or "Medical colleges" in src

    def get_visible_tags(self) -> list:
        src = self.get_page_source()
        return [tag for tag in self.POPULAR_TAG_TEXTS if tag in src]

    def type_search_query(self, query: str) -> "SearchPage":
        """Type into the search input field (best-effort via JS)."""
        try:
            inputs = self.driver.find_elements(By.XPATH, "//input")
            if inputs:
                inputs[0].clear()
                inputs[0].send_keys(query)
                time.sleep(1.5)
            else:
                # Fallback – React Native Web might render as contenteditable
                editable = self.driver.find_elements(
                    By.XPATH, "//*[@contenteditable='true']"
                )
                if editable:
                    editable[0].clear()
                    editable[0].send_keys(query)
                    time.sleep(1.5)
        except Exception:
            pass
        return self

    def are_results_visible(self) -> bool:
        src = self.get_page_source()
        return "Found" in src or "colleges" in src.lower() or "NIT" in src or "IIT" in src

    def get_result_count_text(self) -> str:
        src = self.get_page_source()
        if "Found" in src:
            idx = src.index("Found")
            return src[idx : idx + 40].strip()
        return ""

    def is_no_results_message_visible(self) -> bool:
        src = self.get_page_source()
        return "No colleges found" in src or "😕" in src

    def click_popular_tag(self, tag: str) -> "SearchPage":
        try:
            els = self.find_all(By.XPATH, f"//*[contains(text(),'{tag}')]")
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(2)
        except Exception:
            pass
        return self

    def is_load_more_visible(self) -> bool:
        return "Show Next" in self.get_page_source() or "Load More" in self.get_page_source()

    def clear_search(self) -> "SearchPage":
        try:
            inputs = self.driver.find_elements(By.XPATH, "//input")
            if inputs:
                inputs[0].clear()
                time.sleep(1)
        except Exception:
            pass
        return self
