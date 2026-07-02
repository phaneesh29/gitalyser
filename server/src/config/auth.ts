import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../db/index.js";
import { env } from "./env.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        }
    },
    emailAndPassword: {
        enabled: false,
    },
    trustedOrigins: [env.CORS_ORIGIN],
    advanced: {
        useSecureCookies: env.NODE_ENV === "production",
    },
    rateLimit: {
        window: 60, // 60 seconds
        max: 100, // 100 requests per window
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
});
