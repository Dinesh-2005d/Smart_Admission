#!/usr/bin/env python3
"""
screenshot_manager.py – Screenshot utility for Appium tests
"""

import os
import time


class ScreenshotManager:
    def __init__(self, base_dir="../Test Results/Screenshots"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def capture(self, driver, name, suffix=""):
        ts = time.strftime("%Y%m%d_%H%M%S")
        safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)
        fn = f"{safe}_{suffix}_{ts}.png" if suffix else f"{safe}_{ts}.png"
        path = os.path.join(self.base_dir, fn)
        try:
            driver.save_screenshot(path)
            return path
        except Exception:
            return None

    def capture_on_failure(self, driver, test_name):
        return self.capture(driver, f"FAIL_{test_name}")

    def get_all_screenshots(self):
        if not os.path.exists(self.base_dir):
            return []
        return [os.path.join(self.base_dir, f) for f in os.listdir(self.base_dir) if f.endswith(".png")]
