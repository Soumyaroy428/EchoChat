import { useEffect, useState } from 'react';
import { messageApi } from '../services/messageApi';
import { socket } from '../lib/socket';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export const useChat = (currentContactId: string | null, token: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && socket) {
      socket.auth = { token };
      socket.connect();

      const handleMessage = (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
      };

      socket.on('message_received', handleMessage);

      return () => {
        socket.off('message_received', handleMessage);
        socket.disconnect();
      };
    }
  }, [token]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentContactId || !token) return;
      
      try {
        setIsLoading(true);
        const history = await messageApi.getHistory(currentContactId, token);
        setMessages(history);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentContactId, token]);

  const sendMessage = (content: string) => {
    if (!currentContactId || !content.trim()) return;

    if (socket && socket.connected) {
      socket.emit('send_message', {
        receiverId: currentContactId,
        content: content,
      }, (response: any) => {
        if (response.error) {
          console.error('Error sending message:', response.error);
        } else {
          console.log('Message sent successfully', response.message);
        }
      });
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
};
