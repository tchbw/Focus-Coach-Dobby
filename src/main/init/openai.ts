import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: import.meta.env.MAIN_VITE_OPENAI_API_KEY,
});
