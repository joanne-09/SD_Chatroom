import {firestore} from '../config';
import { 
    addDoc, 
    collection, 
    getDoc, 
    getDocs,
    setDoc,
    doc,
    query, 
    where,
    onSnapshot,
} from 'firebase/firestore';
import { UserData, UserRoom } from './Interface';
import { callbackify } from 'util';

export const createUserData = async (userId: string, name: string, email: string) => {
    const userData: UserData = {
        userId,
        name,
        email,
    };
    const userRef = await addDoc(collection(firestore, 'users'), userData);
    return userRef.id;
}

export const getUserById = async (userId: string) => {
    try{
        const userQuery = query(collection(firestore, 'users'), where('userId', '==', userId));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
            const userDoc = userSnap.docs[0];
            return userDoc.data() as UserData;
        } else {
            return null;
        }
    }catch(error){
        console.error('Error fetching user by user id:', error);
        return null;
    }
}

export const getUserByEmail = async (email: string) => {
    try{
        const userQuery = query(collection(firestore, 'users'), where('email', '==', email));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
            const userDoc = userSnap.docs[0];
            console.log('User data:', userDoc.data());
            return userDoc.data() as UserData;
        } else {
            return null;
        }
    }catch(error){
        console.error('Error fetching user by email:', error);
        return null;
    }
}

export const addRoomToUser = async (userId: string, roomId: string, roomName: string) => {
    try {
        const userRef = query(collection(firestore, 'users'), where('userId', '==', userId));
        const userSnap = (await getDocs(userRef)).docs[0];
        const userRoom = collection(firestore, 'users', userSnap.id, 'rooms');

        const roomData: UserRoom = {
            roomId,
            roomName,
        };
        const roomRef = await addDoc(userRoom, roomData);
        console.log('Room added to user:', roomId);
    }catch(error){
        console.error('Error adding room to user:', error);
        throw error;
    }
}

export const getUserRooms = async (userId: string) => {
    try{
        getUserById(userId).then((userData) => {
            if(userData){
                const rooms = userData.rooms || [];
                return rooms;
            }else{
                console.log('User not found!');
                return null;
            }
        }).catch((error) => {
            console.error('Error fetching user data:', error);
            return null;
        });
    }catch(error){
        console.error('Error fetching user rooms:', error);
        return null;
    }
}

export const addNewRooms = async (userId: string, callback: (rooms: UserRoom[]) => void) => {
    const userRef = query(collection(firestore, 'users'), where('userId', '==', userId));
    const userSnap = (await getDocs(userRef)).docs[0];
    const roomRef = collection(firestore, 'users', userSnap.id, 'rooms');

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        const rooms: UserRoom[] = [];
        snapshot.forEach((doc) => {
            rooms.push({
                id: doc.id,
                ...doc.data() as UserRoom,
            })
        });
        callback(rooms);
    }, (error) => {
        console.error('Error listening for new rooms:', error);
    });

    return unsubscribe;
}