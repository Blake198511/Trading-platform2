# Deployment Guide

This guide covers various deployment scenarios for the Trading Platform with environment variable support.

## Table of Contents

1. [Quick Deploy to Netlify](#quick-deploy-to-netlify)
2. [Deploy to Vercel](#deploy-to-vercel)
3. [Deploy to GitHub Pages](#deploy-to-github-pages)
4. [Deploy to Custom Server](#deploy-to-custom-server)
5. [Local Development](#local-development)

---

## Quick Deploy to Netlify

### Method 1: Drag and Drop (Easiest)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag the entire project folder to Netlify's deployment area
3. Wait 30 seconds for deployment
4. **Configure Environment** (choose one):
   - Edit `trader.html` and uncomment the meta tags in the `<head>` section
   - Or edit `config.js` directly with your values
   - Or use localStorage configuration (access `/trader.html` after deployment)

### Method 2: Connect Git Repository

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub/GitLab/Bitbucket repository
4. Configure:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/` (root)
5. Deploy!

### Environment Variables on Netlify

**Option A: Build Environment Variables**
1. In Netlify dashboard, go to Site settings → Build & deploy → Environment
2. Add variables:
   ```
   API_KEY=your_key_here
   API_SECRET=your_secret_here
   ```
3. These are only available during build time
4. You'll need a build script to inject them into your code

**Option B: Meta Tags (Recommended for Netlify)**
1. Edit `trader.html`
2. Uncomment and configure the meta tags:
   ```html
   <meta name="env:API_KEY" content="your_key_here">
   <meta name="env:DEFAULT_THEME" content="dark">
   ```
3. Deploy

**Option C: Configure at Runtime**
1. Deploy the site
2. Visit `/trader.html`
3. Click "Configure with localStorage"
4. Configuration persists in browser

---

## Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy

**Option A: Using CLI**

```bash
cd /path/to/trading-platform
vercel
```

**Option B: Using Git Integration**

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: `.`
4. Deploy!

### Environment Variables on Vercel

1. In Vercel dashboard, go to Settings → Environment Variables
2. Add your variables (they're only available server-side)
3. For client-side config, use meta tags or edit `config.js`

---

## Deploy to GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages"
3. Select source branch (usually `main` or `master`)
4. Select folder: `/ (root)`
5. Save

### Step 2: Configure Environment

Since GitHub Pages is static hosting:

**Option A: Meta Tags**
```html
<!-- In trader.html -->
<meta name="env:API_KEY" content="your_key_here">
```

**Option B: Edit config.js**
```javascript
// In config.js, replace default values
api: {
    endpoint: 'https://api.yourservice.com',
    key: 'your_key_here'
}
```

**Option C: Use localStorage**
1. Deploy the site
2. Visit your GitHub Pages URL
3. Configure via the UI

### Step 3: Access Your Site

Your site will be available at:
```
https://[username].github.io/[repository-name]/trader.html
```

---

## Deploy to Custom Server

### Apache Configuration

1. Upload all files to your web server
2. Ensure `.htaccess` is configured (if needed):

```apache
# .htaccess
RewriteEngine On

# Force HTTPS (recommended)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

3. Configure environment using meta tags or `config.js`

### Nginx Configuration

1. Upload files to your server
2. Configure Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/trading-platform;
    index trader.html;

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "DENY";
    add_header X-XSS-Protection "1; mode=block";

    location / {
        try_files $uri $uri/ =404;
    }
}
```

3. Configure environment using meta tags or `config.js`

---

## Local Development

### Step 1: Clone/Download Repository

```bash
git clone https://github.com/yourusername/trading-platform.git
cd trading-platform
```

### Step 2: Configure Environment

**Option A: Create .env file (for documentation)**

```bash
cp .env.example .env
# Edit .env with your values
```

Note: `.env` file is for documentation only. Browsers can't read it directly.

**Option B: Use Meta Tags**

Edit `trader.html`:
```html
<meta name="env:API_KEY" content="your_dev_key">
<meta name="env:ENABLE_LIVE_TRADING" content="false">
```

**Option C: Use localStorage**

1. Open `trader.html` in browser
2. Click "Configure with localStorage"
3. Edit the configuration in the code or use browser DevTools

### Step 3: Run Local Server

**Option A: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js**
```bash
npx http-server -p 8000
```

**Option C: PHP**
```bash
php -S localhost:8000
```

**Option D: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `trader.html`
3. Select "Open with Live Server"

### Step 4: Access Application

Open browser and navigate to:
```
http://localhost:8000/trader.html
```

---

## Configuration Best Practices

### Development

- Use `.env.example` values or test credentials
- Enable development mode: `ENV_ENVIRONMENT=development`
- Disable live trading: `ENV_ENABLE_LIVE_TRADING=false`
- Use localhost/test API endpoints

### Production

- Use environment-specific configuration
- Enable production mode: `ENV_ENVIRONMENT=production`
- Use HTTPS for all endpoints
- Never commit sensitive data
- Validate configuration before deployment:
  ```javascript
  const validation = TradingPlatformConfig.validate();
  console.log(validation);
  ```

### Security Checklist

- [ ] No sensitive data in Git repository
- [ ] `.env` file is in `.gitignore`
- [ ] Using HTTPS for API endpoints
- [ ] API keys are properly secured
- [ ] Configuration validation is working
- [ ] Error messages don't expose sensitive info
- [ ] Production environment is properly configured

---

## Troubleshooting

### Issue: Configuration Not Loading

**Solution:**
1. Check browser console for errors (F12)
2. Verify script load order: `env-loader.js` before `config.js`
3. Check meta tag format
4. Clear browser cache and localStorage

### Issue: Changes Not Appearing

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Clear localStorage: `EnvLoader.clearLocalStorage()`
4. Check if files are deployed correctly

### Issue: API Not Working

**Solution:**
1. Check API endpoint configuration
2. Verify API keys are correct
3. Check browser console for network errors
4. Ensure CORS is properly configured on API server
5. Validate configuration: `TradingPlatformConfig.validate()`

### Issue: Deployment Platform Not Showing Changes

**Solution:**
1. Clear deployment cache
2. Trigger a fresh deployment
3. Check if files are uploaded correctly
4. Verify configuration files are not being ignored

---

## Platform-Specific Notes

### Netlify
- ✅ Supports environment variables (build-time only)
- ✅ Automatic HTTPS
- ✅ CDN included
- ⚠️ Use meta tags or localStorage for client-side config

### Vercel
- ✅ Supports environment variables (build-time only)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ Use meta tags or localStorage for client-side config

### GitHub Pages
- ✅ Free hosting
- ✅ Automatic HTTPS (for github.io domains)
- ❌ No server-side environment variables
- ✅ Use meta tags or localStorage for all config

### Custom Server
- ✅ Full control
- ✅ Can use server-side environment variables with build process
- ⚠️ Manual HTTPS setup
- ⚠️ Manual security configuration

---

## Next Steps

1. Choose your deployment platform
2. Follow the relevant guide above
3. Configure your environment variables
4. Test the application
5. Share your live URL!

For more detailed configuration options, see [ENV_SETUP.md](ENV_SETUP.md).
