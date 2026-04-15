import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`PAGE ERROR LOG: ${msg.text()}`);
            }
        });
        
        page.on('pageerror', error => {
            console.log(`PAGE UNCAUGHT ERROR: ${error.message}`);
        });

        await page.goto('http://localhost:8080');
        await page.waitForTimeout(3000);
        
        await browser.close();
    } catch (e) {
        console.error("Script error:", e);
    }
})();
