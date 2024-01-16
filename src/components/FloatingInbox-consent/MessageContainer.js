import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {useXmtp} from '@xmtp/react-native-sdk';
import {View, Text, ScrollView, Alert, StyleSheet, Button} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
  },
  popup: {
    width: '100%',
    backgroundColor: 'rgba(211, 211, 211, 0.3)', // lightgrey with transparency
    padding: 10,
  },
  popupInner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  popupButton: {
    borderRadius: '12px', // Rounded corners
  },
  acceptButton: {
    backgroundColor: 'blue', // Blue background
  },
  blockButton: {
    backgroundColor: 'red', // Red background
  },
  popupTitle: {
    textAlign: 'center',
  },
});

export const MessageContainer = ({
  conversation,
  searchTerm,
  selectConversation,
}) => {
  const isFirstLoad = useRef(true);
  const {client} = useXmtp();
  const bottomOfList = useRef(null);
  const [showPopup, setShowPopup] = useState(null);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateMessages = (prevMessages, newMessage) => {
    const doesMessageExist = prevMessages.some(
      existingMessage => existingMessage.id === newMessage.id,
    );

    if (!doesMessageExist) {
      return [...prevMessages, newMessage];
    }

    return prevMessages;
  };

  useEffect(() => {
    let stream;
    let isMounted = true;
    let timer;
    const fetchMessages = async () => {
      if (conversation && conversation.peerAddress && isFirstLoad.current) {
        setIsLoading(true);
        const initialMessages = await conversation?.messages();

        //Consent state
        const consentState = await conversation.consentState();
        setShowPopup(consentState === 'unknown');

        let updatedMessages = [];
        for (const message of initialMessages) {
          updatedMessages = await updateMessages(updatedMessages, message);
        }

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
      }
      // Delay scrolling to the bottom to allow the layout to update
      timer = setTimeout(() => {
        if (isMounted && bottomOfList.current) {
          bottomOfList.current.scrollToEnd({animated: false});
        }
      }, 0);
    };

    fetchMessages();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (stream) stream.return();
    };
  }, [conversation]);

  useEffect(() => {
    const startMessageStream = async () => {
      conversation.streamMessages(message => {
        console.log('Streamed message:', message);
        setMessages(prevMessages => {
          return updateMessages(prevMessages, message);
        });
      });
    };

    startMessageStream();
  }, []);

  useEffect(() => {
    if (bottomOfList.current) {
      bottomOfList.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleSendMessage = async newMessage => {
    if (!newMessage.trim()) {
      Alert.alert('Empty message');
      return;
    }
    if (conversation && conversation.peerAddress) {
      // Refresh the consent list to ensure it's up-to-date
      await client.contacts.refreshConsentList();
      // Update the consent state to "allowed"
      await client.contacts.allow([conversation.peerAddress]);
      // Send the message
      await conversation.send(newMessage);
    } else if (conversation) {
      const conv = await client.conversations.newConversation(searchTerm);
      selectConversation(conv);
      await conv.send(newMessage);
    }
  };

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

  return (
    <>
      {isLoading ? (
        <Text>Loading messages...</Text>
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.messagesContainer} ref={bottomOfList}>
            {messages.slice().map(message => {
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
          </ScrollView>
          {showPopup ? (
            <View style={styles.popup}>
              <Text style={styles.popupTitle}>Do you trust this contact?</Text>
              <View style={styles.popupInner}>
                <Button
                  title="Accept"
                  style={{...styles.popupButton, ...styles.acceptButton}}
                  onPress={handleAccept}
                />
                <Button
                  title="Block"
                  style={{...styles.popupButton, ...styles.blockButton}}
                  onPress={handleBlock}
                  color="red"
                />
              </View>
            </View>
          ) : null}
          <MessageInput
            onSendMessage={msg => {
              handleSendMessage(msg);
            }}
          />
        </View>
      )}
    </>
  );
};
