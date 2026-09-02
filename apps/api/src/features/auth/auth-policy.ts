const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const THROTTLE_WINDOW_MS = 15 * 60 * 1000;

export const AUTH_POLICY = {
  token: {
    algorithm: "HS256",
    audience: "habit-shaper-web",
    issuer: "habit-shaper-api",
    lifetimeSeconds: SESSION_LIFETIME_SECONDS,
  },
  cookie: {
    httpOnly: true,
    maxAgeMs: SESSION_LIFETIME_SECONDS * 1000,
    name: "hs_session",
    path: "/",
    sameSite: "lax",
  },
  throttle: {
    loginAttempts: 10,
    registrationAttempts: 5,
    windowMs: THROTTLE_WINDOW_MS,
  },
} as const;
