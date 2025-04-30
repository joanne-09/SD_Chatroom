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
    updateDoc,
} from 'firebase/firestore';
import { UserData, UserRoom, UserFriend } from './Interface';

export const createUserData = async (userId: string, name: string, email: string) => {
    const userData: UserData = {
        userId,
        name,
        email,
    };
    
    await setDoc(doc(firestore, 'users', userId), userData);
    return userId;
}

export const getUserById = async (userId: string) => {
    try{
        const userSnap = await getDoc(doc(firestore, 'users', userId));

        if (userSnap.exists()) {
            return userSnap.data() as UserData;
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

export const updateUserData = async (userId: string, data: Partial<UserData>) => {
    try{
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, data);
        console.log('User data updated:', userId);
    }catch(error){
        console.error('Error updating user data:', error);
        throw error;
    }
}

export const addRoomToUser = async (userId: string, roomId: string, roomName: string) => {
    try {
        const userRoom = collection(firestore, 'users', userId, 'rooms');

        const roomData: UserRoom = {
            roomId,
            roomName,
            notification: true,
        };
        const roomRef = await addDoc(userRoom, roomData);
        console.log('Room added to user:', roomId);
    }catch(error){
        console.error('Error adding room to user:', error);
        throw error;
    }
}

export const newRoomsAdded = async (userId: string, callback: (rooms: UserRoom[]) => void) => {
    const roomRef = collection(firestore, 'users', userId, 'rooms');

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

export const getUserRoomById = async (userId: string, roomId: string) => {
    try{
        const roomRef = query(collection(firestore, 'users', userId, 'rooms'), where('roomId', '==', roomId));
        const roomSnap = await getDocs(roomRef);

        if (!roomSnap.empty) {
            console.log('Room data:', roomSnap.docs[0].data());
            const roomDoc = roomSnap.docs[0];
            return roomDoc.data() as UserRoom;
        } else {
            return null;
        }
    }catch(error){
        console.error('Error fetching user room by id:', error);
        return null;
    }
}

const friendAlreadyExists = async (userId: string, friendEmail: string) => {
    try {
        const userFriend = collection(firestore, 'users', userId, 'friends');
        const friendQuery = query(userFriend, where('friendEmail', '==', friendEmail));
        const friendSnap = await getDocs(friendQuery);

        return !friendSnap.empty;
    } catch (error) {
        console.error('Error checking if friend already exists:', error);
        return false;
    }
}

export const addFriendToUser = async (userId: string, friendEmail: string) => {
    try {
        const userFriend = collection(firestore, 'users', userId, 'friends');

        getUserByEmail(friendEmail).then((friendData) => {
            if(friendData){
                const friendId = friendData.userId;
                const friendName = friendData.name || 'Unknown User';

                friendAlreadyExists(userId, friendEmail).then((exists) => {
                    if(exists){
                        console.log('Friend already exists!');
                        return;
                    }else{
                        const newFriend: UserFriend = {
                            friendId,
                            friendEmail,
                            friendName,
                        }
                        addDoc(userFriend, newFriend);

                        getUserById(userId).then((userData) => {
                            if(userData){
                                addFriendToUser(friendId, userData.email);
                            }
                        });

                        console.log('Friend added to user:', friendId);
                    }
                })
            }else{
                console.log('User not found!');
            }
        }).catch((error) => {
            console.error('Error fetching friend data:', error);
        });
    }catch(error){
        console.error('Error adding friend to user:', error);
        throw error;
    }
}

export const newFriendsAdded = async (userId: string, callback: (friends: UserFriend[]) => void) => {
    const friendRef = collection(firestore, 'users', userId, 'friends');

    const unsubscribe = onSnapshot(friendRef, (snapshot) => {
        const friends: UserFriend[] = [];
        snapshot.forEach((doc) => {
            friends.push({
                id: doc.id,
                ...doc.data() as UserFriend,
            })
        });
        callback(friends);
    }, (error) => {
        console.error('Error listening for new friends:', error);
    });

    return unsubscribe;
}

export const updateNotification = async (
    userId: string,
    roomId: string,
    enable: boolean,
) => {
    try {
        const roomRef = collection(firestore, 'users', userId, 'rooms');
        const roomQuery = query(roomRef, where('roomId', '==', roomId));
        const roomSnap = await getDocs(roomQuery);

        if (!roomSnap.empty) {
            const roomDoc = roomSnap.docs[0];
            await updateDoc(roomDoc.ref, { notification: enable });
            console.log('Notification updated for room:', roomId);
        } else {
            console.error('Room not found for user:', userId);
        }

    }catch(error){
        console.error('Error updating notification:', error);
        throw error;
    }
}