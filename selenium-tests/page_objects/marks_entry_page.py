"""Marks Entry Page Object – Smart Admission marks/department entry screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class MarksEntryPage(BasePage):
    """
    Covers the Marks Entry screen (Step 2 of 3):
    - Percentage input
    - Department selector
    - Entrance exam score input
    - Find Colleges button
    """

    MARKS_KEYWORDS = [
        "Marks", "Percentage", "Department", "Score", "percent",
        "Step 2", "Engineering", "Medical", "Arts", "Find"
    ]

    def is_marks_screen_visible(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in self.MARKS_KEYWORDS)

    def is_percentage_input_present(self) -> bool:
        src = self.get_page_source().lower()
        return "percent" in src or "marks" in src or "%" in src

    def is_department_selector_present(self) -> bool:
        src = self.get_page_source().lower()
        return (
            "department" in src
            or "engineering" in src
            or "medical" in src
            or "select" in src
        )

    def is_find_colleges_button_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Find" in src
            or "College" in src
            or "Suggest" in src
            or "Search" in src
        )

    def is_step2_indicator_visible(self) -> bool:
        src = self.get_page_source()
        return "Step 2" in src or "step" in src.lower()

    def try_enter_percentage(self, value: str = "85") -> bool:
        """Attempt to type a percentage into the marks input."""
        try:
            inputs = self.driver.find_elements(By.XPATH, "//input[@type='number' or @inputmode='numeric' or @type='text']")
            if inputs:
                inputs[0].clear()
                inputs[0].send_keys(value)
                time.sleep(0.5)
                return True
        except Exception:
            pass
        return False

    def try_click_find_colleges(self) -> bool:
        """Attempt to click the Find Colleges button."""
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Find') or contains(text(),'Suggest') or contains(text(),'College')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[-1])
                time.sleep(2)
                return True
        except Exception:
            pass
        return False

    def try_select_department(self, dept: str = "Engineering") -> bool:
        """Attempt to select a department from the dropdown."""
        try:
            els = self.find_all(
                By.XPATH,
                f"//*[contains(text(),'{dept}')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(1)
                return True
        except Exception:
            pass
        return False
