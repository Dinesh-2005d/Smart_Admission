#!/usr/bin/env python3
"""
screenshot_manager.py – Utility to manage test screenshots
"""

import os
import time


class ScreenshotManager:
    """Handles screenshot capture, naming, and directory management."""

    def __init__(self, base_dir="../Test Results/Screenshots"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def capture(self, driver, name, suffix=""):
        """Capture a screenshot with a timestamped filename."""
        ts = time.strftime("%Y%m%d_%H%M%S")
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)
        filename = f"{safe_name}_{suffix}_{ts}.png" if suffix else f"{safe_name}_{ts}.png"
        filepath = os.path.join(self.base_dir, filename)

        try:
            driver.save_screenshot(filepath)
            print(f"📸 Screenshot: {filepath}")
            return filepath
        except Exception as e:
            print(f"⚠️  Screenshot failed: {e}")
            return None

    def capture_on_failure(self, driver, test_name):
        """Capture a failure screenshot with FAIL_ prefix."""
        return self.capture(driver, f"FAIL_{test_name}")

    def capture_on_pass(self, driver, test_name):
        """Capture a pass screenshot with PASS_ prefix."""
        return self.capture(driver, f"PASS_{test_name}")

    def get_all_screenshots(self):
        """List all screenshots in the directory."""
        if not os.path.exists(self.base_dir):
            return []
        return [
            os.path.join(self.base_dir, f)
            for f in os.listdir(self.base_dir)
            if f.endswith(".png")
        ]

    def cleanup_old(self, keep=50):
        """Remove old screenshots, keeping only the latest N."""
        screenshots = self.get_all_screenshots()
        screenshots.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        for old_file in screenshots[keep:]:
            try:
                os.remove(old_file)
            except OSError:
                pass
