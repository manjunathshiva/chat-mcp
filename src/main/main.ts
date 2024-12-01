// main.mjs
import { app, BrowserWindow, ipcMain } from 'electron';
import { initializeClient, listResources, readResource } from './mcp-file-test/client.js';
import {
  initializeClient as initClientFilesystem,
  listTools as listFilesystemTool,
  callTools as callFilesystemTool } from './mcp-filesystem/client.js';

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


let mainWindow;
let client : Client;
let clientFilesystem : Client;

async function createWindow() {
  const preloadPath = path.resolve(__dirname, '..', 'preload', 'preload.js');
  const indexPath = path.resolve(__dirname, '..', 'renderer', 'index.html');
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
  client = await initializeClient();
  clientFilesystem = await initClientFilesystem();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const resources = await listResources(client)
  const resources2 = await listFilesystemTool(clientFilesystem)

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('list-resources', async () => {
  return await listResources(client);
});

ipcMain.handle('read-resource', async (event, params) => {
  return await readResource(client, params);
});

ipcMain.handle('list-tools', async () => {
  return await listFilesystemTool(clientFilesystem);
});

ipcMain.handle('call-tools', async (event, params) => {
  return await callFilesystemTool(clientFilesystem, params);
});