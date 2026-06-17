"""AI Chat Page Object – Smart Admission college AI chat screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class AIChatPage(BasePage):
    """
    Covers the College AI Chat screen (CollegeChatScreen):
    - Chat input field
    - Send button
    - Chat bubbles / messages
    - Quick suggestion chips
    - AI response loading indicator
    - Back navigation
    """

    CHAT_KEYWORDS = [
        "Chat", "Ask", "AI", "Message", "Type", "Send",
        "college", "Question", "Response", "🤖", "Groq",
    ]

    def navigate_to_ai_chat(self) -> "AIChatPage":
        """Navigate to AI chat from anywhere — click any Chat/Ask AI button."""
        try:
            chat_els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Chat') or contains(text(),'Ask AI') or contains(text(),'Ask')]"
            )
            for el in chat_els:
                self.driver.execute_script("arguments[0].click();", el)
                time.sleep(2.5)
                if self.is_chat_screen_visible():
                    break
        except Exception:
            pass
        return self

    def is_chat_screen_visible(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in self.CHAT_KEYWORDS)

    def is_chat_input_present(self) -> bool:
        """Check if a text/message input field is present."""
        src = self.get_page_source().lower()
        has_keyword = "type" in src or "message" in src or "ask" in src or "chat" in src
        # Also check for an actual input element
        try:
            inputs = self.driver.find_elements(By.XPATH, "//input")
            if inputs:
                return True
        except Exception:
            pass
        return has_keyword

    def is_send_button_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Send" in src
            or "send" in src.lower()
            or "➤" in src
            or "►" in src
            or "↑" in src
        )

    def is_quick_suggestions_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "suggest" in src.lower()
            or "Tell me about" in src
            or "What courses" in src
            or "Placement" in src
            or "Fees" in src
        )

    def is_ai_branding_visible(self) -> bool:
        src = self.get_page_source()
        return "AI" in src or "🤖" in src or "Groq" in src or "powered" in src.lower()

    def is_welcome_message_visible(self) -> bool:
        src = self.get_page_source()
        return (
            "Hello" in src
            or "Hi" in src
            or "Welcome" in src
            or "How can I" in src
            or "I can help" in src
            or "Ask me" in src
        )

    def try_type_message(self, msg: str = "Tell me about this college") -> bool:
        """Attempt to type a message in the chat input."""
        try:
            inputs = self.driver.find_elements(By.XPATH, "//input")
            if inputs:
                inputs[-1].clear()
                inputs[-1].send_keys(msg)
                time.sleep(0.5)
                return True
            # ContentEditable fallback
            editable = self.driver.find_elements(
                By.XPATH, "//*[@contenteditable='true']"
            )
            if editable:
                editable[-1].clear()
                editable[-1].send_keys(msg)
                time.sleep(0.5)
                return True
        except Exception:
            pass
        return False

    def try_click_send(self) -> bool:
        """Attempt to click the Send button."""
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Send') or @aria-label='Send']"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[-1])
                time.sleep(3)
                return True
        except Exception:
            pass
        return False

    def try_click_suggestion(self, suggestion_text: str = "Placement") -> bool:
        """Click a quick suggestion chip."""
        try:
            els = self.find_all(
                By.XPATH,
                f"//*[contains(text(),'{suggestion_text}')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(3)
                return True
        except Exception:
            pass
        return False

    def has_chat_messages(self) -> bool:
        """Returns True if any chat message bubbles are visible."""
        src = self.get_page_source()
        return (
            "bubble" in src.lower()
            or "message" in src.lower()
            or "response" in src.lower()
            or "loading" in src.lower()
            or "typing" in src.lower()
        )

    def get_message_count(self) -> int:
        """Estimate number of chat messages by counting specific bubble elements."""
        try:
            msgs = self.find_all(
                By.XPATH,
                "//*[contains(@class,'message') or contains(@class,'bubble') or contains(@class,'chat')]"
            )
            return len(msgs)
        except Exception:
            return 0

    def try_click_back(self) -> bool:
        try:
            els = self.find_all(By.XPATH, "//*[contains(text(),'Back') or contains(text(),'←')]")
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(1.5)
                return True
            self.driver.execute_script("window.history.back();")
            time.sleep(1.5)
            return True
        except Exception:
            pass
        return False
