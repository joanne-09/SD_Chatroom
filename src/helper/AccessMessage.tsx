import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { auth, firestore } from '../config';
import { MessageData } from './Interface';

export const sendMessage = async (
    roomId: string,
    senderId: string,
    senderEmail: string,
    content: string
) => {
    try {
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