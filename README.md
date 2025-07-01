# More Clouds

The internet, now with more clouds. This little p5 scene started as the background to Whisper and Hal's website. More Clouds is inspired by d0n.xyz's 'more plants' extension, More Clouds replaces the background of any page with little fluffy clouds floating by.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `resonant-love` folder
4. The extension will automatically activate on all websites

## Features

- Animated floating clouds behind every webpage
- All page elements become 85% transparent with a subtle blur effect
- Text remains readable with enhanced shadows
- Responsive to window resizing
- Works on all websites

## How it works

The extension injects:

- A p5.js-powered cloud animation canvas behind all page content
- CSS that makes webpage backgrounds transparent while preserving readability
- Animated clouds that drift across the screen continuously

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main cloud animation logic
- `styles.css` - Transparency and styling rules
- `cloud.png` - Cloud image asset
- `clouds.html` - Original standalone cloud animation (for reference)

Enjoy browsing the web on clouds! ☁️✨
