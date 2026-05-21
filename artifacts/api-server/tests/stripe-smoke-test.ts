import assert from "node:assert";

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:3000";

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const bodyText = await response.text();
  let body: any;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }
  return { response, body };
}

async function run() {
  console.log("Stripe smoke test starting...");

  const configUrl = `${API_BASE}/api/payments/config`;
  const { response: configRes, body: configBody } = await fetchJson(configUrl);
  console.log(`GET ${configUrl} -> ${configRes.status}`);
  assert.strictEqual(configRes.status, 200, "Expected /api/payments/config to respond with 200");
  assert.strictEqual(configBody.provider, "stripe", "Expected provider to be stripe");

  const intentUrl = `${API_BASE}/api/payments/create-payment-intent`;
  // Create a test user via test route (requires ENABLE_TEST_ROUTES=1)
  const testUserEmail = `smoke+${Date.now()}@example.com`;
  const createUrl = `${API_BASE}/api/_test/create-user`;
  const { response: createRes, body: createBody } = await fetchJson(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUserEmail, password: "password123", role: "buyer" }),
  });
  console.log(`POST ${createUrl} -> ${createRes.status}`);
  if (createRes.status === 404 || createRes.status === 401) {
    console.log("Test routes not enabled; skipping authenticated flow checks.");
  } else {
    if (createRes.status !== 200) {
      throw new Error(`Could not create test user: ${JSON.stringify(createBody)}`);
    }

    const token = createBody?.token as string | undefined;
    // Use Authorization header to call protected endpoint
    const { response: intentResAuth, body: intentBodyAuth } = await fetchJson(intentUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amountCents: 100 }),
    });
    console.log(`POST ${intentUrl} (auth) -> ${intentResAuth.status}`);
    if (intentResAuth.status !== 201) {
      throw new Error(`Authenticated create-payment-intent failed: ${JSON.stringify(intentBodyAuth)}`);
    }

    console.log("Authenticated payment intent created successfully.");
  }

  const onboardingUrl = `${API_BASE}/api/stripe-connect/onboarding/status`;
  const { response: statusRes } = await fetchJson(onboardingUrl);
  console.log(`GET ${onboardingUrl} -> ${statusRes.status}`);
  assert.ok(statusRes.status === 401 || statusRes.status === 403, "Expected stripe onboarding status to require auth");

  console.log("Stripe smoke test completed successfully.");
}

run().catch((error) => {
  console.error("Stripe smoke test failed:", error);
  process.exit(1);
});