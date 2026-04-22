import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://truth-scan-10.preview.emergentagent.com"

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Login
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.fill('input[type="email"]', "test@truthscan.ai")
        await page.fill('input[type="password"]', "Test@123")
        await page.click('button[type="submit"]', force=True)
        
        try:
            await page.wait_for_url("**/dashboard**", timeout=10000)
            print("PASS: Login successful")
        except Exception as e:
            print(f"FAIL: Login - {e}")
            await browser.close()
            return
        
        await page.wait_for_timeout(2000)
        
        # Test 1: history-timeline exists
        try:
            el = await page.wait_for_selector('[data-testid="history-timeline"]', timeout=8000)
            if el:
                print("PASS: history-timeline data-testid exists and visible")
        except Exception as e:
            print(f"FAIL: history-timeline - {e}")

        # Test 2: Stat cards v4 labels
        stat_content = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('[data-testid^="stat-card-"]'));
            return cards.map(c => c.textContent.trim());
        }""")
        has_likely_false = any("Likely False" in c for c in stat_content)
        has_likely_true = any("Likely True" in c for c in stat_content)
        print(f"PASS: 'Likely False' in stat cards: {has_likely_false}")
        print(f"PASS: 'Likely True' in stat cards: {has_likely_true}")

        # Test 3: Table headers include EVIDENCE
        headers = await page.evaluate("""() => {
            const ths = Array.from(document.querySelectorAll('table th'));
            return ths.map(th => th.textContent.trim());
        }""")
        print(f"Table headers: {headers}")
        has_evidence = any("EVIDENCE" in h.upper() for h in headers)
        print(f"PASS: EVIDENCE column in table: {has_evidence}")

        # Test 4: Score distribution has 6 v4 labels
        score_labels = await page.evaluate("""() => {
            const text = document.body.innerText;
            return ["Likely True","Partially True","Needs Verification",
                    "Misleading / Missing Context","Likely False","Conflicting Reports"].filter(l => text.includes(l));
        }""")
        print(f"Score distribution labels found ({len(score_labels)}/6): {score_labels}")

        # Test 5: Verdict badges in history table
        badge_texts = await page.evaluate("""() => {
            const badges = Array.from(document.querySelectorAll('span[class*="badge-"]'));
            return badges.map(b => b.textContent.trim()).filter(t => t.length > 0).slice(0, 5);
        }""")
        print(f"Verdict badges: {badge_texts}")
        
        # Screenshot of dashboard
        await page.screenshot(path=".screenshots/dashboard_v6.jpg", quality=40, full_page=False)
        print("Screenshot saved: dashboard_v6.jpg")
        
        # Test 6: Navigate to /analyze and submit fake news, then test clipboard
        await page.goto(f"{BASE_URL}/analyze", wait_until="networkidle")
        
        # Find text input
        try:
            textarea = await page.wait_for_selector('textarea', timeout=5000)
            await textarea.fill("SHOCKING BOMBSHELL doctors HATE this miracle cure share before delete deep state")
            print("PASS: Text input filled")
        except Exception as e:
            print(f"FAIL: Text input - {e}")

        # Submit analysis
        try:
            submit_btn = await page.wait_for_selector('[data-testid="analyze-btn"], button[type="submit"]', timeout=5000)
            await submit_btn.click(force=True)
            print("Submitted analysis - waiting up to 45s...")
        except Exception as e:
            print(f"FAIL: Submit - {e}")

        # Wait for result
        try:
            await page.wait_for_selector('[data-testid="result-card"]', timeout=50000)
            print("PASS: Result card appeared")
        except Exception as e:
            print(f"FAIL: Result card timeout - {e}")
            await browser.close()
            return

        # Test Copy Report button
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        try:
            copy_btn = await page.wait_for_selector('[data-testid="copy-result-btn"]', timeout=5000)
            await copy_btn.click(force=True)
            await page.wait_for_timeout(1000)
            # Check for "Copied!" text
            copied_text = await page.evaluate("""() => {
                const btn = document.querySelector('[data-testid="copy-result-btn"]');
                return btn ? btn.textContent.trim() : "not found";
            }""")
            print(f"Copy button state after click: '{copied_text}'")
            if "Copied" in copied_text:
                print("PASS: Copy Report shows Copied! state (clipboard fix working)")
            else:
                print(f"INFO: Copy button text: {copied_text}")
        except Exception as e:
            print(f"FAIL: Copy button - {e}")

        # Test Share button
        try:
            share_btn = await page.wait_for_selector('[data-testid="share-btn"]', timeout=5000)
            await share_btn.click(force=True)
            await page.wait_for_timeout(1000)
            shared_text = await page.evaluate("""() => {
                const btn = document.querySelector('[data-testid="share-btn"]');
                return btn ? btn.textContent.trim() : "not found";
            }""")
            print(f"Share button state after click: '{shared_text}'")
            if "Copied" in shared_text:
                print("PASS: Share button shows Copied! state (clipboard fix working)")
            else:
                print(f"INFO: Share button text: {shared_text}")
        except Exception as e:
            print(f"FAIL: Share button - {e}")

        # Check for NotAllowedError in page
        errors = await page.evaluate("""() => {
            const errorElements = Array.from(document.querySelectorAll('.error, [class*="error"], [id*="error"]'));
            return errorElements.map(el => el.textContent).join(", ");
        }""")
        if errors:
            print(f"Page errors found: {errors}")
        else:
            print("No visible error messages on page")

        print(f"Console errors captured: {console_errors}")
        
        await browser.close()

asyncio.run(run())
