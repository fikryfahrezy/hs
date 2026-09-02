import cookieParser from "cookie-parser";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { AppModule } from "../../src/app.module";
import { ApiExceptionFilter } from "../../src/common/http/api-exception.filter";

export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = module.createNestApplication();
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.init();
  return app;
}
