export interface IElectronAPI {
  ipcRenderer: {
    invoke(
      channel: "chat:completion",
      args: { messages: Array<{ role: string; content: string }> }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any>;
    // ... other existing methods ...
  };
}
