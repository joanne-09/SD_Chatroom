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
    senderId: string,
    senderEmail: string,
    content: string
) => {
    try {
        findRoomById(roomId).then((room) => {
            if (room) {
                if (room.participants.includes(senderId) == false){
                    alert('You are not a participant of this room. Please join the room first.');
                    return;
                }
            }
        }).catch((error) => {
            console.error('Error fetching room:', error);
            alert('Error fetching room:' + error);
            return;
        })

        const messageData: MessageData = {
            senderId,
            senderEmail,
            content,
            timestamp: serverTimestamp(),
        };

        const messageRef = await addDoc(
            collection(firestore, 'chatrooms', roomId, 'messages'),
            messageData
        );
        console.log('Message sent with ID:', messageRef.id);
    } catch (error) {
        alert('Error sending message:' + error);
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

export const getAllMessages = async (roomId: string) => {
    try {
        const messagesRef = collection(firestore, 'chatrooms', roomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const messages: MessageData[] = [];

        messagesSnap.forEach((doc) => {
            messages.push(doc.data() as MessageData);
        });

        return messages;
    } catch (error) {
        alert('Error fetching messages:' + error);
        throw error;
    }
}

export const deleteMessage = async (roomId: string, messageId: string) => {
    const messageRef = doc(firestore, 'chatrooms', roomId, 'messages', messageId);
    try {
        await deleteDoc(messageRef);
        console.log('Message deleted:', messageId);
    } catch (error) {
        alert('Error deleting message:' + error);
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