# page_objects package
from .base_page import BasePage
from .home_page import HomePage
from .search_page import SearchPage
from .compare_page import ComparePage
from .saved_page import SavedPage
from .marks_entry_page import MarksEntryPage
from .login_page import LoginPage

__all__ = [
    "BasePage",
    "HomePage",
    "SearchPage",
    "ComparePage",
    "SavedPage",
    "MarksEntryPage",
    "LoginPage",
]
