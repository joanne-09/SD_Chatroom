import {firestore} from '../config';
import { 
    addDoc, 
    collection, 
    getDoc, 
    getDocs,
    doc,
    query, 
    where,
} from 'firebase/firestore';
import { UserData } from './Interface';

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