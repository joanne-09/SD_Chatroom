import {
    collection,
    addDoc,
    getDoc,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from '../config';
import { Chatroom } from './Interface';

// Create a new chatroom
const createNewRoom = async(roomName: string, userId: string) => {
    try {
        const roomData: Chatroom = {
            roomId: '',
            name: roomName,
            createdAt: serverTimestamp(),
            admin: [userId],
            participants: [userId],
        };

        const roomRef = await addDoc(collection(firestore, 'chatrooms'), roomData);
        await setDoc(doc(firestore, 'chatrooms', roomRef.id), { roomId: roomRef.id }, { merge: true });
        console.log('New room created with ID:', roomRef.id);
        return roomRef.id;
    }catch(error){
        alert('Error creating new room:' + error);
        throw error;
    }
}

const joinExistRoom = async(roomId: string, userId: string) => {
    try {
        const roomRef = doc(firestore, 'chatrooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if(roomSnap.exists()) {
            const roomData = roomSnap.data();
            const participants = roomData.participants || [];

            if (!participants.includes(userId)) {
                participants.push(userId);
                await setDoc(roomRef, { participants }, { merge: true });
                alert(`Added to room: ${roomId}`);
            } else {
                alert(`Already in room: ${roomId}`);
            }
        }else{
            alert('Room does not exist!');
        }
    }catch(error){
        alert('Error joining room:' + error);
        throw error;
    }
}

const findRoomById = async(roomId: string) => {
    try {
        if(roomId){
            const roomRef = doc(firestore, 'chatrooms', roomId);
            
            getDoc(roomRef).then((roomSnap) => {
                if(roomSnap.exists()) {
                    const roomData = roomSnap.data();
                    console.log('Room data:', roomData);
                    return roomData;
                } else {
                    console.log('No such room!');
                }
            }).catch((error) => {
                console.error('Error getting room:', error);
            });
        }
        return null;
    }catch(error){
        alert('Error finding room:' + error);
        throw error;
    }
}

const getUserRooms = async(userId: string) => {
    try {
        const roomQuery = query(
            collection(firestore, 'chatrooms'),
            where('participants', 'array-contains', userId),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(roomQuery, (querySnapshot) => {
            const rooms: any[] = [];
            querySnapshot.forEach((doc) => {
                rooms.push({ id: doc.id, ...doc.data() });
            });
            console.log('User rooms:', rooms);
        });
        return unsubscribe;
    }catch(error){
        alert('Error getting user rooms:' + error);
        throw error;
    }
}

export {createNewRoom, getUserRooms, joinExistRoom, findRoomById};