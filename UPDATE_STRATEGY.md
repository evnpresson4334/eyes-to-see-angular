# Eyes to See - Auto-Update Strategy

## How Updates Work

The app uses Angular's Service Worker (NGSW) to automatically update without requiring users to uninstall and reinstall.

### Update Flow

1. **Service Worker Installation**: When the app first loads, the service worker caches all app files
2. **Periodic Checks**: The app checks for updates:
   - When the app starts
   - Every 6 hours automatically
3. **Update Detection**: If a new version is available, a notification appears
4. **User Action**: The user can click "Update Now" or dismiss the notification
5. **Installation**: When "Update Now" is clicked:
   - The new version is activated
   - The page reloads with the new code
   - Users see the latest features and fixes

### What Gets Updated

- App code and JavaScript
- All assets (icons, splash screens, logos)
- Manifest and configuration files
- Cached resources

### For Installed PWA Apps

When the app is installed as a PWA:
- The app will check for updates in the background
- If an update is available, the notification appears at the bottom of the screen
- Users have the choice to update immediately or dismiss

### Browser Handling

- **Chrome/Edge**: Updates are downloaded in the background and applied on demand
- **Firefox**: Updates are checked periodically
- **Safari**: Updates follow iOS app update mechanisms

## Testing Updates

To test the update feature locally:

1. Make a change to the app (e.g., update a color, text, or icon)
2. Run `npm run build`
3. Reload the app in your browser
4. The update notification should appear after the new service worker is detected

## Cache Management

The service worker caches:
- **App files**: All `.js`, `.css`, `.html` files (prefetched on install)
- **Assets**: Images, fonts, SVG files (lazy loaded as needed)

Cache is updated automatically when a new version is deployed.

