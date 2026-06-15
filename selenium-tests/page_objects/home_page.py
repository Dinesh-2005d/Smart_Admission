"""Home Page Object – Smart Admission landing page."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class HomePage(BasePage):
    """
    Covers the main landing screen:
    - App title / tagline
    - State selector dropdown
    - Board selector dropdown
    - Next button
    - Stats row (1000+ Colleges etc.)
    - Feature cards
    """

    # ── Locators (React Native Web renders as divs/spans) ─────────────────────
    # React Native Web renders Text as <div> with role="none" or plain text nodes.
    # We rely on text content and ARIA roles where possible.
    APP_TITLE_TEXT    = "Smart"
    TAGLINE_TEXT      = "Intelligent College Admission"
    STATE_DROPDOWN    = (By.XPATH, "//*[contains(text(),'Choose your state') or contains(text(),'State')]")
    BOARD_DROPDOWN    = (By.XPATH, "//*[contains(text(),'Choose your board') or contains(text(),'Board')]")
    NEXT_BUTTON       = (By.XPATH, "//*[contains(text(),'Next') or contains(text(),'Enter Your Marks')]")
    STATS_COLLEGES    = (By.XPATH, "//*[contains(text(),'1000+') or contains(text(),'Colleges')]")
    FEATURE_AI        = (By.XPATH, "//*[contains(text(),'AI Powered')]")
    FEATURE_PLACEMENT = (By.XPATH, "//*[contains(text(),'Placement')]")
    HERO_BADGE_INDIA  = (By.XPATH, "//*[contains(text(),'India')]")
    STEP_LABEL        = (By.XPATH, "//*[contains(text(),'Step 1')]")

    def load(self):
        """Navigate to the app root and wait for hydration."""
        self.open("")
        time.sleep(4)  # React Native Web splash + hydration
        return self

    def is_loaded(self) -> bool:
        """Returns True if the home page content is visible."""
        src = self.get_page_source()
        return any(
            kw in src
            for kw in ["Smart Admission", "SmartCampusAI", "College", "State"]
        )

    def get_page_title(self) -> str:
        return self.driver.title

    def is_app_title_visible(self) -> bool:
        return self.APP_TITLE_TEXT in self.get_page_source()

    def is_tagline_visible(self) -> bool:
        return self.TAGLINE_TEXT in self.get_page_source()

    def is_state_selector_present(self) -> bool:
        src = self.get_page_source()
        return "state" in src.lower() or "Choose your state" in src

    def is_board_selector_present(self) -> bool:
        src = self.get_page_source()
        return "board" in src.lower() or "Choose your board" in src

    def is_next_button_present(self) -> bool:
        return (
            "Next" in self.get_page_source()
            or "Marks" in self.get_page_source()
        )

    def is_stats_row_present(self) -> bool:
        src = self.get_page_source()
        return "1000" in src or "Colleges" in src

    def is_features_section_present(self) -> bool:
        src = self.get_page_source()
        return "AI Powered" in src or "Placement" in src

    def is_india_badge_present(self) -> bool:
        return "India" in self.get_page_source()

    def is_free_badge_present(self) -> bool:
        return "Free" in self.get_page_source()

    def is_step_indicator_present(self) -> bool:
        return "Step 1" in self.get_page_source()

    def try_click_state_dropdown(self) -> bool:
        """Attempt to click the state dropdown. Returns True if successful."""
        try:
            els = self.find_all(By.XPATH, "//*[contains(text(),'Choose your state')]")
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def try_click_next_button(self) -> bool:
        """Attempt to click the Next button. Returns True if successful."""
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Next') or contains(text(),'Enter Your Marks')]",
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(1)
                return True
        except Exception:
            pass
        return False

    def scroll_down(self):
        self.scroll_to_bottom()
        return self
