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
const createNewRoom = async(roomName: string, userId: string) => {
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

                addRoomToUser(userId, roomId, roomData.name).then(() => {
                    console.log('Room added to user:', userId);
                
                }).catch(error => {
                    console.error('Error adding room to user:', error);
                });

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
            const roomSnap = await getDoc(roomRef);

            if(roomSnap.exists()) {
                const roomData = roomSnap.data() as ChatroomData;
                return roomData;
            }else{
                alert('Room does not exist!');
                return null;
            }
        }
    }catch(error){
        alert('Error finding room:' + error);
        throw error;
    }
}

export {createNewRoom, joinExistRoom, findRoomById};