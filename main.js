const { app, BrowserWindow } = require('electron')

var WIDTH = 500;
var HEIGHT = 500;

function createWindow () {
    // Stwórz okno przeglądarki.
    const win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: 'hidden',
    })

  // and load the index.html of the app.
    win.loadFile('index.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
