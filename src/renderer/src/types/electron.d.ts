interface ElectronAPI {
  getAutoEQBundle: () => Promise<string | null>
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
