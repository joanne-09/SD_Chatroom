import { useEffect, useState } from 'react';
import { UseAlert } from './CreateAlert';
import { listenAllRooms } from './AccessMessage';
import { findRoomById } from './AccessRoom';
import { UserRoom, MessageData } from './Interface';
import { showNotification } from './ChromeNotification';

// Storage key for unread messages
const UNREAD_MESSAGES_KEY = 'unread_messages';

// Load unread messages from localStorage
export const loadUnreadMessages = (): Record<string, number> => {
  const stored = localStorage.getItem(UNREAD_MESSAGES_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Save unread messages to localStorage
export const saveUnreadMessages = (unreadCounts: Record<string, number>) => {
  localStorage.setItem(UNREAD_MESSAGES_KEY, JSON.stringify(unreadCounts));
};

// Increment unread count for a room
export const incrementUnreadCount = (roomId: string) => {
  const counts = loadUnreadMessages();
  counts[roomId] = (counts[roomId] || 0) + 1;
  saveUnreadMessages(counts);
  return counts;
};

// Reset unread count for a room
export const resetUnreadCount = (roomId: string) => {
  const counts = loadUnreadMessages();
  if (counts[roomId]) {
    counts[roomId] = 0;
    saveUnreadMessages(counts);
  }
  return counts;
};

// Hook for managing unread messages
export const UseUnreadMessages = (
  userId: string | null | undefined,
  rooms: UserRoom[]
) => {
  const { showAlert } = UseAlert();
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(loadUnreadMessages());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Track the active room
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/chatroom\/([^/]+)/);
    if (match) {
      setActiveRoomId(match[1]);
      // Reset unread count for this room
      const newCounts = resetUnreadCount(match[1]);
      setUnreadMessages(newCounts);
    } else {
      setActiveRoomId(null);
    }
  }, [window.location.pathname]);

  // Listen for new messages in all rooms
  useEffect(() => {
    if (!userId || rooms.length === 0) return;

    const unsubscribe = listenAllRooms(
      userId,
      rooms,
      (roomId, newMessage) => {
        // Don't increment count for currently viewed room or user's own messages
        if (roomId === activeRoomId || newMessage.senderId === userId) {
          return;
        }

        // Increment count and update state
        const newCounts = incrementUnreadCount(roomId);
        setUnreadMessages({ ...newCounts });

        const room = rooms.find(r => r.roomId === roomId);

        // Show Chrome Notification
        if(room && room.notification){
          findRoomById(roomId, showAlert).then((room) => {
            if (!room) {
              console.error('Room not found:', roomId);
              return;
            }
            showNotification(roomId, newMessage.senderId, room.name, newMessage);
          });
        }else{
          console.log('Notification is disabled for this room:', roomId);
        }
      }
    );

    return unsubscribe;
  }, [userId, rooms, activeRoomId]);

  // Function to mark a room as read
  const markRoomAsRead = (roomId: string) => {
    const newCounts = resetUnreadCount(roomId);
    setUnreadMessages({ ...newCounts });
  };

  return {
    unreadMessages,
    markRoomAsRead
  };
};