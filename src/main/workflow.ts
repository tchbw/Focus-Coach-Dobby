import {
  HandlerContext,
  StartEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import type { EmptyObject } from "type-fest";
import { desktopCapturer, screen } from "electron";
import { writeFile, mkdirSync, existsSync } from "fs";
import path from "path";
import { BrowserWindow } from "electron/main";

type Context = {
  focusObjective: string;
  lastSleepCompletedAt: null | string;
  openDobbyWindow: (onClose: () => Promise<void>) => Promise<BrowserWindow>;
};

// Create a custom event type
export class SleepCompleteEvent extends WorkflowEvent<EmptyObject> {}
export class ScreenshotEvent extends WorkflowEvent<{ filePath: string }> {}
export class FocusViolationEvent extends WorkflowEvent<{
  violationDescription: string;
}> {}
export class FocusVerifiedEvent extends WorkflowEvent<EmptyObject> {}
export class FocusViolationAcknowledgedEvent extends WorkflowEvent<EmptyObject> {}

const sleepUntilNextFocusCheck = async (
  _: unknown,
  _ev: StartEvent<string> | FocusVerifiedEvent | FocusViolationAcknowledgedEvent
): Promise<SleepCompleteEvent> => {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
  return new SleepCompleteEvent({});
};

const screenshotUserScreen = async (
  _: unknown,
  _ev: SleepCompleteEvent
): Promise<ScreenshotEvent> => {
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

  return new ScreenshotEvent({ filePath: screenshotPath });
};

const verifyFocus = async (
  _: unknown,
  _ev: ScreenshotEvent
): Promise<FocusVerifiedEvent | FocusViolationEvent> => {
  //   const prompt = `Give a thorough critique of the following joke: ${ev.data.screenshotPath}`;
  //   console.log(`Got file path: ${ev.data.filePath}`);
  //   const response = await llm.complete({ prompt });
  return new FocusViolationEvent({ violationDescription: `Focus violation` });
  // return new FocusVerifiedEvent({});
};

const triggerDobby = async (
  ctx: HandlerContext<Context>,
  _ev: FocusViolationEvent
): Promise<FocusVerifiedEvent> => {
  await ctx.data.openDobbyWindow(async () => {
    console.log(`Dobby window closed.`);
    ctx.sendEvent(new FocusViolationAcknowledgedEvent({}));
  });

  await ctx.requireEvent(FocusViolationAcknowledgedEvent);
  //   const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  //   const response = await llm.complete({ prompt });
  return new FocusVerifiedEvent({});
};

const focusCoachWorkflow = new Workflow<Context, string, string>({
  verbose: true,
});
focusCoachWorkflow.addStep(
  {
    inputs: [
      WorkflowEvent.or(
        WorkflowEvent.or(StartEvent<string>, FocusVerifiedEvent),
        FocusViolationAcknowledgedEvent
      ),
    ],
    outputs: [SleepCompleteEvent],
  },
  sleepUntilNextFocusCheck
);
focusCoachWorkflow.addStep(
  {
    inputs: [SleepCompleteEvent],
    outputs: [ScreenshotEvent],
  },
  screenshotUserScreen
);
focusCoachWorkflow.addStep(
  {
    inputs: [ScreenshotEvent],
    outputs: [FocusVerifiedEvent, FocusViolationEvent],
  },
  verifyFocus
);

// Focus result events
focusCoachWorkflow.addStep(
  {
    inputs: [FocusViolationEvent],
    outputs: [FocusVerifiedEvent],
  },
  triggerDobby
);

export { focusCoachWorkflow };
