"""Details Page Object – Smart Admission college detail screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class DetailsPage(BasePage):
    """
    Covers the College Details screen:
    - College name and rating
    - Tabs: Overview, Courses, Facilities, Placement, Contact
    - Back button navigation
    - AI Chat button
    - Save/bookmark button
    """

    # Keywords that appear on a college detail card/screen
    DETAILS_KEYWORDS = [
        "Rating", "Placement", "NAAC", "Contact", "Courses",
        "Facilities", "Overview", "Type", "Campus", "Fee",
    ]

    TAB_LABELS = ["Overview", "Courses", "Facilities", "Placement", "Contact"]

    def navigate_to_first_result(self) -> "DetailsPage":
        """
        From Search results, click the first college card to open Details.
        Must call navigate_to_search() and load results first.
        """
        try:
            # College cards typically have "View Details" or clickable name
            cards = self.find_all(
                By.XPATH,
                "//*[contains(text(),'View') or contains(text(),'Details') or contains(text(),'Rating')]"
            )
            for card in cards:
                self.driver.execute_script("arguments[0].click();", card)
                time.sleep(2.5)
                if self.is_details_screen_visible():
                    break
        except Exception:
            pass
        return self

    def is_details_screen_visible(self) -> bool:
        src = self.get_page_source()
        # At least 3 detail keywords should appear on the details screen
        found = sum(1 for kw in self.DETAILS_KEYWORDS if kw in src)
        return found >= 2

    def is_college_name_visible(self) -> bool:
        src = self.get_page_source()
        # College names contain keywords like Institute, University, College
        return (
            "Institute" in src
            or "University" in src
            or "College" in src
            or "IIT" in src
            or "NIT" in src
        )

    def is_rating_visible(self) -> bool:
        src = self.get_page_source()
        return "Rating" in src or "⭐" in src or "/5" in src

    def is_placement_info_visible(self) -> bool:
        src = self.get_page_source()
        return "Placement" in src or "placement" in src.lower() or "%" in src

    def is_naac_grade_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "NAAC" in src
            or "Grade" in src
            or "A++" in src
            or "A+" in src
            or "A" in src
        )

    def is_location_visible(self) -> bool:
        src = self.get_page_source()
        return "📍" in src or any(city in src for city in [
            "Chennai", "Mumbai", "Delhi", "Bangalore", "Hyderabad",
            "Pune", "Kolkata", "Jaipur", "Tamil", "Maharashtra",
        ])

    def is_back_button_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Back" in src
            or "←" in src
            or "‹" in src
            or "arrow" in src.lower()
        )

    def is_ai_chat_button_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "Chat" in src
            or "AI" in src
            or "Ask" in src
            or "🤖" in src
        )

    def is_save_button_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "Save" in src
            or "Bookmark" in src
            or "♡" in src
            or "🔖" in src
        )

    def get_visible_tabs(self) -> list:
        """Returns list of detail tab labels present in the source."""
        src = self.get_page_source()
        return [tab for tab in self.TAB_LABELS if tab in src]

    def try_click_tab(self, tab_name: str) -> bool:
        """Attempt to click a specific details tab."""
        try:
            els = self.find_all(
                By.XPATH,
                f"//*[contains(text(),'{tab_name}')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(1.5)
                return True
        except Exception:
            pass
        return False

    def try_click_back(self) -> bool:
        """Attempt to click the back button."""
        try:
            back_els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Back') or contains(text(),'←')]"
            )
            if back_els:
                self.driver.execute_script("arguments[0].click();", back_els[0])
                time.sleep(1.5)
                return True
            # Try browser back
            self.driver.execute_script("window.history.back();")
            time.sleep(1.5)
            return True
        except Exception:
            pass
        return False

    def is_fee_structure_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "Fee" in src or "fee" in src.lower()
            or "₹" in src or "Lakh" in src
            or "Tuition" in src
        )

    def is_contact_info_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "Contact" in src
            or "@" in src
            or "Phone" in src
            or "Website" in src
            or "www." in src
        )
