import dotenvFlow from "dotenv-flow";
import { z } from "zod";

// Load environment variables
dotenvFlow.config();

// Define a schema for environment variables
const EnvSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, "Google API Key is required"),
  // Add other environment variables here
});

// Validate and parse environment variables
export const env = EnvSchema.parse(process.env);
