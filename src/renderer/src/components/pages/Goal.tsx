import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import { motion } from "motion/react";
import { Button } from "@renderer/components/ui/button";

function Goal(): React.ReactElement {
  const [input, setInput] = useState(``);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMessage, setInitialMessage] = useState(``);
  const loadInitialMessage = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await window.electron.ipcRenderer.invoke(
        `chat:completion`,
        {
          messages: [
            {
              role: `system`,
              content: `You are a bad ass AI assistant serving as a couch on goal setting and workaholic. You think working hard is the elixir of life and a day well spent on productivity is goals.`,
            },
            {
              role: `user`,
              content: `Ask the user what their goal is for today, (${new Date().toLocaleDateString()}).`,
            },
          ],
        }
      );
      setInitialMessage(result);
    } catch (error) {
      console.error(`Error loading initial message:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialMessage();
  }, []);

  const handleSend = async (): Promise<void> => {
    // Send message to main process and wait for response
    await window.electron.ipcRenderer.invoke(`save:goal`, {
      goal: input,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="font-round flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-lg rounded-xl bg-[#fdf8e3] p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter.changeDelay(10).typeString(initialMessage).start();
                }}
              />
            </h1>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e): void => setInput(e.target.value)}
                placeholder="Enter your goal here..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg shadow-sm transition duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <Button asChild size="xl">
              <motion.button
                className="absolute bottom-10 left-1/2 z-50 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
              >
                Apologize to Dobby
              </motion.button>
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Your goal will help guide your focus throughout the day
          </p>
        </div>
      </div>
    </div>
  );
}

export default Goal;
