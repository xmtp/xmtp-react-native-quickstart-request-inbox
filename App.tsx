import React from 'react';
import {SafeAreaView} from 'react-native';
import {FloatingInbox} from './src/components/FloatingInbox-consent/index.js';
import {XmtpProvider} from '@xmtp/react-native-sdk';

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <XmtpProvider>
        <FloatingInbox />
      </XmtpProvider>
    </SafeAreaView>
  );
}

export default App;
