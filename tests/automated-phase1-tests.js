/**
 * Automated Phase 1 Regression Tests
 * Run with: node tests/automated-phase1-tests.js
 */

const {chromium} = require("playwright");

async function runPhase1Tests() {
  console.log("🚀 Starting Phase 1 Regression Tests...\n");

  const browser = await chromium.launch({headless: false});
  const page = await browser.newPage();

  try {
    // Test 1: Application Startup
    console.log("📱 Test 1: Application Startup");
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");

    // Check if app loaded
    const title = await page.textContent("h1");
    console.log(`✅ App loaded with title: ${title}`);

    // Test 2: Theme Toggle
    console.log("\n🎨 Test 2: Theme Toggle");
    const themeButton = page.locator('button[title*="theme"]');
    await themeButton.click();
    console.log("✅ Theme toggle clicked");

    // Test 3: Group Creation
    console.log("\n📁 Test 3: Group Creation");
    const createGroupButton = page.locator('text="Create New Group"');
    await createGroupButton.click();

    // Fill group form
    await page.fill('input[name="name"]', "Test Group 1");
    await page.fill('textarea[name="description"]', "This is a test group for regression testing");
    await page.fill('input[name="studyCardCount"]', "5");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for redirect back to dashboard
    await page.waitForURL("http://localhost:5173/");
    console.log("✅ Group created successfully");

    // Test 4: Navigate to Group Detail
    console.log("\n📋 Test 4: Group Detail Navigation");
    const groupCard = page.locator('text="Test Group 1"').first();
    await groupCard.click();

    await page.waitForURL(/\/groups\/.+/);
    console.log("✅ Navigated to group detail");

    // Test 5: Card Creation
    console.log("\n🃏 Test 5: Card Creation");
    const addCardButton = page.locator('text="Add Card"');
    await addCardButton.click();

    // Fill card form
    await page.fill('input[name="front"]', "Hello");
    await page.fill('input[name="back"]', "Hallo");
    await page.fill('input[name="hint"]', "German greeting");

    const submitCardButton = page.locator('button[type="submit"]');
    await submitCardButton.click();

    // Wait for card to appear
    await page.waitForSelector('text="Hello"');
    console.log("✅ Card created successfully");

    // Test 6: Study Session
    console.log("\n📚 Test 6: Study Session");
    const startStudyButton = page.locator('text="Start Study Session"');
    await startStudyButton.click();

    await page.waitForURL(/\/study\/.+/);

    // Check if study session loaded
    const cardFront = await page.textContent('.card-front, [data-testid="card-front"]');
    console.log(`✅ Study session started with card: ${cardFront}`);

    // Rate the card
    const knowButton = page.locator('text="Know"');
    await knowButton.click();
    console.log("✅ Card rated successfully");

    // Test 7: Data Persistence (Reload)
    console.log("\n💾 Test 7: Data Persistence");
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Navigate back to dashboard
    await page.goto("http://localhost:5173/");

    // Check if group still exists
    const persistedGroup = page.locator('text="Test Group 1"');
    await persistedGroup.waitFor();
    console.log("✅ Data persisted after reload");

    // Test 8: Mobile Responsiveness
    console.log("\n📱 Test 8: Mobile Responsiveness");
    await page.setViewportSize({width: 375, height: 667});

    // Check if navigation adapts
    const mobileNav = page.locator("nav");
    await mobileNav.waitFor();
    console.log("✅ Mobile layout loaded");

    console.log("\n🎉 All Phase 1 tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase1Tests().catch(console.error);
}

module.exports = {runPhase1Tests};
