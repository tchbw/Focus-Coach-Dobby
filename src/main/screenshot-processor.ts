// src/main/screenshot-processor.ts
import * as path from "path";
import * as fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import { z } from "zod";
import { env } from "../shared/env";

// Temporary logger with improved type safety
interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
}

const createLogger = (name: string): Logger => ({
  info: (message: string, ...args: any[]) =>
    console.log(`[${name}] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[${name}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[${name}] ${message}`, ...args),
});

// Constants for supported image extensions
const SUPPORTED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
]);

// Zod schema for response validation
const DistractionResponseSchema = z.object({
  isDistracted: z.boolean(),
  distractionDescription: z.string(),
  productivityScore: z.number().int(),
  goalRelevance: z.number().int(),
});

type DistractionResponse = z.infer<typeof DistractionResponseSchema>;

class ScreenshotProcessor {
  private readonly logger: Logger;
  private readonly screenshotDir: string;
  private readonly processedDir: string;
  private readonly geminiClient: GoogleGenerativeAI;

  constructor(
    screenshotDir: string = "screenshots",
    processedDir: string = "processed_screenshots"
  ) {
    this.logger = createLogger("ScreenshotProcessor");
    this.screenshotDir = path.resolve(screenshotDir);
    this.processedDir = path.resolve(processedDir);

    // Validate API key before initializing client
    if (!env.GOOGLE_API_KEY) {
      throw new Error(
        `GOOGLE_API_KEY is not set. Please add it to your .env.local file.`
      );
    }

    this.geminiClient = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist(): Promise<void> {
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(this.processedDir, { recursive: true });
  }

  async processScreenshot(
    goal: string,
    screenshotPath: string
  ): Promise<DistractionResponse | null> {
    try {
      // Additional logging for debugging
      this.logger.info(`Processing screenshot: ${screenshotPath}`);

      // Resize image
      const resizedImageBuffer = await sharp(screenshotPath)
        .resize({ width: 512, height: 512, fit: "inside" })
        .toBuffer();

      // Use Gemini 2.0 API configuration
      const generationConfig = {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      };

      const model = this.geminiClient.getGenerativeModel({
        model: `gemini-1.5-flash`, // Updated to Gemini 2.0 model
        generationConfig,
      });

      const prompt = this.generateDistractionPrompt(goal);

      const result = await model.generateContent({
        contents: [
          {
            role: `user`,
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: `image/png`,
                  data: resizedImageBuffer.toString(`base64`),
                },
              },
            ],
          },
        ],
      });

      // Log the full raw response
      const fullResponseText = result.response.text();
      this.logger.info(`Full Gemini Response:\n${fullResponseText}`);

      const response = await this.parseGeminiResponse(fullResponseText);

      // Log the parsed response
      this.logger.info(
        `Parsed Distraction Response:`,
        JSON.stringify(response, null, 2)
      );

      // Move processed screenshot
      await this.moveProcessedScreenshot(screenshotPath);

      return response;
    } catch (error) {
      // Enhanced error logging
      this.logger.error(
        `Error processing screenshot ${screenshotPath}:`,
        error instanceof Error ? error.message : error
      );

      // Optionally rethrow or handle specific error types
      throw error;
    }
  }

  private generateDistractionPrompt(goal: string): string {
    return `Analyze this screenshot in the context of the goal: ${goal}. 
    Provide a JSON-formatted response with the following structure:
    {
      "isDistracted": boolean, // Whether the user is distracted
      "distractionDescription": string, // Detailed description of distraction
      "productivityScore": number, // Score from 0-10 representing productivity
      "goalRelevance": number // Score from 0-10 representing relevance to the goal
    }
    
    Be concise, objective, and focus on visual cues that indicate distraction or productivity.`;
  }

  private async parseGeminiResponse(
    responseText: string
  ): Promise<DistractionResponse> {
    try {
      // Try to parse the response as JSON
      const parsedResponse = JSON.parse(responseText);

      // Validate the parsed response against your DistractionResponse schema
      return {
        isDistracted: !!parsedResponse.isDistracted,
        distractionDescription: parsedResponse.distractionDescription || ``,
        productivityScore: Number(parsedResponse.productivityScore) || 0,
        goalRelevance: Number(parsedResponse.goalRelevance) || 0,
      };
    } catch (jsonError) {
      // If JSON parsing fails, try to extract information from text
      this.logger.warn(
        `Could not parse response as JSON. Falling back to text parsing.`
      );

      return {
        isDistracted: responseText.toLowerCase().includes(`distracted`),
        distractionDescription: responseText,
        productivityScore: 0,
        goalRelevance: 0,
      };
    }
  }

  private async moveProcessedScreenshot(screenshotPath: string): Promise<void> {
    try {
      // Ensure processed directory exists
      await fs.mkdir(this.processedDir, { recursive: true });

      const filename = path.basename(screenshotPath);
      const timestamp = new Date().toISOString().replace(/[:\.]/g, `-`);
      const uniqueFilename = `${path.parse(filename).name}_${timestamp}${path.extname(filename)}`;
      const destinationPath = path.join(this.processedDir, uniqueFilename);

      // Copy the file instead of renaming to preserve original
      await fs.copyFile(screenshotPath, destinationPath);

      // Optional: Delete original file after successful copy
      await fs.unlink(screenshotPath);

      this.logger.info(`Processed screenshot: ${filename} → ${uniqueFilename}`);
    } catch (error) {
      this.logger.error(
        `Error moving processed screenshot ${screenshotPath}:`,
        error
      );

      // Optionally rethrow or handle specific error types
      throw error;
    }
  }

  async processExistingScreenshots(
    goal: string = "General productivity"
  ): Promise<void> {
    const files = await fs.readdir(this.screenshotDir);

    const screenshotFiles = files.filter((file) =>
      SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase())
    );

    for (const file of screenshotFiles) {
      const fullPath = path.join(this.screenshotDir, file);
      await this.processScreenshot(goal, fullPath);
    }
  }
}

export default ScreenshotProcessor;
