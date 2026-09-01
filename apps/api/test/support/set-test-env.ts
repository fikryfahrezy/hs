process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??=
  "mysql://habit_shaper:habit_shaper_local@127.0.0.1:3306/habit_shaper";
process.env.JWT_SECRET ??= "test-only-secret-with-at-least-32-bytes";
process.env.COOKIE_SECURE ??= "false";
process.env.WEB_ORIGIN ??= "http://localhost:8080";
