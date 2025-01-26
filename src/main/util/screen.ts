import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { desktopCapturer, screen } from "electron";
import { existsSync, mkdirSync, writeFile } from "fs";
import path from "path";
import { env } from "process";
import sharp from "sharp";
import { z } from "zod";

export const createScreenshot = async (): Promise<string> => {
  // Ensure screenshots directory exists
  const screenshotsDir = path.join(__dirname, `./screenshots`);
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }

  // Get primary display info
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const scaleFactor = primaryDisplay.scaleFactor;

  // Get screen sources
  const sources = await desktopCapturer.getSources({
    types: [`screen`],
    thumbnailSize: {
      width: width * scaleFactor,
      height: height * scaleFactor,
    },
  });

  const primaryScreenSource = sources[0];
  if (!primaryScreenSource) {
    throw new Error(`Unable to find primary screen source.`);
  }

  // Get screenshot as base64 PNG
  const screenshot = primaryScreenSource.thumbnail.toDataURL();
  const screenshotBuffer = Buffer.from(screenshot.split(`,`)[1], `base64`);

  // Generate unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, `-`);
  const screenshotPath = path.join(
    screenshotsDir,
    `screenshot-${timestamp}.png`
  );

  await new Promise<void>((resolve, reject) => {
    writeFile(screenshotPath, screenshotBuffer, (err) => {
      if (err) reject(err);
      resolve();
    });
  });

  return screenshotPath;
};

// Zod schema for response validation
const DistractionResponseSchema = z.object({
  isDistracted: z.boolean(),
  distractionDescription: z.string(),
  //   productivityScore: z.number().int(),
  //   goalRelevance: z.number().int(),
});

type DistractionResponse = z.infer<typeof DistractionResponseSchema>;

class ScreenshotProcessor {
  private readonly geminiClient: GoogleGenerativeAI;

  constructor() {
    // Validate API key before initializing client
    if (!env.GOOGLE_API_KEY) {
      throw new Error(
        `GOOGLE_API_KEY is not set. Please add it to your .env.local file.`
      );
    }

    this.geminiClient = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
  }

  async processScreenshot(
    goal: string,
    screenshotPath: string
  ): Promise<DistractionResponse> {
    try {
      // Resize image
      const resizedImageBuffer = await sharp(screenshotPath)
        .resize({ width: 512, height: 512, fit: "inside" })
        .toBuffer();

      const model = this.geminiClient.getGenerativeModel({
        model: `gemini-2.0-flash-exp`, // Updated to Gemini 2.0 model
      });

      const schema = {
        description: "List of recipes",
        type: SchemaType.OBJECT,
        properties: {
          isDistracted: { type: SchemaType.BOOLEAN, nullable: false },
          distractionDescription: { type: SchemaType.STRING, nullable: false },
          //   productivityScore: z.number().int(),
          //   goalRelevance: z.number().int(),
          //   type: SchemaType.OBJECT,
          //   properties: {
          //     recipeName: {
          //       type: SchemaType.STRING,
          //       description: "Name of the recipe",
          //       nullable: false,
          //     },
          //   },
          //   required: ["recipeName"],
        },
        required: ["isDistracted", "distractionDescription"],
      };

      const prompt = this.generateDistractionPrompt(goal);

      const result = await model.generateContent({
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
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
      console.log("FULL RESPONSE", fullResponseText);
      //   const response = await this.parseGeminiResponse(fullResponseText);
      const response = z
        .object({
          isDistracted: z.boolean(),
          distractionDescription: z.string(),
        })
        .parse(JSON.parse(fullResponseText));

      // Log the parsed response
      return response;
    } catch (error) {
      // Enhanced error logging
      console.error(
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
    }
    
    Be concise, objective, and focus on visual cues that indicate distraction or productivity.`;
  }

  //   private async parseGeminiResponse(
  //     responseText: string
  //   ): Promise<DistractionResponse> {
  //     try {
  //       // Try to parse the response as JSON
  //       const parsedResponse = JSON.parse(responseText);

  //       // Validate the parsed response against your DistractionResponse schema
  //       return {
  //         isDistracted: !!parsedResponse.isDistracted,
  //         distractionDescription: parsedResponse.distractionDescription || ``,
  //         productivityScore: Number(parsedResponse.productivityScore) || 0,
  //         goalRelevance: Number(parsedResponse.goalRelevance) || 0,
  //       };
  //     } catch (jsonError) {
  //       // If JSON parsing fails, try to extract information from text
  //       this.logger.warn(
  //         `Could not parse response as JSON. Falling back to text parsing.`
  //       );

  //       return {
  //         isDistracted: responseText.toLowerCase().includes(`distracted`),
  //         distractionDescription: responseText,
  //         productivityScore: 0,
  //         goalRelevance: 0,
  //       };
  //     }
  //   }
}

export default ScreenshotProcessor;
