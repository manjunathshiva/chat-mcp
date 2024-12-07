const { contextBridge, ipcRenderer } = require('electron');

interface MCPAPI {
  [key: string]: {
      list: () => Promise<any>;
      call: (params: any) => Promise<any>;
  };
}

async function listClients(): Promise<string[]> {
  return await ipcRenderer.invoke('list-clients');
}

async function exposeAPIs() {
  const clients = await listClients();
  const api: MCPAPI = {};

  clients.forEach(client => {
    api[client] = {
      list: () => {
        return ipcRenderer.invoke(`list-tools-${client}`);
      },
      call: (params : any) => {
        return ipcRenderer.invoke(`call-tools-${client}`, params);
      }
    };
  });

  contextBridge.exposeInMainWorld('mcpServers', api);
}

exposeAPIs();