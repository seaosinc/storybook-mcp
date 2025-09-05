# Custom Tools Experimentation Branch

This branch (`feature/custom-tools-examples`) contains safe, easy-to-test custom tools for the storybook-mcp server.

## 🎯 Quick Start - Easiest Custom Tool to Try

**Start with `getStorybookTitle`** - it's the safest and simplest:

1. **Copy this single custom tool**:
   ```json
   [{"name":"getStorybookTitle","description":"Get the title and basic information from the Storybook main page","parameters":{},"page":"https://opensource.adobe.com/spectrum-web-components/storybook/","handler":"try { const title = document.title || 'No title'; const h1 = document.querySelector('h1')?.textContent || 'No h1 found'; return { title: title, mainHeading: h1, url: window.location.href }; } catch(e) { return { error: e.message }; }"}]
   ```

2. **Add it to your MCP configuration**:
   ```json
   {
     "mcpServers": {
       "storybook": {
         "command": "npx",
         "args": ["-y", "/Users/john/Develop/storybook-mcp"],
         "env": {
           "STORYBOOK_URL": "https://opensource.adobe.com/spectrum-web-components/storybook/index.json",
           "CUSTOM_TOOLS": "[{\"name\":\"getStorybookTitle\",\"description\":\"Get the title and basic information from the Storybook main page\",\"parameters\":{},\"page\":\"https://opensource.adobe.com/spectrum-web-components/storybook/\",\"handler\":\"try { const title = document.title || 'No title'; const h1 = document.querySelector('h1')?.textContent || 'No h1 found'; return { title: title, mainHeading: h1, url: window.location.href }; } catch(e) { return { error: e.message }; }\"}]"
         }
       }
     }
   }
   ```

3. **Test it**: The AI should now be able to use the `getStorybookTitle` tool!

## 📁 Files in This Branch

- **`custom-tools-examples.json`**: 3 safe, tested custom tools
- **`component-specific-example.json`**: Tools for extracting component slots/methods  
- **`test-custom-tools.js`**: Validation script to check your JSON
- **`TESTING_CUSTOM_TOOLS.md`**: Detailed testing guide
- **`README-CUSTOM-TOOLS-BRANCH.md`**: This file

## 🧪 Validate Before Testing

Run the validation script to make sure everything is correct:

```bash
node test-custom-tools.js
```

This will check your JSON and give you the properly formatted environment variable.

## 💡 Safe Customization Tips

1. **Change the URL**: Replace `https://opensource.adobe.com/...` with your own Storybook URL
2. **Test locally first**: Use a development Storybook, not production
3. **Start simple**: Begin with `getStorybookTitle` before trying more complex tools
4. **Check the console**: Look for any error messages in your MCP client

## 🔧 For Your USlideUpWindow Component

The `component-specific-example.json` shows how to extract:
- **Slots**: `button` slot, `default` slot
- **Methods**: `saveInitValue` method

Customize the page URLs to point to your actual component documentation.

## 🚦 Risk Levels

- 🟢 **Green (Safe)**: `getStorybookTitle`, `getPageMetadata`
- 🟡 **Yellow (Low risk)**: `countStorybookComponents`, `getComponentSlots`
- 🔴 **Red (Avoid)**: Anything that modifies DOM, accesses sensitive data, or makes network requests

## ✅ Success Indicators

You'll know it's working when:
- The AI can see your custom tool in the available tools list
- Calling the tool returns expected JSON data  
- No error messages in the MCP logs

## 🆘 Troubleshooting

- **"Tool not found"**: Check your JSON syntax with `node test-custom-tools.js`
- **"Page failed to load"**: Verify the Storybook URL is accessible
- **"Handler error"**: Test your JavaScript in the browser console first
- **Empty results**: The CSS selectors might need adjustment for your Storybook

---

**Next Steps**: Once you've tested these examples, you can create your own custom tools by modifying the JSON files and using the validation script!
