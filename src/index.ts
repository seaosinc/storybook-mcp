#!/usr/bin/env node

import { StorybookMCPServer } from "./server.js";

// main function
async function main() {
  try {
    const server = new StorybookMCPServer();
    await server.startStdio();
  } catch (error) {
    console.error("Failed to start Storybook MCP Server:", error);
    process.exit(1);
  }
}

// handle process exit
process.on("SIGINT", () => {
  console.log("\nShutting down Storybook MCP Server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down Storybook MCP Server...");
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
