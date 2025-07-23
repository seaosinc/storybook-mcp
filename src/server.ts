import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { chromium } from "playwright";
import {
  StorybookData as StorybookDataV3,
  getComponentList as getComponentListV3,
  getComponentPropsDocUrl as getComponentPropsDocUrlV3,
} from "./storybookv3.js";
import {
  StorybookData as StorybookDataV5,
  getComponentList as getComponentListV5,
  getComponentPropsDocUrl as getComponentPropsDocUrlV5,
} from "./storybookv5.js";

// define tool parameters
const GetComponentListSchema = z.object({});

const GetComponentPropsSchema = z.object({
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
            name: "getComponentProps",
            description: "Get props information for a specific component",
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
          case "getComponentProps":
            const parsed = GetComponentPropsSchema.parse(args);
            return await this.getComponentProps(parsed.componentName);
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

      const data = (await response.json()) as StorybookDataV3 | StorybookDataV5;

      const components =
        data.v === 3 ? getComponentListV3(data) : getComponentListV5(data);

      return {
        content: [
          {
            type: "text",
            text: `Available components:\n${components.join("\n")}`,
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

  // get component props information
  private async getComponentProps(componentName: string) {
    try {
      // 1. get Storybook data to find component ID
      const response = await fetch(this.storybookUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Storybook data: ${response.statusText}`
        );
      }

      const data = (await response.json()) as StorybookDataV3 | StorybookDataV5;

      const componentUrl =
        data.v === 3
          ? getComponentPropsDocUrlV3(data, componentName, this.storybookUrl)
          : getComponentPropsDocUrlV5(data, componentName, this.storybookUrl);

      if (!componentUrl) {
        throw new Error(`Component "${componentName}" not found in Storybook`);
      }

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
