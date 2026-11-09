import { authenticateOrehackAdmin } from "../src/lib/orehack-db";

async function testAdminAuth() {
  console.log("=== Testing Admin Authentication ===");

  // 1. Valid credentials (admin / coboorehack)
  const res1 = await authenticateOrehackAdmin("admin", "coboorehack");
  console.log("Test 1 (Valid admin/coboorehack):", res1.success ? "PASS" : "FAIL", res1);
  if (!res1.success) throw new Error("Test 1 failed");

  // 2. Case insensitive username (ADMIN / coboorehack)
  const res2 = await authenticateOrehackAdmin("ADMIN ", "coboorehack");
  console.log("Test 2 (Case-insensitive 'ADMIN '):", res2.success ? "PASS" : "FAIL", res2);
  if (!res2.success) throw new Error("Test 2 failed");

  // 3. Invalid password (admin / wrongpass)
  const res3 = await authenticateOrehackAdmin("admin", "wrongpass");
  console.log("Test 3 (Wrong password):", !res3.success ? "PASS" : "FAIL", res3);
  if (res3.success) throw new Error("Test 3 failed");

  // 4. Old hardcoded password should no longer work
  const res4 = await authenticateOrehackAdmin("admin", "cobotex2026");
  console.log("Test 4 (Old pass cobotex2026 rejected):", !res4.success ? "PASS" : "FAIL", res4);
  if (res4.success) throw new Error("Test 4 failed: old password should not work");

  console.log("ALL ADMIN AUTH TESTS PASSED! ✅");
}

testAdminAuth();

