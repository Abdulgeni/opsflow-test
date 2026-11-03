import { assertSafeConfig } from "./assert-safe-config";

const GOOD = {
  NODE_ENV: "production",
  JWT_SECRET: "a".repeat(48),
  DATABASE_URL: "postgresql://x",
  WEB_URL: "https://app.example.com",
};

describe("assertSafeConfig", () => {
  afterEach(() => jest.restoreAllMocks());

  it("accepts a complete, strong production configuration", () => {
    expect(() => assertSafeConfig(GOOD)).not.toThrow();
  });

  it("only warns on a developer machine, even with the default secret", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => assertSafeConfig({ JWT_SECRET: "dev-secret-change-in-production" })).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("refuses the development default secret in production", () => {
    expect(() => assertSafeConfig({ ...GOOD, JWT_SECRET: "dev-secret-change-in-production" })).toThrow(/JWT_SECRET/);
  });

  it("refuses a missing secret in production", () => {
    const { JWT_SECRET: _omit, ...rest } = GOOD;
    expect(() => assertSafeConfig(rest)).toThrow(/missing or still the development default/);
  });

  it("refuses a short secret in production", () => {
    expect(() => assertSafeConfig({ ...GOOD, JWT_SECRET: "short" })).toThrow(/shorter than 32/);
  });

  it("reports every problem at once", () => {
    let message = "";
    try { assertSafeConfig({ NODE_ENV: "production" }); } catch (e) { message = (e as Error).message; }
    expect(message).toMatch(/JWT_SECRET/);
    expect(message).toMatch(/DATABASE_URL/);
    expect(message).toMatch(/WEB_URL/);
  });

  it.each([
    ["Render", { RENDER: "true" }],
    ["Railway project", { RAILWAY_PROJECT_ID: "abc" }],
    ["Railway environment", { RAILWAY_ENVIRONMENT_NAME: "production" }],
    ["the explicit switch", { STRICT_CONFIG: "true" }],
  ])("treats %s as a hosted server", (_name, platform) => {
    expect(() => assertSafeConfig({ ...platform, JWT_SECRET: "dev-secret-change-in-production" })).toThrow(/JWT_SECRET/);
  });
});
