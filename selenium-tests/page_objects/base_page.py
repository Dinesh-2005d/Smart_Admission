"""Base Page Object – common helpers for all pages."""

import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    TIMEOUT = 20

    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/") + "/"
        self.wait = WebDriverWait(driver, self.TIMEOUT)

    # ── Navigation ────────────────────────────────────────────────────────────
    def open(self, path: str = ""):
        url = self.base_url + path.lstrip("/")
        self.driver.get(url)
        time.sleep(2)  # Allow React hydration
        return self

    def get_title(self) -> str:
        return self.driver.title

    def get_current_url(self) -> str:
        return self.driver.current_url

    # ── Element helpers ───────────────────────────────────────────────────────
    def find(self, by, value, timeout=None):
        t = timeout or self.TIMEOUT
        try:
            return WebDriverWait(self.driver, t).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            raise TimeoutException(
                f"Element not found: [{by}] '{value}' within {t}s"
            )

    def find_visible(self, by, value, timeout=None):
        t = timeout or self.TIMEOUT
        return WebDriverWait(self.driver, t).until(
            EC.visibility_of_element_located((by, value))
        )

    def find_all(self, by, value):
        return self.driver.find_elements(by, value)

    def click(self, by, value, timeout=None):
        el = self.find_visible(by, value, timeout)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", el)
        time.sleep(0.3)
        el.click()
        return el

    def type_text(self, by, value, text: str, clear_first=True):
        el = self.find_visible(by, value)
        if clear_first:
            el.clear()
        el.send_keys(text)
        return el

    def get_text(self, by, value) -> str:
        try:
            el = self.find(by, value, timeout=5)
            return el.text.strip()
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

    def wait_for_text(self, by, value, text: str, timeout=None):
        t = timeout or self.TIMEOUT
        return WebDriverWait(self.driver, t).until(
            EC.text_to_be_present_in_element((by, value), text)
        )

    def scroll_to_bottom(self):
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.5)

    def scroll_to_top(self):
        self.driver.execute_script("window.scrollTo(0, 0);")

    def get_page_source(self) -> str:
        return self.driver.page_source

    def screenshot(self, name: str, directory: str = "../Test Results/Screenshots"):
        os.makedirs(directory, exist_ok=True)
        ts = time.strftime("%Y%m%d_%H%M%S")
        path = os.path.join(directory, f"{name}_{ts}.png")
        self.driver.save_screenshot(path)
        return path

    def wait_for_page_load(self, timeout=30):
        WebDriverWait(self.driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

    def js_click(self, by, value):
        """JavaScript click – useful for elements that are scroll-hidden."""
        el = self.find(by, value)
        self.driver.execute_script("arguments[0].click();", el)

    # ── Assertions helpers ────────────────────────────────────────────────────
    def assert_title_contains(self, expected: str):
        title = self.get_title()
        assert expected.lower() in title.lower(), (
            f"Expected title to contain '{expected}', got '{title}'"
        )

    def assert_url_contains(self, expected: str):
        url = self.get_current_url()
        assert expected in url, f"Expected URL to contain '{expected}', got '{url}'"

    def assert_element_visible(self, by, value, msg=""):
        assert self.is_visible(by, value), (
            msg or f"Element [{by}]'{value}' should be visible"
        )

    def assert_text_present(self, text: str):
        src = self.get_page_source()
        assert text.lower() in src.lower(), (
            f"Expected text '{text}' not found in page source"
        )
