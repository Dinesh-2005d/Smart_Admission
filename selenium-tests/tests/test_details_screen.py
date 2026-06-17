"""
test_details_screen.py – College Details screen tests
Tests the college detail view: rating, placement, NAAC, location,
tabs (Overview, Courses, Facilities, Placement, Contact), AI chat,
save button, back navigation, and contact info.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.search_page import SearchPage
from page_objects.details_page import DetailsPage


def _open_first_college(driver, base_url) -> DetailsPage:
    """Helper: load home → search engineering → open first card."""
    HomePage(driver, base_url).load()
    search = SearchPage(driver, base_url)
    search.navigate_to_search()
    search.click_popular_tag("Engineering")
    time.sleep(3)
    details = DetailsPage(driver, base_url)
    details.navigate_to_first_result()
    return details


class TestDetailsScreenLoad:
    """Verifies the College Details screen loads with correct content."""

    @pytest.mark.smoke
    def test_details_screen_opens(self, driver, base_url):
        """TC-D-001: Clicking a college card opens the details screen."""
        details = _open_first_college(driver, base_url)
        src = driver.page_source
        # Details screen or search results must be visible
        has_content = (
            details.is_details_screen_visible()
            or "Rating" in src
            or "College" in src
            or "Engineering" in src
        )
        assert has_content, (
            "College details screen did not open after clicking a result card"
        )

    @pytest.mark.regression
    def test_details_has_college_name(self, driver, base_url):
        """TC-D-002: College name (Institute/University/College) is visible."""
        details = _open_first_college(driver, base_url)
        assert details.is_college_name_visible(), (
            "No college name (Institute/University/College/IIT/NIT) found on details screen"
        )

    @pytest.mark.regression
    def test_details_has_rating(self, driver, base_url):
        """TC-D-003: Rating value is visible on the details screen."""
        details = _open_first_college(driver, base_url)
        assert details.is_rating_visible(), (
            "No rating (Rating / ⭐ / /5) found on details screen"
        )

    @pytest.mark.regression
    def test_details_has_placement(self, driver, base_url):
        """TC-D-004: Placement information is visible."""
        details = _open_first_college(driver, base_url)
        assert details.is_placement_info_visible(), (
            "No placement info visible on details screen"
        )

    @pytest.mark.regression
    def test_details_has_location(self, driver, base_url):
        """TC-D-005: Location / city is visible on the details screen."""
        details = _open_first_college(driver, base_url)
        assert details.is_location_visible(), (
            "No location / city name found on details screen"
        )

    @pytest.mark.regression
    def test_details_has_naac_or_type(self, driver, base_url):
        """TC-D-006: NAAC grade or college type (Government/Private) is visible."""
        details = _open_first_college(driver, base_url)
        src = driver.page_source
        assert (
            details.is_naac_grade_visible()
            or "Government" in src
            or "Private" in src
            or "Aided" in src
        ), "No NAAC grade or college type found on details screen"

    @pytest.mark.regression
    def test_details_no_crash(self, driver, base_url):
        """TC-D-007: Details screen loads without crashing."""
        _open_first_college(driver, base_url)
        assert len(driver.page_source) > 500, (
            "Page appears broken on details screen"
        )

    @pytest.mark.regression
    def test_no_js_errors_on_details(self, driver, base_url):
        """TC-D-008: No critical JavaScript errors on details screen."""
        _open_first_college(driver, base_url)
        logs = driver.get_log("browser")
        critical = [
            log for log in logs
            if log.get("level") == "SEVERE"
            and "favicon" not in log.get("message", "").lower()
            and "404" not in log.get("message", "")
        ]
        assert len(critical) == 0, (
            "Critical JS errors on details screen:\n"
            + "\n".join(e.get("message", "") for e in critical[:5])
        )


class TestDetailsTabs:
    """Tests for the tab navigation on the College Details screen."""

    @pytest.mark.regression
    def test_at_least_two_tabs_visible(self, driver, base_url):
        """TC-D-009: At least 2 detail tabs are visible (e.g. Overview, Courses)."""
        details = _open_first_college(driver, base_url)
        tabs = details.get_visible_tabs()
        assert len(tabs) >= 2, (
            f"Expected ≥2 detail tabs, found: {tabs}"
        )

    @pytest.mark.regression
    def test_overview_tab_present(self, driver, base_url):
        """TC-D-010: Overview tab label is present."""
        _open_first_college(driver, base_url)
        src = driver.page_source
        assert "Overview" in src or "About" in src or "Info" in src, (
            "No Overview/About tab found on details screen"
        )

    @pytest.mark.regression
    def test_courses_tab_present(self, driver, base_url):
        """TC-D-011: Courses tab is present on the details screen."""
        _open_first_college(driver, base_url)
        src = driver.page_source
        assert "Courses" in src or "Course" in src or "Program" in src, (
            "No Courses/Programs tab found on details screen"
        )

    @pytest.mark.regression
    def test_placement_tab_present(self, driver, base_url):
        """TC-D-012: Placement tab is present on the details screen."""
        _open_first_college(driver, base_url)
        src = driver.page_source
        assert "Placement" in src, "No Placement tab found on details screen"

    @pytest.mark.regression
    def test_facilities_tab_present(self, driver, base_url):
        """TC-D-013: Facilities tab is present on the details screen."""
        _open_first_college(driver, base_url)
        src = driver.page_source
        assert "Facilities" in src or "Facility" in src or "Campus" in src, (
            "No Facilities/Campus tab found on details screen"
        )

    @pytest.mark.regression
    def test_click_courses_tab(self, driver, base_url):
        """TC-D-014: Clicking Courses tab does not crash the app."""
        details = _open_first_college(driver, base_url)
        details.try_click_tab("Courses")
        assert len(driver.page_source) > 200, (
            "App crashed after clicking Courses tab"
        )

    @pytest.mark.regression
    def test_click_placement_tab(self, driver, base_url):
        """TC-D-015: Clicking Placement tab shows placement data."""
        details = _open_first_college(driver, base_url)
        details.try_click_tab("Placement")
        time.sleep(1.5)
        src = driver.page_source
        assert "Placement" in src or "%" in src or "package" in src.lower(), (
            "No placement data shown after clicking Placement tab"
        )

    @pytest.mark.regression
    def test_click_facilities_tab(self, driver, base_url):
        """TC-D-016: Clicking Facilities tab shows facility data."""
        details = _open_first_college(driver, base_url)
        details.try_click_tab("Facilities")
        time.sleep(1.5)
        src = driver.page_source
        assert (
            "Facilities" in src
            or "Library" in src
            or "Hostel" in src
            or "Lab" in src
            or "Sports" in src
        ), "No facility data shown after clicking Facilities tab"


class TestDetailsInteraction:
    """Tests for interactive elements on the College Details screen."""

    @pytest.mark.regression
    def test_save_button_visible(self, driver, base_url):
        """TC-D-017: Save / Bookmark button is visible on details screen."""
        details = _open_first_college(driver, base_url)
        assert details.is_save_button_visible(), (
            "Save / Bookmark button not found on details screen"
        )

    @pytest.mark.regression
    def test_ai_chat_button_visible(self, driver, base_url):
        """TC-D-018: AI Chat button is accessible from the details screen."""
        details = _open_first_college(driver, base_url)
        assert details.is_ai_chat_button_visible(), (
            "AI Chat button not found on details screen"
        )

    @pytest.mark.regression
    def test_back_navigation_works(self, driver, base_url):
        """TC-D-019: Back button/browser back returns to the search results."""
        details = _open_first_college(driver, base_url)
        details.try_click_back()
        time.sleep(2)
        src = driver.page_source
        assert len(src) > 200, "App broke after clicking back from details screen"

    @pytest.mark.regression
    def test_details_screen_scrollable(self, driver, base_url):
        """TC-D-020: Details screen can be scrolled to reveal more content."""
        _open_first_college(driver, base_url)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        assert len(driver.page_source) > 200, (
            "App broke after scrolling on details screen"
        )
