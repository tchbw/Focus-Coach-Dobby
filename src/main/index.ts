import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { StopEvent } from "@llamaindex/workflow";
import { focusCoachWorkflow } from "@main/workflow";
import { app, BrowserWindow, ipcMain, Menu, shell, Tray } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import { dobbyChatCompletion } from "../shared/init/dobby";

let savedGoal: string | null = null;
let tray: Tray | null = null;

// Add this before creating the window
ipcMain.handle(`chat:completion`, async (_, { messages }) => {
  try {
    const result = await dobbyChatCompletion(messages);
    return result;
  } catch (error) {
    console.error(`Error in chat completion:`, error);
    throw error;
  }
});

ipcMain.handle(`get:goal`, async () => {
  return savedGoal;
});

ipcMain.handle(`save:goal`, async (_, { goal }) => {
  console.log(`Saving goal:`, goal);
  savedGoal = goal;
  if (tray) {
    updateTray(tray);
  }
});

async function createWindow(
  onClose: () => Promise<void>
): Promise<BrowserWindow> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false, // Removes the default window frame
    transparent: true, // Enables transparency
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === `linux` ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, `../preload/index.js`),
      sandbox: false,
    },
  });

  mainWindow.on(`ready-to-show`, () => {
    mainWindow.show();
  });

  mainWindow.on(`closed`, () => {
    onClose();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: `deny` };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env[`ELECTRON_RENDERER_URL`]) {
    mainWindow.loadURL(process.env[`ELECTRON_RENDERER_URL`]);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/index.html`));
  }

  return mainWindow;
}

async function createGoalWindow(): Promise<BrowserWindow> {
  const goalWindow = new BrowserWindow({
    width: 550,
    height: 400,
    show: false,
    frame: false, // Removes the default window frame
    transparent: true, // Enables transparency
    autoHideMenuBar: true,
    ...(process.platform === `linux` ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, `../preload/index.js`),
      sandbox: false,
    },
  });

  goalWindow.on(`ready-to-show`, () => {
    goalWindow.show();
  });

  goalWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: `deny` };
  });

  // Load the remote URL for development or the local html file for production
  if (is.dev && process.env[`ELECTRON_RENDERER_URL`]) {
    await goalWindow.loadURL(
      `${process.env[`ELECTRON_RENDERER_URL`]}/input.html`
    );
  } else {
    await goalWindow.loadFile(join(__dirname, `../renderer/input.html`));
  }

  return goalWindow;
}

function updateTray(tray: Tray): void {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Goal: ${savedGoal || `(none)`}`,
    },
    {
      label: `Edit Input`,
      click: async (): Promise<void> => {
        await createGoalWindow();
      },
    },
    { type: `separator` },
    { label: `Exit`, role: `quit` },
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray(): void {
  tray = new Tray(join(__dirname, `../../resources/infinite.png`));
  updateTray(tray);
  tray.setToolTip(`This is my application.`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId(`com.electron`);

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on(`browser-window-created`, (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Handlers
  // ipcMain.handle(`get-chat-configuration`, async () => {
  //   return chatsConfigState;
  // });

  // await createWindow();
  await createGoalWindow();
  await createTray();

  // await createWindow();
  console.log(`Starting focus coach...`);
  const run = focusCoachWorkflow.run(`start`).with({
    focusObjective: `focusing on work`,
    openDobbyWindow: createWindow,
  });

  for await (const event of run) {
    if (event instanceof MessageEvent) {
      const msg = (event as MessageEvent).data.msg;
      console.log(`${msg}\n`);
    } else if (event instanceof StopEvent) {
      const result = (event as StopEvent<string>).data;
      console.log(`Final code:\n`, result);
    }
  }

  // Update scheduled jobs to fetch from database
  // schedule.scheduleJob(`*/30 * * * * *`, async () => {
  //   const autoChats = await prisma.configuredAutomatedChat.findMany();
  //   await processAutoMessages({
  //     automatedChats: autoChats.map((c) => c.chatId),
  //   });
  // });

  // app.on(`activate`, function () {
  //   // On macOS it's common to re-create a window in the app when the
  //   // dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow();
  // });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
