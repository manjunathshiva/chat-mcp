// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('OS: ', process.platform)
export async function initializeClient() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ['node_modules/@modelcontextprotocol/server-filesystem/dist/index.js', __dirname],

        // command: "npx",
        // args: ['-y', '@modelcontextprotocol/server-filesystem', __dirname],
        // stderr: 'pipe'
    });
    const client = new Client({
        name: "filesystem-client",
        version: "1.0.0",
    }, {
        capabilities: {}
    });
    await client.connect(transport);
    console.log('Connected.');
    return client;
}
export async function listTools(client: Client) {
    const tools = await client.request(
        { method: "tools/list" },
        ListToolsResultSchema
      );
    console.log('List Tools:', tools);
    return tools;
}

export async function callTools(client: Client, params: any) {
    const call_tools = await client.request(
        {
          method: "tools/call",
          params: params
        },
        CallToolResultSchema
      );
    console.log('Call Tools:', call_tools);
    return call_tools;
}

