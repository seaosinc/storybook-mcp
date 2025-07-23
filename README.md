# Storybook MCP Server

![Node CI](https://github.com/mcpland/storybook-mcp/workflows/Node%20CI/badge.svg)
[![npm](https://img.shields.io/npm/v/storybook-mcp.svg)](https://www.npmjs.com/package/storybook-mcp)
![license](https://img.shields.io/npm/l/storybook-mcp)

A Model Context Protocol (MCP) server that provides tools to interact with Storybook documentation and component information.

## Features

- **getComponentList**: Get a list of all components from a configured Storybook
- **getComponentProps**: Get detailed props information for specific components using headless browser automation

## Installation and Configuration

### MCP Settings

Add the following configuration to MCP settings:

```json
{
  "mcpServers": {
    "storybook": {
      "command": "npx",
      "args": ["-y", "storybook-mcp"],
      "env": {
        "STORYBOOK_URL": "<your_storybook_url>/index.json"
      }
    }
  }
}
```

### Environment Variables

- `STORYBOOK_URL` (required): The URL to your Storybook's index.json file

## Usage

The server provides two main tools:

### 1. getComponentList

Retrieves a list of all available components from the configured Storybook.

**Example:**

```
Available components:
Accordion
Avatar
Badge
Button
...
```

### 2. getComponentProps

Gets detailed props information for a specific component, including:

- Property names
- Types
- Default values
- Descriptions
- Required/optional status

**Parameters:**

- `componentName` (string): The name of the component to get props information for

**Example usage:**

```
Tool: getComponentProps
Parameters: { "componentName": "Button" }
```

## How it works

1. **Component List**: The server fetches the Storybook's `index.json` file(v3 is `stories.json`) and extracts all components marked as "docs" type
2. **Props Information**: For component props, the server:
   - Finds the component's documentation ID from the index.json
   - Constructs the iframe URL for the component's docs page
   - Uses Playwright to load the page in a headless browser
   - Extracts the props table HTML from the documentation

## Supported Storybook URLs

The server works with any Storybook that exposes an `index.json` file(v3 is `stories.json`). Common patterns:

- `https://your-storybook-domain.com/index.json`
- `https://your-storybook-domain.com/storybook/index.json`

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `yarn install`
3. Install Playwright browsers: `npx playwright install chromium`
4. Set the environment variable: `export STORYBOOK_URL="your-storybook-url"`
5. Run in development mode: `yarn dev`

> Note: You can also use `npx @modelcontextprotocol/inspector tsx src/index.ts` instead of `yarn dev` if you prefer.

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

## Requirements

- Node.js 18.0.0 or higher
- Chromium browser (automatically installed with Playwright)

## Error Handling

The server includes comprehensive error handling for:

- Missing or invalid Storybook URLs
- Network connectivity issues
- Component not found scenarios
- Playwright browser automation failures

## License

Storybook MCP is [MIT licensed](https://github.com/mcpland/storybook-mcp/blob/main/LICENSE).
