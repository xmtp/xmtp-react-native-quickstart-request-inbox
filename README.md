# How to Add Consent to an Existing XMTP App

Managing user consent is essential for enhancing privacy and user experience. If you already have an XMTP application, integrating portable consent features becomes crucial. This guide walks you through adding the consent logic to your existing XMTP app.

https://github.com/fabriguespe/xmtp-rn-request-inbox/assets/1447073/993606d8-5170-4688-b5ec-36658862641a

## Considerations

Before diving into the code let's consider important aspects while integrating consent features. For example, before making an allow or block action you should synchronize the updated consent list in order to **prevent overwriting network** consent from another app. For more details head to these sections of our docs:

- [Understand user consent preferences](https://xmtp.org/docs/build/user-consent#understand-user-consent-preferences): Here are some of the ways user consent preferences are set
- [Use consent preferences to respect user intent](https://xmtp.org/docs/build/user-consent#use-consent-preferences-to-respect-user-intent): Your app should aim to handle consent preferences appropriately because they are an expression of user intent.
- [Synchronize user consent preferences](https://xmtp.org/docs/build/user-consent#synchronize-user-consent-preferences):All apps that use the user consent feature must adhere to the logic described in this section to keep the consent list on the network synchronized with local app user consent preferences, and vice versa.

## Quickstart

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

### Initialize XMTP Client with Consent

Here's your existing `initXmtpWithKeys` function, updated to include the consent refresh logic.

```jsx
const initXmtpWithKeys = async function () {
  // ... previous code
  const xmtp = await Client.create(wallet);
  // Add these lines to refresh the consent list
  await xmtp.contacts.refreshConsentList();
};
```

#### Filtering conversations based on consent

Using the `consentState` property of the conversation object, you can filter the conversations based on consent.

```jsx
const allowed = await Promise.all(
  conversations.map(async conversation => {
    const consentState = await conversation.consentState();
    return consentState === 'allowed' ? conversation : null;
  }),
).then(results => results.filter(Boolean));

const requests = await Promise.all(
  filteredConversations.map(async conversation => {
    const consentState = await conversation.consentState();
    return consentState === 'unknown' || consentState === 'denied'
      ? conversation
      : null;
  }),
).then(results => results.filter(Boolean));
```

#### Request inbox

You can now create a separate inbox for requests. This inbox will only show the conversations that have not been allowed yet.

```jsx
{
  activeTab === 'requests' ? (
    <TouchableOpacity
      style={styles.conversationListItem}
      onPress={() => setActiveTabWithStorage('allowed')}>
      <Text style={styles.conversationName}>← Allowed</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.conversationListItem}
      onPress={() => setActiveTabWithStorage('requests')}>
      <Text style={styles.conversationName}>Requests →</Text>
    </TouchableOpacity>
  );
}
```

#### Allow and denied actions

Every time you open a conversation on the request tab you can show a popup with the allow and deny actions. You can use the `consentState` property of the conversation object to show the popup only when the consent state is `unknown`.

```jsx
// Inside your MessageContainer component
const [showPopup, setShowPopup] = useState(
  conversation.consentState === 'unknown',
);

// Function to handle the acceptance of a contact
const handleAccept = async () => {
  // Allow the contact
  await client.contacts.allow([conversation.peerAddress]);
  // Hide the popup
  setShowPopup(false);
  // Refresh the consent list
  await client.contacts.refreshConsentList();
  // Log the acceptance
  console.log('accepted', conversation.peerAddress);
};

// Function to handle the blocking of a contact
const handleBlock = async () => {
  // Block the contact
  await client.contacts.deny([conversation.peerAddress]);
  // Hide the popup
  setShowPopup(false);
  // Refresh the consent list
  await client.contacts.refreshConsentList();
  // Log the blocking
  console.log('denied', conversation.peerAddress);
};
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

## Caution :warning:

**Always synchronize consent states:** Before updating consent preferences on the network, ensure you refresh the consent list with `await xmtp.contacts.refreshConsentList();`. Update the network's consent list only in these scenarios:

- **User Denies Contact:** Set to `denied` if a user blocks or unsubscribes.
- **User Allows Contact:** Set to `allowed` if a user subscribes or enables notifications.
- **Legacy Preferences:** Align the network with any existing local preferences.
- **User Response:** Set to `allowed` if the user has engaged in conversation.

Neglecting these guidelines can result in consent state conflicts and compromise user privacy.

## Conclusion

Consent has really evolved through the years. It started with email, then email marketing, and was the wild west until laws like GPDR stepped in. This is new chapter in the history of consent in a new era for privacy, portability, and ownership.
