"""Base Page Object for Appium (Android)."""

import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    """Common helpers for all Appium page objects."""

    TIMEOUT = 20

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, self.TIMEOUT)

    def find(self, by, value, timeout=None):
        t = timeout or self.TIMEOUT
        try:
            return WebDriverWait(self.driver, t).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            raise TimeoutException(f"Element not found: [{by}] '{value}' ({t}s)")

    def find_visible(self, by, value, timeout=None):
        t = timeout or self.TIMEOUT
        return WebDriverWait(self.driver, t).until(
            EC.visibility_of_element_located((by, value))
        )

    def find_all(self, by, value):
        return self.driver.find_elements(by, value)

    def click(self, by, value, timeout=None):
        el = self.find_visible(by, value, timeout)
        el.click()
        return el

    def type_text(self, by, value, text, clear_first=True):
        el = self.find_visible(by, value)
        if clear_first:
            el.clear()
        el.send_keys(text)
        return el

    def get_text(self, by, value) -> str:
        try:
            return self.find(by, value, timeout=5).text.strip()
        except Exception:
            return ""

    def is_visible(self, by, value, timeout=5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_present(self, by, value, timeout=5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def wait_for_text_present(self, text, timeout=15):
        """Wait until text appears in the page source."""
        end = time.time() + timeout
        while time.time() < end:
            if text in self.driver.page_source:
                return True
            time.sleep(0.5)
        return False

    def scroll_down(self):
        """Scroll down on mobile screen."""
        size = self.driver.get_window_size()
        start_y = int(size["height"] * 0.7)
        end_y = int(size["height"] * 0.3)
        start_x = int(size["width"] * 0.5)
        self.driver.swipe(start_x, start_y, start_x, end_y, 800)
        time.sleep(0.5)

    def scroll_up(self):
        size = self.driver.get_window_size()
        start_y = int(size["height"] * 0.3)
        end_y = int(size["height"] * 0.7)
        start_x = int(size["width"] * 0.5)
        self.driver.swipe(start_x, start_y, start_x, end_y, 800)
        time.sleep(0.5)

    def screenshot(self, name, directory="../Test Results/Screenshots"):
        os.makedirs(directory, exist_ok=True)
        ts = time.strftime("%Y%m%d_%H%M%S")
        safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)
        path = os.path.join(directory, f"{safe}_{ts}.png")
        self.driver.save_screenshot(path)
        return path

    def tap_coordinates(self, x, y):
        from appium.webdriver.common.touch_action import TouchAction
        TouchAction(self.driver).tap(x=x, y=y).perform()

    def go_back(self):
        self.driver.back()
        time.sleep(1)

    def get_page_source(self):
        return self.driver.page_source
