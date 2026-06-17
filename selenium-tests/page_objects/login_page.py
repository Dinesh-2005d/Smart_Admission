"""Login Page Object – Smart Admission authentication screen."""

import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class LoginPage(BasePage):
    """
    Covers the Login / Auth screen:
    - App logo / branding visible
    - Email input field
    - Password input field
    - Login button
    - Google Sign-in button
    - Register / Sign-up link
    - Forgot password link
    """

    LOGIN_KEYWORDS = [
        "Sign In", "Login", "Email", "Password", "Log in",
        "Welcome", "Admission", "Google", "sign in", "login"
    ]

    def load(self) -> "LoginPage":
        """Navigate to root — which shows the login screen for unauthenticated users."""
        self.open("")
        time.sleep(4)  # Allow React Native splash + hydration
        return self

    def is_login_screen_visible(self) -> bool:
        src = self.get_page_source()
        return any(kw in src for kw in self.LOGIN_KEYWORDS)

    def is_email_input_present(self) -> bool:
        src = self.get_page_source().lower()
        return (
            "email" in src
            or "gmail" in src
            or "@" in src
            or "username" in src
        )

    def is_password_input_present(self) -> bool:
        src = self.get_page_source().lower()
        return "password" in src or "pin" in src

    def is_login_button_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Sign In" in src
            or "Login" in src
            or "Log In" in src
            or "Continue" in src
        )

    def is_google_signin_present(self) -> bool:
        src = self.get_page_source()
        return "Google" in src or "google" in src.lower()

    def is_register_link_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Register" in src
            or "Sign Up" in src
            or "Create" in src
            or "New" in src
        )

    def is_forgot_password_link_present(self) -> bool:
        src = self.get_page_source()
        return (
            "Forgot" in src
            or "forgot" in src
            or "Reset" in src
            or "reset" in src
        )

    def is_app_branding_visible(self) -> bool:
        src = self.get_page_source()
        return "Smart" in src or "Admission" in src or "🎓" in src

    def try_type_email(self, email: str = "test@example.com") -> bool:
        """Attempt to type into the email input."""
        try:
            inputs = self.driver.find_elements(
                By.XPATH,
                "//input[@type='email' or @type='text' or @inputmode='email']"
            )
            if inputs:
                inputs[0].clear()
                inputs[0].send_keys(email)
                time.sleep(0.5)
                return True
        except Exception:
            pass
        return False

    def try_type_password(self, password: str = "wrongpassword") -> bool:
        """Attempt to type into the password input."""
        try:
            inputs = self.driver.find_elements(
                By.XPATH,
                "//input[@type='password']"
            )
            if inputs:
                inputs[0].clear()
                inputs[0].send_keys(password)
                time.sleep(0.5)
                return True
        except Exception:
            pass
        return False

    def try_click_login_button(self) -> bool:
        """Attempt to click the login/sign-in button."""
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Sign In') or contains(text(),'Login') or contains(text(),'Log In')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[-1])
                time.sleep(2)
                return True
        except Exception:
            pass
        return False

    def try_click_forgot_password(self) -> bool:
        """Attempt to click the Forgot Password link."""
        try:
            els = self.find_all(
                By.XPATH,
                "//*[contains(text(),'Forgot') or contains(text(),'Reset')]"
            )
            if els:
                self.driver.execute_script("arguments[0].click();", els[0])
                time.sleep(2)
                return True
        except Exception:
            pass
        return False

    def is_on_app_home(self) -> bool:
        """Returns True if the app has navigated past auth to the main app."""
        src = self.get_page_source()
        return (
            "State" in src
            or "Board" in src
            or "Search Colleges" in src
            or "Step 1" in src
        )

    def get_all_inputs(self) -> list:
        """Returns list of all visible input elements."""
        try:
            return self.driver.find_elements(By.XPATH, "//input")
        except Exception:
            return []
