"""Home Screen Page Object – Appium Android."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class HomeScreen(BasePage):
    """
    Smart Admission Home screen (Android native):
    - App title, tagline
    - State selector, Board selector
    - Next button
    - Stats row, Feature cards
    """

    # React Native elements are rendered with content-desc / text
    # UiAutomator2 uses xpath or accessibility id

    def wait_for_home(self, timeout=30):
        """Wait for home screen to load (after splash animation)."""
        end = time.time() + timeout
        while time.time() < end:
            src = self.get_page_source()
            if any(kw in src for kw in ["Smart", "Admission", "State", "Board"]):
                return True
            time.sleep(1)
        return False

    def is_home_loaded(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in ["Smart", "Admission", "State"])

    def is_title_visible(self) -> bool:
        return "Smart" in self.get_page_source()

    def is_tagline_visible(self) -> bool:
        return "Intelligent" in self.get_page_source() or "Admission" in self.get_page_source()

    def is_state_selector_present(self) -> bool:
        src = self.get_page_source()
        return "state" in src.lower() or "Choose" in src

    def is_board_selector_present(self) -> bool:
        src = self.get_page_source()
        return "board" in src.lower()

    def is_next_button_present(self) -> bool:
        src = self.get_page_source()
        return "Next" in src or "Marks" in src

    def is_stats_visible(self) -> bool:
        src = self.get_page_source()
        return "1000" in src or "Colleges" in src

    def try_tap_state_selector(self) -> bool:
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(@text,'Choose your state') or contains(@content-desc,'state')]"
            )
            if els:
                els[0].click()
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def try_select_state(self, state_name) -> bool:
        try:
            els = self.find_all(By.XPATH, f"//*[contains(@text,'{state_name}')]")
            if els:
                els[0].click()
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def try_tap_board_selector(self) -> bool:
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(@text,'Choose your board') or contains(@content-desc,'board')]"
            )
            if els:
                els[0].click()
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def try_select_board(self, board_name) -> bool:
        try:
            els = self.find_all(By.XPATH, f"//*[contains(@text,'{board_name}')]")
            if els:
                els[0].click()
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def try_tap_next(self) -> bool:
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(@text,'Next') or contains(@text,'Marks')]"
            )
            if els:
                els[0].click()
                time.sleep(2)
                return True
        except Exception:
            pass
        return False
