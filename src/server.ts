import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { chromium } from "playwright";

// define tool parameters
const GetComponentListSchema = z.object({});

const GetComponentPropsTypeSchema = z.object({
  componentName: z
    .string()
    .describe("The name of the component to get props information for"),
});

export class StorybookMCPServer {
  private server: Server;
  private storybookUrl: string;

  constructor() {
    this.server = new Server(
      {
        name: "storybook-mcp",
        version: "0.0.1",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    if (!process.env.STORYBOOK_URL) {
      throw new Error("STORYBOOK_URL environment variable is required");
    }

    // get Storybook URL from environment variable
    this.storybookUrl = process.env.STORYBOOK_URL;
    if (!this.storybookUrl) {
      throw new Error("STORYBOOK_URL environment variable is required");
    }

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // list available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "getComponentList",
            description:
              "Get a list of all components from the configured Storybook",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "getComponentPropsType",
            description: "Get props type information for a specific component",
            inputSchema: {
              type: "object",
              properties: {
                componentName: {
                  type: "string",
                  description:
                    "The name of the component to get props information for",
                },
              },
              required: ["componentName"],
            },
          },
        ],
      };
    });

    // handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "getComponentList":
            return await this.getComponentList();
          case "getComponentPropsType":
            const parsed = GetComponentPropsTypeSchema.parse(args);
            return await this.getComponentPropsType(parsed.componentName);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  // get component list
  private async getComponentList() {
    try {
      const response = await fetch(this.storybookUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Storybook data: ${response.statusText}`
        );
      }

      const data = await response.json();
      const entries = data.entries || {};

      // extract component names, filter only docs type entries
      const components = Object.values(entries)
        .filter((entry: any) => entry.type === "docs")
        .map((entry: any) => entry.title)
        .filter((title: string) => title)
        .sort();

      // remove duplicates
      const uniqueComponents = [...new Set(components)];

      return {
        content: [
          {
            type: "text",
            text: `Available components:\n${uniqueComponents.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to get component list: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // get component props type information
  private async getComponentPropsType(componentName: string) {
    try {
      // 1. get Storybook data to find component ID
      const response = await fetch(this.storybookUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Storybook data: ${response.statusText}`
        );
      }

      const data = await response.json();
      const entries = data.entries || {};

      // find matching component entry
      const matchingEntry = Object.values(entries).find(
        (entry: any) => entry.type === "docs" && entry.title === componentName
      ) as any;

      if (!matchingEntry) {
        throw new Error(`Component "${componentName}" not found in Storybook`);
      }

      // build component documentation page URL
      const baseUrl = this.storybookUrl.replace("/index.json", "");
      const componentUrl = `${baseUrl}/iframe.html?viewMode=docs&id=${matchingEntry.id}`;

      // use Playwright to get page content
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(componentUrl, { waitUntil: "networkidle" });

        // wait for table to load
        await page.waitForSelector("table.docblock-argstable", {
          timeout: 10000,
        });

        // get props table HTML
        const propsTableHTML = await page.$eval(
          "table.docblock-argstable",
          (element: HTMLElement) => element.innerHTML
        );

        return {
          content: [
            {
              type: "text",
              text: `Props information for component "${componentName}":\n\n${propsTableHTML}`,
            },
          ],
        };
      } catch (pageError) {
        throw new Error(
          `Failed to load component page or find props table: ${
            pageError instanceof Error ? pageError.message : String(pageError)
          }`
        );
      } finally {
        await browser.close();
      }
    } catch (error) {
      throw new Error(
        `Failed to get component props: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // start Stdio server
  async startStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Storybook MCP Server running on stdio mode");
  }
}
