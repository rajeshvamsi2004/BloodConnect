import sys
import json
import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

def create_stealth_driver():
    """Create a more stealth-like Chrome driver"""
    chrome_options = Options()
    
    # Don't use headless mode - JustDial detects it easily
    # chrome_options.add_argument("--headless") 
    
    # Anti-detection measures
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Make browser look more human
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-plugins-discovery")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    
    # Random window size to avoid detection
    widths = [1366, 1920, 1440, 1600]
    heights = [768, 1080, 900, 1200]
    width = random.choice(widths)
    height = random.choice(heights)
    chrome_options.add_argument(f"--window-size={width},{height}")
    
    # Rotate user agents
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]
    chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    try:
        driver = webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()), 
            options=chrome_options
        )
        
        # Execute anti-detection scripts
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})")
        driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']})")
        
        return driver
    except Exception as e:
        print(f"DEBUG: Failed to create driver: {e}", file=sys.stderr)
        return None

def human_like_delay():
    """Add human-like random delays"""
    time.sleep(random.uniform(2, 5))

def check_for_captcha_or_block(driver):
    """Check if we hit a CAPTCHA or got blocked"""
    page_source = driver.page_source.lower()
    blocked_indicators = [
        "captcha", "verify", "robot", "automation", 
        "blocked", "forbidden", "access denied",
        "security check", "please wait"
    ]
    return any(indicator in page_source for indicator in blocked_indicators)

def try_alternative_approach(location_name):
    """Try a different approach - search through general search first"""
    driver = create_stealth_driver()
    if not driver:
        return []
    
    results_list = []
    
    try:
        # Try general JustDial search first
        search_url = "https://www.justdial.com/"
        print(f"DEBUG: Starting with homepage approach", file=sys.stderr)
        
        driver.get(search_url)
        human_like_delay()
        
        if check_for_captcha_or_block(driver):
            print("DEBUG: Blocked at homepage", file=sys.stderr)
            return []
        
        # Try to find and use search box
        search_selectors = [
            "input[name='what']",
            "input[placeholder*='search']", 
            "#srchbx",
            ".search-box input"
        ]
        
        search_box = None
        for selector in search_selectors:
            try:
                search_box = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                break
            except:
                continue
        
        if search_box:
            # Type search query
            search_box.clear()
            search_box.send_keys("Blood Banks")
            human_like_delay()
            
            # Try to find location box
            location_selectors = [
                "input[name='where']",
                "input[placeholder*='location']",
                "input[placeholder*='city']"
            ]
            
            location_box = None
            for selector in location_selectors:
                try:
                    location_box = driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except:
                    continue
            
            if location_box:
                location_box.clear()
                location_box.send_keys(location_name)
                human_like_delay()
            
            # Try to submit search
            submit_selectors = [
                "button[type='submit']",
                ".search-btn",
                "input[type='submit']",
                ".btn-search"
            ]
            
            for selector in submit_selectors:
                try:
                    submit_btn = driver.find_element(By.CSS_SELECTOR, selector)
                    driver.execute_script("arguments[0].click();", submit_btn)
                    break
                except:
                    continue
            
            human_like_delay()
            
            # Now try to extract results
            if not check_for_captcha_or_block(driver):
                results_list = extract_results_from_page(driver, location_name)
    
    except Exception as e:
        print(f"DEBUG: Alternative approach failed: {e}", file=sys.stderr)
    
    finally:
        try:
            driver.quit()
        except:
            pass
    
    return results_list

def extract_results_from_page(driver, location_name):
    """Extract blood bank results from current page"""
    results_list = []
    
    # Wait a bit for results to load
    human_like_delay()
    
    # Multiple selectors for different JustDial layouts
    result_selectors = [
        ".resultbox",
        ".store-details", 
        ".contactDetails",
        ".result-list li",
        ".search-result",
        "[data-resultid]"
    ]
    
    search_results = []
    for selector in result_selectors:
        try:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                search_results = elements
                print(f"DEBUG: Found {len(elements)} results with selector: {selector}", file=sys.stderr)
                break
        except:
            continue
    
    if not search_results:
        print("DEBUG: No results found with any selector", file=sys.stderr)
        return []
    
    for i, result in enumerate(search_results[:10]):  # Limit to first 10 results
        try:
            name = ""
            address = ""
            phone = ""
            
            # Extract name
            name_selectors = [
                ".fn", ".store-name", "h2 a", "h3 a", 
                ".heading a", ".business-name", "[data-store-name]"
            ]
            
            for sel in name_selectors:
                try:
                    name_elem = result.find_element(By.CSS_SELECTOR, sel)
                    name = name_elem.text.strip()
                    if name:
                        break
                except:
                    continue
            
            # Extract address  
            addr_selectors = [
                ".address", ".store-address", ".locality",
                ".adr", ".contact-info address", ".addr"
            ]
            
            for sel in addr_selectors:
                try:
                    addr_elem = result.find_element(By.CSS_SELECTOR, sel)
                    address = addr_elem.text.strip()
                    if address:
                        break
                except:
                    continue
            
            # Extract phone
            phone_selectors = [
                ".phone", ".mobile", ".contact-number",
                "[href^='tel:']", ".phn"
            ]
            
            for sel in phone_selectors:
                try:
                    phone_elem = result.find_element(By.CSS_SELECTOR, sel)
                    phone_text = phone_elem.text.strip()
                    if phone_text and phone_text.lower() not in ['call', 'phone']:
                        phone = phone_text
                        break
                    # Check href attribute for tel: links
                    href = phone_elem.get_attribute('href')
                    if href and 'tel:' in href:
                        phone = href.replace('tel:', '').replace('+91', '').strip()
                        break
                except:
                    continue
            
            # Only add if we have a valid name
            if name and len(name) > 3 and 'blood' in name.lower():
                results_list.append({
                    "name": name,
                    "address": address or "Address not available",
                    "phone": phone or "Phone not available", 
                    "location": location_name,
                    "type": "blood_bank"
                })
                print(f"DEBUG: Found blood bank: {name}", file=sys.stderr)
        
        except Exception as e:
            print(f"DEBUG: Error extracting result {i}: {e}", file=sys.stderr)
            continue
    
    return results_list

def scrape_justdial_by_location(location_name):
    """Main scraping function with multiple fallback strategies"""
    
    # Strategy 1: Try direct URL approach (original method)
    print(f"DEBUG: Trying direct URL approach for {location_name}", file=sys.stderr)
    
    driver = create_stealth_driver()
    if not driver:
        return []
    
    results_list = []
    
    # Try different URL formats
    url_formats = [
        f"https://www.justdial.com/{location_name}/Blood-Banks",
        f"https://www.justdial.com/{location_name}/Blood-Donation-Centre", 
        f"https://www.justdial.com/{location_name}/Medical-Services/Blood-Banks",
        f"https://www.justdial.com/{location_name.replace(' ', '%20')}/Blood-Banks"
    ]
    
    for url in url_formats:
        try:
            print(f"DEBUG: Trying URL: {url}", file=sys.stderr)
            driver.get(url)
            human_like_delay()
            
            if check_for_captcha_or_block(driver):
                print("DEBUG: CAPTCHA/Block detected, trying next URL", file=sys.stderr)
                continue
            
            results = extract_results_from_page(driver, location_name)
            if results:
                results_list.extend(results)
                break
                
        except WebDriverException as e:
            print(f"DEBUG: WebDriver error with {url}: {e}", file=sys.stderr)
            # Driver might have crashed, try to recover
            try:
                driver.quit()
            except:
                pass
            driver = create_stealth_driver()
            if not driver:
                break
            continue
        except Exception as e:
            print(f"DEBUG: Error with URL {url}: {e}", file=sys.stderr)
            continue
    
    try:
        driver.quit()
    except:
        pass
    
    # Strategy 2: If no results, try alternative approach
    if not results_list:
        print("DEBUG: Direct URL failed, trying search approach", file=sys.stderr)
        results_list = try_alternative_approach(location_name)
    
    print(f"DEBUG: Final result count: {len(results_list)}", file=sys.stderr)
    return results_list

def main():
    if len(sys.argv) > 1:
        location = sys.argv[1]
        try:
            results = scrape_justdial_by_location(location)
            print(json.dumps(results, indent=2))
        except Exception as e:
            print(f"DEBUG: Main function error: {e}", file=sys.stderr)
            print(json.dumps([]))
    else:
        print(json.dumps([]))

if __name__ == "__main__":
    main()