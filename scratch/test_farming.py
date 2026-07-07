import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run_test():
    options = Options()
    options.binary_location = "/Applications/Google Chrome Temp.app/Contents/MacOS/Google Chrome"
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    try:
        driver = webdriver.Chrome(options=options)
        print("Initialized WebDriver successfully!")
    except Exception as e:
        print(f"Failed to initialize Chrome: {e}")
        sys.exit(1)

    try:
        driver.set_window_size(1280, 1024)
        url = "http://localhost:3010/play/farming"
        print(f"Navigating to {url}...")
        driver.get(url)
        
        # Wait for loading
        time.sleep(8)
        
        # Capture screenshot of main page to see what's happening
        screenshot_path = "/Users/roberto/.gemini/antigravity/brain/cc6a550c-2a7a-41c9-8fb1-271275161f78/screenshot_farming_debug_main.png"
        driver.save_screenshot(screenshot_path)
        print(f"Main page screenshot saved to: {screenshot_path}")

        # Log browser console logs
        print("Browser logs:")
        for entry in driver.get_log('browser'):
            print("  ", entry)

        # Switch to game iframe
        iframe = driver.find_element(By.TAG_NAME, "iframe")
        driver.switch_to.frame(iframe)
        print("Switched to game iframe!")

        # Log iframe console logs if possible
        print("Searching for canvas...")
        canvas = driver.find_element(By.ID, "game-canvas")
        print("Found canvas successfully!")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
