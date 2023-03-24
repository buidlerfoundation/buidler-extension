# Modify request & response headers (Chrome Extension Manifest V3)

## Solution via Extension

### Clone this project:

```sh
git clone git@github.com:buidlerfoundation/buidler-browser-extension.git
cd buidler-browser-extension
```

### Install dependencies:

```sh
npm install
```

### Add rules:
Edit `src/rules.ts` to define headers modifications.

### Build:

```sh
npm run build
```

### Load extension in browser:

1. Open chrome://extensions/ in Chrome.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `build` folder in this project.
