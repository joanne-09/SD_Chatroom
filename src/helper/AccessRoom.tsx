import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    orderBy,
    serverTimestamp,
    updateDoc,
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

                alertFunc(`User ${userId} Room ${roomId} joined successfully!`, 'success');
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

const updateRoomDoc = async (
    roomId: string, 
    data: Partial<ChatroomData>, 
    alertFunc: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) => {
    try {
        const roomRef = doc(firestore, 'chatrooms', roomId);
        const roomSnap = await getDoc(roomRef);
        const roomData = roomSnap.data() as ChatroomData;
        const participants = roomData.participants || [];

        await updateDoc(roomRef, data);
        console.log('Room document updated:', roomId);

        const updateUserRooms = participants.map(async (userId) => {
            const userRef = query(collection(firestore, 'users', userId, 'rooms'), where('roomId', '==', roomId));
            const userSnap = await getDocs(userRef);
            const userDoc = userSnap.docs[0];
            if (userDoc) {
                await updateDoc(doc(firestore, 'users', userId, 'rooms', userDoc.id), {roomName: data.name});
                console.log('User room document updated:', userId);
            }
        })
        await Promise.all(updateUserRooms);

        alertFunc('Room updated successfully!', 'success');
    } catch(error){
        console.error('Error updating room document:', error);
        alertFunc('Error updating room document:' + error, 'error');
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

export {createNewRoom, joinExistRoom, updateRoomDoc, findRoomById};