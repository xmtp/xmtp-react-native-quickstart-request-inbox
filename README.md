# Add consent to an existing XMTP inbox

Managing user consent is essential for enhancing privacy and the user experience. Providing user consent features in your app gives your users better control over who can send them messages.

If you already have an XMTP app, integrating portable consent features becomes crucial. This guide walks you through adding consent logic to your app.

## Considerations

Before diving into the code let's consider important aspects while integrating consent features. For example, before making an allow or block action you should synchronize the updated consent list in order to **prevent overwriting network** consent from another app. For more details head to these sections of our docs:

- [Understand user consent preferences](https://xmtp.org/docs/build/user-consent#understand-user-consent-preferences): Here are some of the ways user consent preferences are set
- [Use consent preferences to respect user intent](https://xmtp.org/docs/build/user-consent#use-consent-preferences-to-respect-user-intent): Your app should aim to handle consent preferences appropriately because they are an expression of user intent.
- [Synchronize user consent preferences](https://xmtp.org/docs/build/user-consent#synchronize-user-consent-preferences):All apps that use the user consent feature must adhere to the logic described in this section to keep the consent list on the network synchronized with local app user consent preferences, and vice versa.

## Installation Steps

See [installation steps](https://junk-range-possible-git-portableconsenttutorials-xmtp-labs.vercel.app/docs/tutorials/portable-consent/request-inbox-rn)

## Tutorial

- [Initialize XMTP Client with Consent](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

- [Filtering conversations based on consent](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

- [Request inbox](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

- [Refresh consent when opening a conversation](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

- [Allow and denied actions](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

- [Updating consent on message send](https://docs.xmtp.org/docs/tutorials/portable-consent/request-inbox-rn#tutorial)

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
