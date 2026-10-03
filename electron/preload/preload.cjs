const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pawpilot', {
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:get-all'),
    getById: (id) => ipcRenderer.invoke('tasks:get-by-id', id),
    create: (task) => ipcRenderer.invoke('tasks:create', task),
    update: (id, updates) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id)
  },
  pet: {
    getState: () => ipcRenderer.invoke('pet:get-state'),
    updateState: (updates) => ipcRenderer.invoke('pet:update-state', updates),
    addXp: (amount) => ipcRenderer.invoke('pet:add-xp', amount)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (updates) => ipcRenderer.invoke('settings:update', updates)
  },
  chat: {
    getAll: () => ipcRenderer.invoke('chat:get-all'),
    add: (msg) => ipcRenderer.invoke('chat:add', msg),
    clear: () => ipcRenderer.invoke('chat:clear')
  },
  notifications: {
    notify: (title, body) => ipcRenderer.invoke('notifications:notify', title, body)
  },
  window: {
    openDashboard: () => ipcRenderer.invoke('window:open-dashboard'),
    togglePet: () => ipcRenderer.invoke('window:toggle-pet'),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.invoke('window:ignore-mouse-events', ignore, options),
    movePet: (x) => ipcRenderer.invoke('window:move-pet', x),
    getScreenBounds: () => ipcRenderer.invoke('window:get-screen-bounds'),
  },
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_event, route) => callback(route));
  }
});
