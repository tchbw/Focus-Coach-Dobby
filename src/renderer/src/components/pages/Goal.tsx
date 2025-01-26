import { Button } from "@renderer/components/ui/button";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";

function Goal(): React.ReactElement {
  const [input, setInput] = useState(``);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMessage, setInitialMessage] = useState(``);
  const [finalMessage, setFinalMessage] = useState(``);

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
              content: `Ask the user what their goal is for today.`,
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
    const result = await window.electron.ipcRenderer.invoke(`chat:completion`, {
      messages: [
        {
          role: `system`,
          content: `You are a bad ass AI assistant serving as a couch on goal setting and workaholic. You think working hard is the elixir of life and a day well spent on productivity is goals.`,
        },
        {
          role: `user`,
          content: `Ask the user what their goal is for today.`,
        },
        {
          role: `assistant`,
          content: initialMessage,
        },
        {
          role: `user`,
          content: input,
        },
      ],
    });
    setFinalMessage(result);
  };

  const handleClose = (): void => {
    window.close();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf8e3] p-6 font-round">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">
            {finalMessage ? (
              <div>
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter.changeDelay(10).typeString(finalMessage).start();
                  }}
                />
              </div>
            ) : (
              <Typewriter
                onInit={(typewriter) => {
                  typewriter.changeDelay(10).typeString(initialMessage).start();
                }}
              />
            )}
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

          <div className="flex justify-center gap-4">
            <Button size="xl" onClick={handleClose} variant="outline">
              Close
            </Button>
            <Button size="xl" onClick={handleSend}>
              Save Goal
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Your goal will help guide your focus throughout the day
        </p>
      </div>
    </div>
  );
}

export default Goal;
