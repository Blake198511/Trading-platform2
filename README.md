# Trading-platform2

MarketMaster Pro Trading Platform - A fully configured trading application that works with environment variables across all browsers and platforms.

## Features

✅ **Cross-Browser Compatible** - Works on Chrome, Firefox, Safari, Edge, and more  
✅ **Cross-Platform** - Windows, macOS, Linux, iOS, Android  
✅ **Environment Variable Support** - Flexible configuration system  
✅ **Multiple Configuration Methods** - Meta tags, localStorage, direct config  
✅ **Secure** - No sensitive data in code, proper .gitignore  
✅ **Easy Deployment** - Netlify, Vercel, GitHub Pages, or custom server  

## Quick Start

### Option 1: View Demo Locally

1. Open `trader.html` in your browser
2. Configure using the UI or edit configuration files

### Option 2: Deploy to Netlify

1. Drag and drop this folder to [netlify.com](https://netlify.com)
2. Configure environment variables using meta tags or localStorage
3. Get your live URL in 30 seconds!

### Option 3: Configure for Development

1. Copy `.env.example` to `.env`
2. Edit `.env` with your values (for documentation)
3. Configure using one of these methods:
   - **Meta Tags**: Edit `trader.html` and uncomment meta tags
   - **localStorage**: Use the configuration UI in `trader.html`
   - **Direct Config**: Edit `config.js` directly

## Configuration

This platform supports environment variables across all browsers and platforms using three methods:

### Method 1: Meta Tags (Recommended for Deployment)

```html
<!-- Add to trader.html -->
<meta name="env:API_KEY" content="your_api_key_here">
<meta name="env:DEFAULT_THEME" content="dark">
```

### Method 2: localStorage (Recommended for Testing)

```javascript
// Use the UI in trader.html or:
EnvLoader.saveToLocalStorage({
    'API_KEY': 'your_key',
    'DEFAULT_THEME': 'dark'
});
```

### Method 3: Direct Configuration

Edit `config.js` and replace default values.

## Documentation

- **[ENV_SETUP.md](ENV_SETUP.md)** - Complete environment setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions for various platforms
- **[.env.example](.env.example)** - All available configuration options

## File Structure

```
trading-platform2/
├── trader.html              # Main trading application
├── config.js                # Configuration module
├── env-loader.js            # Environment variable loader
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── ENV_SETUP.md             # Setup documentation
├── DEPLOYMENT_GUIDE.md      # Deployment guide
└── README.md                # This file
```

## Available Configuration Options

See `.env.example` for all available options:

- **API Configuration**: API endpoint, key, secret
- **Trading Settings**: Default currency, market, live trading toggle
- **Platform Settings**: App name, version, environment
- **Feature Flags**: Enable/disable crypto, forex, stocks, commodities
- **Display Settings**: Theme, language, investor profiles
- **Analytics**: Enable tracking, analytics ID
- **Third-party Services**: News API, market data API

## Using Configuration in Code

```javascript
// Get API endpoint
const endpoint = TradingPlatformConfig.get('api.endpoint');

// Get with default value
const theme = TradingPlatformConfig.get('display.defaultTheme', 'dark');

// Check environment
if (TradingPlatformConfig.isProduction()) {
    // Production code
}

// Check features
if (TradingPlatformConfig.features.crypto) {
    // Enable crypto trading
}
```

## Browser Compatibility

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Opera (all versions)
- ✅ Mobile browsers
- ✅ Internet Explorer 11+

## Platform Compatibility

- ✅ Netlify
- ✅ Vercel
- ✅ GitHub Pages
- ✅ Apache/Nginx servers
- ✅ Node.js servers
- ✅ Static hosting platforms

## Security

- `.env` file is git-ignored (never committed)
- API keys can be hidden from code
- Supports environment-specific configurations
- Configuration validation included
- Secure defaults for all settings

## Development

```bash
# Start local server
python -m http.server 8000

# Open in browser
http://localhost:8000/trader.html
```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for platform-specific instructions.

## License

MIT License - Feel free to use for personal or commercial projects.

## Support

For issues or questions:
1. Check the documentation ([ENV_SETUP.md](ENV_SETUP.md))
2. Review the deployment guide ([DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))
3. Open an issue on GitHub