// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListResourcesResultSchema, ReadResourceResultSchema } from "@modelcontextprotocol/sdk/types.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: [`${path.join(__dirname, 'server.js')}`],
    stderr: 'pipe'
  });

  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  await client.connect(transport);

  console.log('Connected.');

  return client;
}

export async function listResources(client: Client) {
  const resources = await client.request(
    { method: "resources/list" },
    ListResourcesResultSchema
  );

  console.log('Resource Result:', resources);
  return resources;
}

export async function readResource(client: Client, params: { uri: string }) {
  const resourceContent = await client.request(
    {
      method: "resources/read",
      params: params
    },
    ReadResourceResultSchema
  );

  console.log('Content Result:', resourceContent);
  return resourceContent;
}
