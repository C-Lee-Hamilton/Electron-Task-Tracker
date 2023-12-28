const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store();

// Use ipcMain.handle to handle asynchronous requests
ipcMain.handle("set-tasks", (event, updatedTasks) => {
  store.set("tasks", updatedTasks);
  return true; // Return a value to the renderer process if needed
});

ipcMain.handle("get-tasks", (event) => {
  return store.get("tasks") || [];
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "build", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.on("did-finish-load", () => {
    const tasks = store.get("tasks") || [];
    mainWindow.webContents.send("update-tasks", tasks);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
