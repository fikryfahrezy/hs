import cookieParser from "cookie-parser";
import helmet from "helmet";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { type NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "#app/app.module";
import { ApiExceptionFilter } from "#app/common/http/api-exception.filter";
import { RequestLoggingMiddleware } from "#app/common/http/request-logging.middleware";

export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = module.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  app.disable("x-powered-by");
  app.setGlobalPrefix("api");
  app.use(helmet());

  const requestLogger = new RequestLoggingMiddleware();
  app.use(requestLogger.use.bind(requestLogger));
  app.use(cookieParser());
  app.useBodyParser("json", { limit: "32kb" });
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.init();
  return app;
}
