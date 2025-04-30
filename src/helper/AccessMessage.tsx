import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { auth, firestore } from '../config';
import { MessageData, UserRoom } from './Interface';
import { findRoomById } from './AccessRoom';

export const sendMessage = async (
    roomId: string,
    message: MessageData,
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    try {
        findRoomById(roomId, alertFunc).then((room) => {
            if (room) {
                if (room.participants.includes(message.senderId) == false){
                    alertFunc('You are not a participant of this room. Please join the room first.', 'error');
                    return;
                }
            }
        }).catch((error) => {
            console.error('Error fetching room:', error);
            alertFunc('Error fetching room:' + error, 'error');
            return;
        })

        const messageData: MessageData = {
            senderId: message.senderId,
            senderEmail: message.senderEmail,
            content: message.content,
            messageType: message.messageType,
            gifUrl: message.gifUrl || '',
            timestamp: serverTimestamp(),
        };

        const messageRef = await addDoc(
            collection(firestore, 'chatrooms', roomId, 'messages'),
            messageData
        );
        console.log('Message sent with ID:', messageRef.id);
    } catch (error) {
        alertFunc('Error sending message:' + error, 'error');
        throw error;
    }
}

export const newMessageAdded = (roomId: string, callback: (messages: MessageData[]) => void) => {
    const messageRef = collection(firestore, 'chatrooms', roomId, 'messages');
    const messageQuery = query(messageRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
        const messages: MessageData[] = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data() as MessageData,
            });
        });
        callback(messages);
    }, (error) => {
        console.error('Error listening messages:', error);
    });

    return unsubscribe;
}

// Add this new function after your other exports
export const listenAllRooms = (
    userId: string,
    rooms: UserRoom[],
    callback: (roomId: string, newMessage: MessageData) => void
) => {
    // Store all unsubscribe functions
    const unsubscribeFunctions: (() => void)[] = [];
    
    // Create a listener for each room
    rooms.forEach(room => {
        const roomId = room.roomId;
        const messageRef = collection(firestore, 'chatrooms', roomId, 'messages');
        
        // We only need the newest message, limit to 1
        const messageQuery = query(
            messageRef, 
            orderBy('timestamp', 'desc'),
            // limit(1) // Uncomment if you want to limit to just the latest message
        );
        
        // Track the last message ID we've seen
        let lastMessageId: string | null = null;
        
        const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
            // Check if we have new documents
            if (!snapshot.empty) {
                const newestDoc = snapshot.docs[0];
                const newestMessage = {
                    id: newestDoc.id,
                    ...newestDoc.data() as MessageData
                };
                
                // Only notify if this is a new message (not when listener first connects)
                if (lastMessageId !== null && lastMessageId !== newestMessage.id && newestMessage.senderId !== userId) {
                    // Call the callback with the room ID and new message
                    callback(roomId, newestMessage);
                }
                
                // Update the last message ID
                lastMessageId = newestMessage.id;
            }
        }, (error) => {
            console.error(`Error listening for messages in room ${roomId}:`, error);
        });
        
        unsubscribeFunctions.push(unsubscribe);
    });
    
    // Return a function to unsubscribe from all listeners
    return () => {
        unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
};

export const getAllMessages = async (
    roomId: string, 
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    try {
        const messagesRef = collection(firestore, 'chatrooms', roomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const messages: MessageData[] = [];

        messagesSnap.forEach((doc) => {
            messages.push(doc.data() as MessageData);
        });

        return messages;
    } catch (error) {
        alertFunc('Error fetching messages:' + error, 'error');
        throw error;
    }
}

export const deleteMessage = async (
    roomId: string, 
    messageId: string,
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    const messageRef = doc(firestore, 'chatrooms', roomId, 'messages', messageId);
    try {
        await deleteDoc(messageRef);
        console.log('Message deleted:', messageId);
    } catch (error) {
        alertFunc('Error deleting message:' + error, 'error');
        throw error;
    }
}