import assert from "assert";
import axios from "axios";

import { config } from "dotenv";
import path from "path";
import { DOBBY_GOAL_PROMPT } from "./prompts";

// Load environment variables from .env file
config({ path: path.join(process.cwd(), `.env`) });

assert(process.env.FIREWORKS_API_KEY, `FIREWORKS_API_KEY is required`);

export const dobbyClient = axios.create({
  baseURL: `https://api.fireworks.ai/inference/v1`,
  headers: {
    Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
    "Content-Type": `application/json`,
  },
});

export type DobbyMessage = {
  role: `user` | `assistant` | `system`;
  content: string;
};

export type DobbyRequest = {
  model: string;
  messages: DobbyMessage[];
};

export type DobbyResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DobbyMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens: number;
  };
};

export const DEFAULT_MODEL = `accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b#accounts/sentientfoundation/deployments/81e155fc`;

export async function dobbyChatCompletion(
  messages: DobbyMessage[],
  model = DEFAULT_MODEL
): Promise<string> {
  const response = await dobbyClient.post(`/chat/completions`, {
    model,
    messages,
  });

  return response.data.choices[0].message.content;
}

export async function dobbyGoalViolation(
  goal: string,
  distractionTask: string
): Promise<string> {
  const response = await dobbyChatCompletion([
    { role: `system`, content: DOBBY_GOAL_PROMPT },
    {
      role: `user`,
      content: `The user's goal is ${goal} and you discovered them sneakily doing ${distractionTask}. You are pissed off and angry at them. Be vulgar. Get them back on track to their goal with up to 3 sentences.`,
    },
  ]);

  return response;
}
