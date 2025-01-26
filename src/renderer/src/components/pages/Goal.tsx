import { useState } from "react";

function Goal(): React.ReactElement {
  const [input, setInput] = useState(``);
  const [response, setResponse] = useState(``);

  const handleSend = async (): Promise<void> => {
    // Send message to main process and wait for response
    const result = await window.electron.ipcRenderer.invoke(`chat:completion`, {
      messages: [{ role: `user`, content: input }],
    });

    if (result.choices[0]?.message?.content) {
      setResponse(result.choices[0].message.content);
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={input}
          onChange={(e): void => setInput(e.target.value)}
          className="rounded border p-2"
        />
        <button
          onClick={handleSend}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Send
        </button>
        {response && <div className="rounded bg-gray-100 p-4">{response}</div>}
      </div>
    </div>
  );
}

export default Goal;
