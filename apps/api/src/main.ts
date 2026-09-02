import "reflect-metadata";

import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/http/api-exception.filter";
import { getAppConfig } from "./config/app-config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const config = getAppConfig();

  app.enableShutdownHooks();
  app.setGlobalPrefix("api");
  app.use(helmet());
  app.use(cookieParser());
  app.useBodyParser("json", { limit: "32kb" });
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(config.port, "0.0.0.0");
}

void bootstrap();
