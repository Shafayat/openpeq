import { app, BrowserWindow, ipcMain } from 'electron'
import { readFileSync } from 'fs'
import path from 'path'

// Vendor IDs must match src/renderer/src/lib/usb/constants.ts
const WALKPLAY_VENDOR_IDS = [
  0x3302, 0x0762, 0x35d8, 0x2fc6, 0x0104, 0xb445, 0x0661, 0x0666, 0x0d8c,
]

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  })

  // Hide menu bar for a clean look
  mainWindow.setMenuBarVisibility(false)

  // --- WebHID Permission Handling ---

  // Allow the renderer to use the HID permission at all
  mainWindow.webContents.session.setPermissionCheckHandler((_wc, permission) => {
    if (permission === 'hid') return true
    return true
  })

  // Grant permission for devices matching our vendor IDs
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'hid') {
      const device = details.device as Electron.HIDDevice
      return WALKPLAY_VENDOR_IDS.includes(device.vendorId)
    }
    return false
  })

  // Auto-select matching HID device (replaces browser device chooser)
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault()
    const target = details.deviceList.find(d =>
      WALKPLAY_VENDOR_IDS.includes(d.vendorId)
    )
    if (target) {
      callback(target.deviceId)
    } else {
      // No matching device found — return empty to reject
      callback('')
    }
  })

  // Keep device list updated so select-hid-device has fresh data
  mainWindow.webContents.session.on('hid-device-added', (_event, _device) => {
    // Electron tracks this automatically, handler just needs to exist
  })

  mainWindow.webContents.session.on('hid-device-removed', (_event, _device) => {
    // Electron tracks this automatically, handler just needs to exist
  })

  // --- Load App ---
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// --- IPC: AutoEQ Bundle ---
ipcMain.handle('get-autoeq-bundle', () => {
  const bundlePath = app.isPackaged
    ? path.join(process.resourcesPath, 'resources', 'autoeq-bundle.json')
    : path.join(__dirname, '../../resources/autoeq-bundle.json')

  try {
    return readFileSync(bundlePath, 'utf-8')
  } catch {
    return null
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
