// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { ServerConfig } from './types.js'; 

export async function initializeClient(name: String, config: ServerConfig) {
    const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
    });
    const client_name = `${name}-client`;
    const client = new Client({
        name: client_name,
        version: "0.6.2",
    }, {
        capabilities: {}
    });
    await client.connect(transport);
    console.log(`${client_name} connected.`);
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

