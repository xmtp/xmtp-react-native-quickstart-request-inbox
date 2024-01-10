# RN Example for IOS

https://github.com/fabriguespe/xmtp-rn-request-inbox/blob/9aab1dbf32003674565c5b0915d567fef896f9ba/video.mp4

### Prerequisites

- Node.js
- npm or Yarn
- React Native CLI
- Xcode (for iOS)

### Installation Steps

#### 1. Initialize React Native Project

If you haven't already created a React Native project, start by initializing one:

```bash
npx react-native init xmtprn
```

#### 2. Install Expo Modules

Install the latest Expo modules:

```bash
npx install-expo-modules@latest
```

#### 3. Install XMTP React Native SDK

Install the XMTP React Native SDK using npm:

```bash
npm install @xmtp/react-native-sdk
```

#### 4. Update Podfile for iOS

Update the Podfile to set the minimum iOS platform. Open the `Podfile` in your iOS directory and modify the platform line:

```ruby
platform :ios, '16.0'
```

#### 5. Update Xcode Target

Ensure your Xcode project's target is updated to iOS 16.0 or higher.

#### 6. Add Babel Plugin

Install the Babel plugin required for the XMTP SDK:

```bash
npm add @babel/plugin-proposal-export-namespace-from
```

#### 7. Configure Babel

Update your Babel configuration. Open your `babel.config.js` and add the plugin:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['@babel/plugin-proposal-export-namespace-from'],
};
```

#### 8. Install iOS Pods

Navigate to the iOS directory and install the necessary pods:

```bash
cd ios && pod install && cd ..
```

#### 9. Start the Application

Finally, start your React Native application:

```bash
npm run ios
```

## Troubleshooting

**Resolving Buffer Issues with Ethers.js**

Ethers.js relies on the Buffer class, which is a global object in Node.js but not available in the React Native environment. To resolve this, you need to polyfill Buffer.

1. **Install the Buffer Package:**

   If you haven't already, install the `buffer` package using npm:

   ```bash
   npm install buffer
   ```

2. **Polyfill Buffer:**

   In the entry point of your application, such as `index.js`, add Buffer to the global scope:

   ```jsx
   global.Buffer = global.Buffer || require('buffer').Buffer;
   ```
