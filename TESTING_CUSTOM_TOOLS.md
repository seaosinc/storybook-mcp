# Testing Custom Tools - Safe Examples

This branch contains safe, low-risk custom tool examples for experimenting with the storybook-mcp custom tools feature.

## Easy Custom Tools to Try

The `custom-tools-examples.json` file contains three safe custom tools:

### 1. getStorybookTitle
- **Risk Level**: 🟢 Very Low
- **What it does**: Gets basic page information (title, headings)
- **Why it's safe**: Only reads DOM elements, no modifications

### 2. countStorybookComponents  
- **Risk Level**: 🟢 Very Low
- **What it does**: Counts sidebar components
- **Why it's safe**: Only counts elements, no data extraction

### 3. getPageMetadata
- **Risk Level**: 🟢 Very Low  
- **What it does**: Basic page metadata extraction
- **Why it's safe**: Only reads standard web page properties

## How to Test

1. **For testing locally**, you can use your storybook-test project:
   ```bash
   cd ~/Develop/storybook-test
   ```

2. **Copy the custom tools JSON** and use it in your MCP configuration:
   ```json
   {
     "mcpServers": {
       "storybook": {
         "command": "npx",
         "args": ["-y", "/Users/john/Develop/storybook-mcp"],
         "env": {
           "STORYBOOK_URL": "your-storybook-url/index.json",
           "CUSTOM_TOOLS": "[{\"name\":\"getStorybookTitle\",\"description\":\"Get the title and basic information from the Storybook main page\",\"parameters\":{},\"page\":\"https://your-storybook-url.com/\",\"handler\":\"try { const title = document.title || 'No title'; const h1 = document.querySelector('h1')?.textContent || 'No h1 found'; return { title: title, mainHeading: h1, url: window.location.href }; } catch(e) { return { error: e.message }; }\"}]"
         }
       }
     }
   }
   ```

## Testing Strategy

1. **Start with getStorybookTitle** - it's the safest
2. **Use a test Storybook instance** - not production
3. **Check MCP logs** for any errors
4. **Verify the output** makes sense

## Customizing for Your Storybook

To adapt these examples for your own Storybook:

1. **Update the page URL** in each custom tool
2. **Modify the CSS selectors** if needed
3. **Test one tool at a time**

## Safe Development Practices

- ✅ Always use `try-catch` blocks in handlers
- ✅ Test with non-production Storybook instances first
- ✅ Use read-only operations (no DOM modifications)
- ✅ Start with simple selectors like `document.title`
- ❌ Avoid complex JavaScript operations
- ❌ Don't access sensitive data
- ❌ Don't modify the DOM

## Example Output

The `getStorybookTitle` tool should return something like:
```json
{
  "title": "Storybook - My Components",
  "mainHeading": "Welcome to Storybook", 
  "url": "https://your-storybook.com/"
}
```
