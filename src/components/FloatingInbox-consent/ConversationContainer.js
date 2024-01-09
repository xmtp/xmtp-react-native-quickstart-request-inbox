import React, {useState} from 'react';
import {ethers} from 'ethers';
import {MessageContainer} from './MessageContainer';
import {ListConversations} from './ListConversations';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';

const styles = StyleSheet.create({
  conversations: {
    height: '100%',
  },
  conversationList: {
    padding: 0,
    margin: 0,
    listStyle: 'none',
    overflowY: 'scroll',
  },
  conversationListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0,
    border: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginTop: 0,
    transition: 'background-color 0.3s ease',
  },
  conversationDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '75%',
    marginLeft: 10,
    overflow: 'hidden',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  conversationTimestamp: {
    fontSize: 12,
    color: '#999',
    width: '25%',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  createNewButton: {
    border: 1,
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  peerAddressInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
  },
});

export const ConversationContainer = ({
  selectedConversation,
  setSelectedConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {client} = useXmtp();
  const [peerAddress, setPeerAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [conversationFound, setConversationFound] = useState(false);
  const [createNew, setCreateNew] = useState(false);

  const selectConversation = async conversation => {
    console.log('selectConversation', conversation.peerAddress);
    setSelectedConversation(conversation);
  };

  const isValidEthereumAddress = address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearchChange = async e => {
    setCreateNew(false);
    setConversationFound(false);
    setSearchTerm(e);
    console.log('handleSearchChange', e);
    setMessage('Searching...');
    const addressInput = e;
    const isEthDomain = /\.eth$/.test(addressInput);
    let resolvedAddress = addressInput;
    if (isEthDomain) {
      setLoadingResolve(true);
      try {
        const provider = new ethers.providers.CloudflareProvider();
        resolvedAddress = await provider.resolveName(resolvedAddress);
      } catch (error) {
        console.log(error);
        setMessage('Error resolving address');
        setCreateNew(false);
      } finally {
        setLoadingResolve(false);
      }
    }
    console.log(
      'resolvedAddress',
      resolvedAddress,
      isValidEthereumAddress(resolvedAddress),
    );
    if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
      processEthereumAddress(resolvedAddress);
      setSearchTerm(resolvedAddress); // <-- Add this line
    } else {
      setMessage('Invalid Ethereum address');
      setPeerAddress(null);
      setCreateNew(false);
      //setCanMessage(false);
    }
  };

  const processEthereumAddress = async address => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage('No self messaging allowed');
      setCreateNew(false);
      setCanMessage(false);
    } else {
      console.log('address', address, await client?.canMessage(address));
      const canMessageStatus = await client?.canMessage(address);
      if (canMessageStatus) {
        setPeerAddress(address);
        setCanMessage(true);
        setMessage('Address is on the network ✅');
        setCreateNew(true);
      } else {
        setCanMessage(false);
        setMessage('Address is not on the network ❌');
        setCreateNew(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={{textAlign: 'center', fontSize: 'small'}}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <>
      {!selectedConversation && (
        <View style={styles.conversationList}>
          <TextInput
            type="text"
            placeholder="Enter a 0x wallet or ENS address"
            value={searchTerm}
            editable
            onChangeText={text => handleSearchChange(text)}
            style={styles.peerAddressInput}
          />
          {loadingResolve && searchTerm && <Text>Resolving address...</Text>}
          <ListConversations
            searchTerm={searchTerm}
            selectConversation={setSelectedConversation}
            onConversationFound={state => {
              setConversationFound(state);
              if (state === true) setCreateNew(false);
            }}
          />
          {message && conversationFound !== true && <Text>{message}</Text>}
          {peerAddress && canMessage && (
            <Button
              title="Create new conversation"
              style={styles.createNewButton}
              onPress={() => {
                setSelectedConversation({messages: []});
              }}
            />
          )}
        </View>
      )}
      {selectedConversation && (
        <MessageContainer
          conversation={selectedConversation}
          searchTerm={searchTerm}
          selectConversation={selectConversation}
        />
      )}
    </>
  );
};
