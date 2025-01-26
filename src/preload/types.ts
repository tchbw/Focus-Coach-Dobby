export interface IElectronAPI {
  ipcRenderer: {
    invoke(
      channel: "chat:completion",
      args: { messages: Array<{ role: string; content: string }> }
    ): Promise<any>;
    // ... other existing methods ...
  };
}
