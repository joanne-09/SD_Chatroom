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
import { MessageData } from './Interface';
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
                    alert('You are not a participant of this room. Please join the room first.');
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

export const newMessageDeleted = (roomId: string, callback: (messageId: string) => void) => {
    const messageRef = collection(firestore, 'chatrooms', roomId, 'messages');
    const messageQuery = query(messageRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
        const messages: MessageData[] = [];
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'removed') {
                callback(change.doc.id);
            }
        })
    }, (error) => {
        console.error('Error listening messages:', error);
    });

    return unsubscribe;
}