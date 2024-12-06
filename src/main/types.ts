// types.ts
export interface McpServersConfig {
    mcpServers: {
      [key: string]: ServerConfig;
    };
  }

export interface ServerConfig {
    command: string;
    args: string[];
}
