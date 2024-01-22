import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ListConversations = ({searchTerm, selectConversation}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('allowed');
  const [conversations, setConversations] = useState([]);
  const [allowedConversations, setAllowedConversations] = useState([]);
  const [requestConversations, setRequestConversations] = useState([]);
  const {client} = useXmtp();
  const bottomOfList = useRef(null);

  const styles = StyleSheet.create({
    conversationListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      backgroundColor: '#f0f0f0',
      padding: 10,
    },
    conversationDetails: {},
    conversationName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    messagePreview: {
      fontSize: 14,
      color: '#666',
    },
    conversationTimestamp: {
      fontSize: 12,
      color: '#999',
      width: '25%',
      textAlign: 'right',
    },
  });
  useEffect(() => {
    const getActiveTabFromStorage = async () => {
      try {
        const storedActiveTab = await AsyncStorage.getItem('@activeTab');
        if (storedActiveTab !== null) {
          setActiveTab(storedActiveTab);
        }
      } catch (e) {
        // reading error
        console.error('Failed to read the active tab from storage', e);
      }
    };

    getActiveTabFromStorage();
  }, []);

  const setActiveTabWithStorage = async tab => {
    setActiveTab(tab);
    try {
      await AsyncStorage.setItem('@activeTab', tab);
    } catch (e) {
      // saving error
      console.error('Failed to save the active tab to storage', e);
    }
  };
  useEffect(() => {
    let isMounted = true;
    let stream;
    let timer;
    const fetchAndStreamConversations = async () => {
      setLoading(true);
      const allConversations = await client.conversations.list();
      const sortedConversations = allConversations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setConversations(sortedConversations);

      setLoading(false);
      client.conversations.stream(conversation => {
        console.log('Streamed conversation:', conversation);
        if (isMounted) {
          setConversations(prevConversations => {
            const newConversations = [...prevConversations, conversation];
            return newConversations.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          });
        }
      });

      // Delay scrolling to the bottom to allow the layout to update
      timer = setTimeout(() => {
        if (isMounted && bottomOfList.current) {
          bottomOfList.current.scrollToEnd({animated: false});
        }
      }, 0);
    };

    fetchAndStreamConversations();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (stream) stream.return();
    };
  }, []);

  useEffect(() => {
    // Filtering
    const fetchConversations = async () => {
      const filteredConversations = conversations.filter(
        conversation =>
          conversation?.peerAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          conversation?.peerAddress !== client.address,
      );
      const allowed = await Promise.all(
        conversations.map(async conversation => {
          const consentState = await conversation.consentState();
          return consentState === 'allowed' ? conversation : null;
        }),
      ).then(results => results.filter(Boolean));

      //Denied conversations are filtered out
      const requests = await Promise.all(
        filteredConversations.map(async conversation => {
          const consentState = await conversation.consentState();
          return consentState === 'unknown' ? conversation : null;
        }),
      ).then(results => results.filter(Boolean));

      setAllowedConversations(allowed);
      setRequestConversations(requests);
    };
    fetchConversations();
  }, [searchTerm, client.address, conversations]); // Now depends on searchTerm and client.address

  return (
    <View>
      {activeTab === 'requests' ? (
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
      )}
      {(activeTab === 'allowed' || !activeTab) &&
        allowedConversations.map((conversation, index) => (
          <TouchableOpacity
            key={index}
            style={styles.conversationListItem}
            onPress={() => {
              selectConversation(conversation);
            }}>
            <ScrollView ref={bottomOfList} style={styles.conversationDetails}>
              <Text style={styles.conversationName}>
                {conversation.peerAddress.substring(0, 6) +
                  '...' +
                  conversation.peerAddress.substring(
                    conversation.peerAddress.length - 4,
                  )}
              </Text>
              <Text style={styles.messagePreview}>...</Text>
            </ScrollView>
            <Text style={styles.conversationTimestamp}>
              {getRelativeTimeLabel(conversation.createdAt)}
            </Text>
          </TouchableOpacity>
        ))}
      {activeTab === 'requests' &&
        requestConversations.map((conversation, index) => (
          <TouchableOpacity
            key={index}
            style={styles.conversationListItem}
            onPress={() => {
              selectConversation(conversation);
            }}>
            <ScrollView ref={bottomOfList} style={styles.conversationDetails}>
              <Text style={styles.conversationName}>
                {conversation.peerAddress.substring(0, 6) +
                  '...' +
                  conversation.peerAddress.substring(
                    conversation.peerAddress.length - 4,
                  )}
              </Text>
              <Text style={styles.messagePreview}>...</Text>
            </ScrollView>
            <Text style={styles.conversationTimestamp}>
              {getRelativeTimeLabel(conversation.createdAt)}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const getRelativeTimeLabel = dateString => {
  const diff = new Date() - new Date(dateString);
  const diffMinutes = Math.floor(diff / 1000 / 60);
  const diffHours = Math.floor(diff / 1000 / 60 / 60);
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
};
