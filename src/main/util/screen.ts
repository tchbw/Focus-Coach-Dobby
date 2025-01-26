import { desktopCapturer, screen } from "electron";
import { existsSync, mkdirSync, writeFile } from "fs";
import path from "path";

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
