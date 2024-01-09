import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

export const MessageInput = ({onSendMessage}) => {
  const [newMessage, setNewMessage] = useState('');
  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: 'gray',
      marginRight: 10,
      borderRadius: 5,
      padding: 10,
    },
  });
  const handleInputChange = text => {
    setNewMessage(text);
  };

  const handleSend = () => {
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={handleInputChange}
        placeholder="Type your message..."
      />
      <Button onPress={handleSend} title="Send" />
    </View>
  );
};
