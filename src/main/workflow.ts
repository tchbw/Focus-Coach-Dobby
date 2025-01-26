import {
  HandlerContext,
  StartEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import ScreenshotProcessor, { createScreenshot } from "@main/util/screen";
import { BrowserWindow } from "electron/main";
import type { EmptyObject } from "type-fest";

type Context = {
  setDobbyViolationString: (s: string) => void;
  focusObjective: string;
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
  _ctx: HandlerContext<Context>,
  ev: StartEvent<string> | FocusVerifiedEvent | FocusViolationAcknowledgedEvent
): Promise<SleepCompleteEvent> => {
  if (!(ev instanceof StartEvent)) {
    console.log(`Sleeping before checking for focus...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return new SleepCompleteEvent({});
};

const screenshotUserScreen = async (
  _: unknown,
  _ev: SleepCompleteEvent
): Promise<ScreenshotEvent> => {
  const screenshotPath = await createScreenshot();

  return new ScreenshotEvent({ filePath: screenshotPath });
};

const verifyFocus = async (
  ctx: HandlerContext<Context>,
  ev: ScreenshotEvent
): Promise<FocusVerifiedEvent | FocusViolationEvent> => {
  const screenshotProcessor = new ScreenshotProcessor();
  const result = await screenshotProcessor.processScreenshot(
    ctx.data.focusObjective,
    ev.data.filePath
  );
  console.log("SCREENSHOT RESULT", result);
  if (result.isDistracted) {
    return new FocusViolationEvent({
      violationDescription: result.distractionDescription,
    });
  } else {
    return new FocusVerifiedEvent({});
  }
  //   const prompt = `Give a thorough critique of the following joke: ${ev.data.screenshotPath}`;
  //   console.log(`Got file path: ${ev.data.filePath}`);
  //   const response = await llm.complete({ prompt });
  // return new FocusViolationEvent({ violationDescription: `Focus violation` });
  // return new FocusVerifiedEvent({});
};

const triggerDobby = async (
  ctx: HandlerContext<Context>,
  _ev: FocusViolationEvent
): Promise<FocusVerifiedEvent> => {
  ctx.data.setDobbyViolationString(
    `What a great night to watch the shooting stars. You should try making a wish and see what happens!`
  );
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
