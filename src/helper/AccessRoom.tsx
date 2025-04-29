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
import { addRoomToUser } from './AccessUser';
import { ChatroomData, UserData } from './Interface';
import { error } from 'console';

// Create a new chatroom
const createNewRoom = async(
    roomName: string, 
    userId: string,
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    try {
        const roomData: ChatroomData = {
            roomId: '',
            name: roomName,
            createdAt: serverTimestamp(),
            admin: [userId],
            participants: [userId],
        };

        const roomRef = await addDoc(collection(firestore, 'chatrooms'), roomData);
        await setDoc(doc(firestore, 'chatrooms', roomRef.id), { roomId: roomRef.id }, { merge: true });

        addRoomToUser(userId, roomRef.id, roomName).then(() => {
            console.log('Room added to user:', userId);
        }).catch((error) => {
            console.error('Error adding room to user:', error);
        });

        console.log('New room created with ID:', roomRef.id);
        return roomRef.id;
    }catch(error){
        alertFunc('Error creating new room:' + error, 'error');
        throw error;
    }
}

const joinExistRoom = async(
    roomId: string, 
    userId: string,
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    try {
        const roomRef = doc(firestore, 'chatrooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if(roomSnap.exists()) {
            const roomData = roomSnap.data();
            const participants = roomData.participants || [];

            if (!participants.includes(userId)) {
                participants.push(userId);
                await setDoc(roomRef, { participants }, { merge: true });

                addRoomToUser(userId, roomId, roomData.name).then(() => {
                    console.log('Room added to user:', userId);
                
                }).catch(error => {
                    console.error('Error adding room to user:', error);
                });

                alertFunc(`Room ${roomId} joined successfully!`, 'success');
            } else {
                alertFunc(`Already in room: ${roomId}`, 'info');
            }
        }else{
            alertFunc('Room does not exist!', 'error');
            console.error('Room does not exist!');
        }
    }catch(error){
        alertFunc('Error joining room:' + error, 'error');
        console.error('Error joining room:', error);
        throw error;
    }
}

const findRoomById = async(roomId: string, alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void) => {
    try {
        if(roomId){
            const roomRef = doc(firestore, 'chatrooms', roomId);
            const roomSnap = await getDoc(roomRef);

            if(roomSnap.exists()) {
                const roomData = roomSnap.data() as ChatroomData;
                return roomData;
            }else{
                alertFunc('Room does not exist!', 'error');
                console.error('Room does not exist!');
                return null;
            }
        }
    }catch(error){
        alertFunc('Error finding room:' + error, 'error');
        console.error('Error finding room:', error);
        throw error;
    }
}

export {createNewRoom, joinExistRoom, findRoomById};