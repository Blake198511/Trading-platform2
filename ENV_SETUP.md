# Environment Setup Guide

This guide explains how to configure the Trading Platform using environment variables across different browsers and platforms.

## Overview

Since browsers cannot directly read `.env` files (which are a server-side concept), this platform provides multiple ways to configure environment variables that work across all browsers and platforms.

## Quick Start

### 1. Local Development (File-based)

**Option A: Using localStorage (Recommended for testing)**

```html
<!-- Add this to your HTML before loading the app -->
<script src="env-loader.js"></script>
<script src="config.js"></script>
<script>
  // Configure your settings
  EnvLoader.saveToLocalStorage({
    'API_KEY': 'your_api_key_here',
    'API_SECRET': 'your_secret_here',
    'ENABLE_LIVE_TRADING': 'false',
    'DEFAULT_THEME': 'dark'
  });
</script>
```

**Option B: Using Meta Tags**

```html
<!-- Add meta tags to your HTML head -->
<head>
  <meta name="env:API_KEY" content="your_api_key_here">
  <meta name="env:API_SECRET" content="your_secret_here">
  <meta name="env:ENABLE_LIVE_TRADING" content="false">
  <meta name="env:DEFAULT_THEME" content="dark">
  
  <!-- Load the configuration system -->
  <script src="env-loader.js"></script>
  <script src="config.js"></script>
</head>
```

**Option C: Direct Configuration**

Edit `config.js` directly and replace the default values:

```javascript
window.TradingPlatformConfig = {
    api: {
        endpoint: 'https://api.yourservice.com',
        key: 'your_api_key_here',
        secret: 'your_secret_here'
    },
    // ... other settings
};
```

### 2. Deployment on Netlify

**Option A: Using Build Environment Variables**

1. Go to your Netlify site settings
2. Navigate to "Build & deploy" → "Environment"
3. Add your environment variables:
   - `API_KEY`: your_api_key_here
   - `API_SECRET`: your_secret_here
   - etc.

4. Create a build script (optional) or use meta tags approach

**Option B: Using netlify.toml**

Create a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

Then use meta tags or localStorage approach.

### 3. Deployment on Other Platforms (Vercel, GitHub Pages, etc.)

For static hosting platforms:

1. **Meta Tags Approach**: Add meta tags to your HTML
2. **Build-time Replacement**: Use a build tool to replace placeholders
3. **Runtime Configuration**: Use localStorage or URL parameters

### 4. Production Deployment

**Security Best Practices:**

1. **Never commit sensitive data** to your repository
2. **Use environment-specific configurations**:
   - Development: Use `.env.example` values or localStorage
   - Production: Use platform-specific environment variables or secure meta tags

3. **Validate your configuration**:

```javascript
const validation = TradingPlatformConfig.validate();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Configuration Reference

### Available Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- **API_ENDPOINT**: Your trading API endpoint
- **API_KEY**: Your API key (keep secret!)
- **API_SECRET**: Your API secret (keep secret!)
- **ENABLE_LIVE_TRADING**: Enable/disable live trading (true/false)
- **DEFAULT_CURRENCY**: Default currency (USD, EUR, etc.)
- **DEFAULT_THEME**: UI theme (dark/light)

### Using Configuration in Your Code

```javascript
// Get a single value
const apiKey = TradingPlatformConfig.get('api.key');

// Get with default value
const theme = TradingPlatformConfig.get('display.defaultTheme', 'dark');

// Check environment
if (TradingPlatformConfig.isProduction()) {
  // Production-specific code
}

// Check feature flags
if (TradingPlatformConfig.features.crypto) {
  // Enable crypto trading
}
```

## Loading Strategies

The platform supports multiple loading strategies that work together:

1. **Meta Tags** - Load from HTML meta tags
2. **localStorage** - Persistent browser storage
3. **URL Parameters** - Pass config via URL (dev only)
4. **Direct Assignment** - Edit config.js directly

**Priority** (highest to lowest):
1. URL Parameters (`?env.API_KEY=value`)
2. localStorage (`localStorage.getItem('tradingPlatformEnv')`)
3. Meta Tags (`<meta name="env:API_KEY" content="value">`)
4. Default values in `config.js`

## Browser Compatibility

This configuration system works on:

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Opera (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- ✅ Internet Explorer 11+ (with minor limitations)

## Platform Compatibility

This system works on:

- ✅ Windows
- ✅ macOS
- ✅ Linux
- ✅ iOS
- ✅ Android
- ✅ Static hosting platforms (Netlify, Vercel, GitHub Pages, etc.)
- ✅ Server platforms (Node.js, Apache, Nginx, etc.)

## Troubleshooting

### Configuration not loading

1. Check browser console for errors
2. Verify script loading order (env-loader.js before config.js)
3. Check that meta tags have correct format
4. Clear localStorage: `EnvLoader.clearLocalStorage()`

### Values not updating

1. Clear browser cache
2. Clear localStorage
3. Check script loading order
4. Verify variable names match exactly

### Security warnings

1. Never commit `.env` file
2. Don't use URL parameters for sensitive data in production
3. Use HTTPS for all API endpoints
4. Validate all configuration before use

## Examples

### Complete HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trading Platform</title>
    
    <!-- Environment Configuration via Meta Tags -->
    <meta name="env:API_ENDPOINT" content="https://api.example.com">
    <meta name="env:DEFAULT_THEME" content="dark">
    <meta name="env:ENABLE_CRYPTO" content="true">
    
    <!-- Load Configuration System -->
    <script src="env-loader.js"></script>
    <script src="config.js"></script>
</head>
<body>
    <div id="app">Loading...</div>
    
    <script>
        // Use configuration in your app
        console.log('API Endpoint:', TradingPlatformConfig.get('api.endpoint'));
        console.log('Theme:', TradingPlatformConfig.get('display.defaultTheme'));
    </script>
</body>
</html>
```

### Saving Configuration Programmatically

```javascript
// Save user preferences to localStorage
function saveUserConfig() {
    const config = {
        'DEFAULT_THEME': 'dark',
        'DEFAULT_LANGUAGE': 'en',
        'ENABLE_CRYPTO': 'true'
    };
    
    EnvLoader.saveToLocalStorage(config);
    
    // Reload page to apply new config
    window.location.reload();
}
```

## Advanced Usage

### Build-time Variable Replacement

For advanced users, you can use a build tool to replace variables at build time:

```javascript
// In your build script
const fs = require('fs');
const config = fs.readFileSync('config.js', 'utf8');
const replaced = config.replace(/ENV_API_KEY/g, process.env.API_KEY);
fs.writeFileSync('dist/config.js', replaced);
```

### Custom Environment Loader

You can extend the EnvLoader for your specific needs:

```javascript
// Add custom loading logic
EnvLoader.loadFromCustomSource = function() {
    // Your custom logic here
    fetch('/api/config')
        .then(r => r.json())
        .then(config => {
            for (const [key, value] of Object.entries(config)) {
                this.setEnv(key, value);
            }
        });
};
```

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check `.env.example` for available variables
4. Open an issue on GitHub
