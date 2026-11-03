const DEV_DEFAULT_SECRET = "dev-secret-change-in-production";

type EnvLike = Partial<NodeJS.ProcessEnv>;

function isHosted(env: EnvLike): boolean {
  return (
    env.NODE_ENV === "production" ||
    env.STRICT_CONFIG === "true" ||
    env.RENDER === "true" ||
    !!env.RAILWAY_PROJECT_ID ||
    !!env.RAILWAY_ENVIRONMENT_NAME
  );
}

export function assertSafeConfig(env: EnvLike = process.env): void {
  const secret = env.JWT_SECRET;
  const usingDefault = !secret || secret === DEV_DEFAULT_SECRET;

  if (!isHosted(env)) {
    if (usingDefault) {
      console.warn("[config] JWT_SECRET is the development default. Fine on your laptop, never on a server.");
    }
    return;
  }

  const problems: string[] = [];
  if (usingDefault) problems.push("JWT_SECRET is missing or still the development default");
  else if ((secret as string).length < 32) problems.push("JWT_SECRET is shorter than 32 characters");
  if (!env.DATABASE_URL) problems.push("DATABASE_URL is missing");
  if (!env.WEB_URL) problems.push("WEB_URL is missing (CORS would reject the web app)");

  if (problems.length > 0) {
    throw new Error(`Refusing to start on a hosted server:\n - ${problems.join("\n - ")}`);
  }
}
