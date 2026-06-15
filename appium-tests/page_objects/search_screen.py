"""Search Screen Page Object – Appium Android."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SearchScreen(BasePage):
    """
    Search tab on the Android app.
    """

    def navigate_to_search(self):
        """Tap Search in the bottom navigation."""
        try:
            els = self.find_all(By.XPATH, "//*[contains(@text,'Search')]")
            for el in els:
                el.click()
                time.sleep(1.5)
                if "Search" in self.get_page_source():
                    break
        except Exception:
            pass
        return self

    def is_search_visible(self) -> bool:
        return "Search" in self.get_page_source()

    def is_popular_tags_visible(self) -> bool:
        src = self.get_page_source()
        return "Engineering" in src or "Medical" in src

    def type_query(self, text):
        try:
            inputs = self.find_all(By.CLASS_NAME, "android.widget.EditText")
            if inputs:
                inputs[0].clear()
                inputs[0].send_keys(text)
                time.sleep(2)
        except Exception:
            pass
        return self

    def has_results(self) -> bool:
        src = self.get_page_source()
        return "Found" in src or "IIT" in src or "NIT" in src

    def has_no_results(self) -> bool:
        return "No colleges" in self.get_page_source()
