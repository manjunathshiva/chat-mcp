import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const server = new Server({
    name: "example-server",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {}
    }
});

console.log('Server Staring...')

function normalizePath(p: string): string {
    return path.normalize(p).toLowerCase();
}

function expandHome(filepath: string): string {
    if (filepath.startsWith('~/') || filepath === '~') {
        return path.join(os.homedir(), filepath.slice(1));
    }
    return filepath;
}

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const files = fs.readdirSync(__dirname);

    const resources = files.map(file => {
        const filePath = path.join(__dirname, file); // 获取文件的完整路径

        return {
            uri: normalizePath(path.resolve(expandHome(filePath))),
            name: file, // 这里可以根据需要修改为文件的名称或其他信息
        };
    });

    return {
        resources,
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
        const uri = request.params.uri
        const content = fs.readFileSync(uri, 'utf8'); // 读取文件内容
        return {
            contents: [
                {
                    uri: uri,
                    mimeType: "text/plain",
                    text: content,
                },
            ],
        };
    } catch {
        throw new Error(`Unable to access ${request.params.uri}. You need to first list resources to obtain the list of accessible paths.`);
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);