import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "OPENAI_API_KEY"
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.warn(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  if (missingEnvVars.includes("OPENAI_API_KEY")) {
    console.warn("Without OPENAI_API_KEY, the application will fall back to basic keyword analysis.");
  }
  if (missingEnvVars.includes("DATABASE_URL")) {
    console.error("DATABASE_URL is required for the application to function properly.");
  }
}

// Export config with default values
export const config = {
  database: {
    url: process.env.DATABASE_URL || ""
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o" // the newest OpenAI model as of May 13, 2024
  },
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    env: process.env.NODE_ENV || "development"
  }
};