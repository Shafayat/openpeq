import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAutoEQBundle: (): Promise<string | null> => ipcRenderer.invoke('get-autoeq-bundle'),
  isElectron: true,
})
