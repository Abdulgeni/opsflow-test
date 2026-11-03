import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

declare const process: {
  env: Record<string, string | undefined>;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.WEB_URL ?? "http://localhost:3000" });
  await app.listen(process.env.PORT ?? 4000);
  console.log(`OpsFlow API running on http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();