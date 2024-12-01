const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mcp', {
  // listResources: {
  //   description: 'Lists all available resources.',
  //   fn: () => ipcRenderer.invoke('list-resources'),
  // },
  // readResource: {
  //   description: 'Reads the content of one resource by its URI.',
  //   fn: (params: { uri: string }) => {
  //     return ipcRenderer.invoke('read-resource', params);
  //   },
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       uri: {
  //         type: "string",
  //         description: "The URI of the resource to read."
  //       }
  //     },
  //     required: ["uri"]
  //   }
  // },
  filesystem: {
    list: () => {
      return ipcRenderer.invoke('list-tools');
    },
    call: (params: any) => {
      return ipcRenderer.invoke('call-tools', params);
    }
  },
});