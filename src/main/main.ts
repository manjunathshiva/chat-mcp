// main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { McpServersConfig } from './types.js';
import { initializeClient, listTools, callTools } from './client.js';

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.resolve(__dirname, '..', 'config.json');
const preloadPath = path.resolve(__dirname, '..', 'preload', 'preload.js');
const indexPath = path.resolve(__dirname, '..', 'renderer', 'index.html');

interface ClientObj {
  name: string;
  client: Client;
}

let mainWindow: BrowserWindow;
let clients: ClientObj[];


function readConfig(configPath: string): McpServersConfig | null {
  try {
    const config = readFileSync(configPath, 'utf8');
    return JSON.parse(config);
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
}

async function initClient(): Promise<ClientObj[]> {
  const config = readConfig(configPath);
  if (config) {
    console.log('Config loaded:', config);
    const clients = await Promise.all(
      Object.entries(config.mcpServers).map(async ([name, serverConfig]) => {
        console.log(`Initializing client for ${name} with config:`, serverConfig);
        const client = await initializeClient(name, serverConfig);
        console.log(`${name} initialized.`);
        return { name, client };
      })
    );
    console.log('All clients initialized.');
    return clients
  }
  console.log('NO clients initialized.');
  return []
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  });

  mainWindow.loadFile(indexPath);

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {

  clients = await initClient();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  for (const { name, client } of clients) {
    console.log(`Listing tools for client ${name}`);
    await listTools(client);
  }

  ipcMain.handle('list-clients', () => {
    return clients.map(({ name }) => name);
  });

  clients.forEach(({ name, client }) => {
    console.log(`IPC Main list-tools-${name}`)
    ipcMain.handle(`list-tools-${name}`, async () => {
      return await listTools(client);
    });

    console.log(`IPC Main call-tools-${name}`)
    ipcMain.handle(`call-tools-${name}`, async (event, params) => {
      return await callTools(client, params);
    });
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
