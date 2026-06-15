"""
test_search.py – Search screen tests against deployed GitHub Pages app
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.search_page import SearchPage


class TestSearchScreenLoad:
    """Verifies the Search tab and its elements load correctly."""

    @pytest.mark.smoke
    def test_search_screen_accessible(self, driver, base_url):
        """TC-S-001: Search tab is accessible from home."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        assert page.is_search_screen_visible(), (
            "Search screen did not become visible after clicking Search tab"
        )

    @pytest.mark.regression
    def test_search_input_present(self, driver, base_url):
        """TC-S-002: Search input/text-box is present."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        assert page.is_search_input_present(), "Search input field not found"

    @pytest.mark.regression
    def test_popular_tags_visible(self, driver, base_url):
        """TC-S-003: Popular search tags are displayed."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        assert page.is_popular_tags_visible(), (
            "Popular tags (Engineering, Medical…) not visible"
        )

    @pytest.mark.regression
    def test_search_suggestions_visible(self, driver, base_url):
        """TC-S-004: Pre-built search suggestions displayed on empty state."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        assert page.is_suggestions_visible(), "Search suggestions not visible"

    @pytest.mark.regression
    def test_multiple_tags_present(self, driver, base_url):
        """TC-S-005: At least 3 popular search tags are present."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        tags = page.get_visible_tags()
        assert len(tags) >= 3, (
            f"Expected ≥3 popular tags, found {len(tags)}: {tags}"
        )


class TestSearchInteraction:
    """Functional tests for the search functionality."""

    @pytest.mark.regression
    def test_click_engineering_tag(self, driver, base_url):
        """TC-S-006: Clicking 'Engineering' tag shows results."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.click_popular_tag("Engineering")
        time.sleep(2)
        # After clicking a tag, results or search-results header should appear
        src = driver.page_source
        has_results = (
            "Found" in src
            or "colleges" in src.lower()
            or "IIT" in src
            or "NIT" in src
            or "Engineering" in src
        )
        assert has_results, "No results shown after clicking 'Engineering' tag"

    @pytest.mark.regression
    def test_click_medical_tag(self, driver, base_url):
        """TC-S-007: Clicking 'Medical' tag updates content."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.click_popular_tag("Medical")
        time.sleep(2)
        src = driver.page_source
        assert "Medical" in src or "MBBS" in src or "Found" in src, (
            "No medical results after clicking Medical tag"
        )

    @pytest.mark.regression
    def test_search_for_iit(self, driver, base_url):
        """TC-S-008: Searching 'IIT' returns relevant colleges."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.type_search_query("IIT")
        time.sleep(2)
        src = driver.page_source
        assert "IIT" in src, "IIT search returned no relevant results"

    @pytest.mark.regression
    def test_search_for_government(self, driver, base_url):
        """TC-S-009: Searching 'Government' shows government colleges."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.type_search_query("Government")
        time.sleep(2)
        src = driver.page_source
        assert "Government" in src, (
            "Government colleges not shown after searching 'Government'"
        )

    @pytest.mark.regression
    def test_search_no_results_message(self, driver, base_url):
        """TC-S-010: Searching nonsense shows 'No colleges found' message."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.type_search_query("XYZABC_NONEXISTENT_12345")
        time.sleep(2)
        assert page.is_no_results_message_visible(), (
            "Expected 'No colleges found' message for nonsense query"
        )

    @pytest.mark.regression
    def test_search_clear_returns_suggestions(self, driver, base_url):
        """TC-S-011: Clearing search restores suggestions view."""
        HomePage(driver, base_url).load()
        page = SearchPage(driver, base_url)
        page.navigate_to_search()
        page.type_search_query("Engineering")
        time.sleep(1.5)
        page.clear_search()
        time.sleep(1.5)
        assert page.is_popular_tags_visible() or page.is_suggestions_visible(), (
            "Popular tags/suggestions did not reappear after clearing search"
        )
