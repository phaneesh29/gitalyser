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
});
