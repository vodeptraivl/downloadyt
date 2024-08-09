// preload.js
// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   ...ipcRenderer,
//   send: ipcRenderer.send,
//   on:ipcRenderer.on
// });


// Import the necessary Electron components.
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

const ipc = {
    'render': {
        'send': ['closeWindow','checkLink','download'],
        'receive': ['readyDownload','cancelDownload','doneDownload','error'],
        'sendReceive': []
    }
};

contextBridge.exposeInMainWorld(
    'ipcRender', {
        send: (channel, args) => {
            let validChannels = ipc.render.send;
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        receive: (channel, listener) => {
            let validChannels = ipc.render.receive;
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => listener(...args));
            }
        },
        invoke: (channel, args) => {
            let validChannels = ipc.render.sendReceive;
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        }
    }
);