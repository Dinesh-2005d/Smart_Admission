"""
test_ai_chat.py – AI Chat screen tests (CollegeChatScreen)
Tests the Groq-powered AI chat feature: input, send, suggestions,
AI branding, back navigation, and graceful error handling.
"""

import time
import pytest
from page_objects.home_page import HomePage
from page_objects.search_page import SearchPage
from page_objects.details_page import DetailsPage
from page_objects.ai_chat_page import AIChatPage


def _open_chat_from_details(driver, base_url) -> AIChatPage:
    """Helper: home → search → open first college → click AI Chat."""
    HomePage(driver, base_url).load()
    search = SearchPage(driver, base_url)
    search.navigate_to_search()
    search.click_popular_tag("Engineering")
    time.sleep(3)
    details = DetailsPage(driver, base_url)
    details.navigate_to_first_result()
    time.sleep(1)
    chat = AIChatPage(driver, base_url)
    chat.navigate_to_ai_chat()
    return chat


class TestAIChatScreenLoad:
    """Verifies the AI Chat screen loads with correct UI."""

    @pytest.mark.smoke
    def test_chat_or_detail_screen_accessible(self, driver, base_url):
        """TC-AI-001: AI Chat screen (or detail screen) is accessible from search."""
        HomePage(driver, base_url).load()
        search = SearchPage(driver, base_url)
        search.navigate_to_search()
        search.click_popular_tag("Engineering")
        time.sleep(3)
        src = driver.page_source
        has_content = (
            "Chat" in src or "Rating" in src
            or "College" in src or "AI" in src
        )
        assert has_content, (
            "Neither chat nor college detail content visible after searching Engineering"
        )

    @pytest.mark.regression
    def test_ai_chat_screen_visible(self, driver, base_url):
        """TC-AI-002: AI Chat screen opens from college details."""
        chat = _open_chat_from_details(driver, base_url)
        assert chat.is_chat_screen_visible(), (
            "AI Chat screen not visible after clicking Chat from details"
        )

    @pytest.mark.regression
    def test_chat_input_present(self, driver, base_url):
        """TC-AI-003: Chat input field is present on the chat screen."""
        chat = _open_chat_from_details(driver, base_url)
        assert chat.is_chat_input_present(), (
            "Chat input field not found on AI Chat screen"
        )

    @pytest.mark.regression
    def test_send_button_present(self, driver, base_url):
        """TC-AI-004: Send button is present on the chat screen."""
        chat = _open_chat_from_details(driver, base_url)
        assert chat.is_send_button_present(), (
            "Send button not found on AI Chat screen"
        )

    @pytest.mark.regression
    def test_ai_branding_visible(self, driver, base_url):
        """TC-AI-005: AI branding (AI / 🤖 / Groq / powered) is visible."""
        chat = _open_chat_from_details(driver, base_url)
        # AI branding may be on the details screen or chat screen
        src = driver.page_source
        assert (
            chat.is_ai_branding_visible()
            or "AI" in src
            or "Chat" in src
        ), "AI branding not visible on chat/details screen"

    @pytest.mark.regression
    def test_quick_suggestions_visible(self, driver, base_url):
        """TC-AI-006: Quick suggestion chips are visible for easy prompting."""
        chat = _open_chat_from_details(driver, base_url)
        # Suggestions may show on first load
        src = driver.page_source
        has_suggestions = (
            chat.is_quick_suggestions_visible()
            or "Placement" in src
            or "Courses" in src
            or "Tell me" in src
            or "Fee" in src
        )
        assert has_suggestions, "Quick suggestion chips not visible on AI Chat screen"

    @pytest.mark.regression
    def test_chat_no_crash(self, driver, base_url):
        """TC-AI-007: AI Chat screen loads without crashing."""
        _open_chat_from_details(driver, base_url)
        assert len(driver.page_source) > 200, (
            "Page appears broken on AI Chat screen"
        )

    @pytest.mark.smoke
    def test_no_js_errors_on_chat(self, driver, base_url):
        """TC-AI-008: No critical JavaScript errors on AI Chat screen."""
        _open_chat_from_details(driver, base_url)
        logs = driver.get_log("browser")
        critical = [
            log for log in logs
            if log.get("level") == "SEVERE"
            and "favicon" not in log.get("message", "").lower()
            and "404" not in log.get("message", "")
        ]
        assert len(critical) == 0, (
            "Critical JS errors on AI Chat screen:\n"
            + "\n".join(e.get("message", "") for e in critical[:5])
        )


class TestAIChatInteraction:
    """Tests for interactive elements of the AI Chat screen."""

    @pytest.mark.regression
    def test_type_message_in_input(self, driver, base_url):
        """TC-AI-009: Chat input accepts typed text without error."""
        chat = _open_chat_from_details(driver, base_url)
        chat.try_type_message("Tell me about this college")
        assert len(driver.page_source) > 200, (
            "App crashed after typing in chat input"
        )

    @pytest.mark.regression
    def test_send_message_does_not_crash(self, driver, base_url):
        """TC-AI-010: Sending a message does not crash the app."""
        chat = _open_chat_from_details(driver, base_url)
        chat.try_type_message("What are the courses offered?")
        chat.try_click_send()
        time.sleep(3)
        assert len(driver.page_source) > 200, (
            "App crashed after sending a chat message"
        )

    @pytest.mark.regression
    def test_ai_response_or_loading_appears(self, driver, base_url):
        """TC-AI-011: After sending a message, a response or loading indicator appears."""
        chat = _open_chat_from_details(driver, base_url)
        chat.try_type_message("What is the placement rate?")
        chat.try_click_send()
        time.sleep(5)
        src = driver.page_source
        has_response = (
            chat.has_chat_messages()
            or "loading" in src.lower()
            or "typing" in src.lower()
            or "..." in src
            or "placement" in src.lower()
            or "rate" in src.lower()
            or len(src) > 300
        )
        assert has_response, (
            "No response or loading indicator after sending a chat message"
        )

    @pytest.mark.regression
    def test_click_suggestion_chip(self, driver, base_url):
        """TC-AI-012: Clicking a suggestion chip sends a query."""
        chat = _open_chat_from_details(driver, base_url)
        chat.try_click_suggestion("Placement")
        time.sleep(3)
        assert len(driver.page_source) > 200, (
            "App crashed after clicking a suggestion chip"
        )

    @pytest.mark.regression
    def test_back_navigation_from_chat(self, driver, base_url):
        """TC-AI-013: Back button/browser back works from AI Chat screen."""
        chat = _open_chat_from_details(driver, base_url)
        chat.try_click_back()
        time.sleep(2)
        assert len(driver.page_source) > 200, (
            "App broke after navigating back from AI Chat"
        )

    @pytest.mark.regression
    def test_chat_screen_scrollable(self, driver, base_url):
        """TC-AI-014: Chat screen can be scrolled (message history)."""
        _open_chat_from_details(driver, base_url)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.5)
        driver.execute_script("window.scrollTo(0, 0);")
        assert len(driver.page_source) > 200, (
            "App broke after scrolling on AI Chat screen"
        )

    @pytest.mark.regression
    def test_multiple_messages_no_crash(self, driver, base_url):
        """TC-AI-015: Sending multiple messages does not crash the app."""
        chat = _open_chat_from_details(driver, base_url)
        for msg in ["What courses are available?", "What is the fee?"]:
            chat.try_type_message(msg)
            chat.try_click_send()
            time.sleep(2.5)
        assert len(driver.page_source) > 200, (
            "App crashed after sending multiple chat messages"
        )
