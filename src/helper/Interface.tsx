import { FieldValue, Timestamp } from "firebase/firestore";

export interface ChatroomData {
    roomId: string;
    name: string;
    createdAt: any;
    admin: string[];
    participants: string[];
    messages?: MessageData[];
}

export interface MessageData {
    id?: string;
    senderId: string;
    senderEmail: string;
    content: string;
    timestamp: any;
}

export interface UserData {
    id?: string;
    userId: string;
    name: string;
    email: string;
    rooms?: UserRoom[];
    friends?: UserFriend[];
}

export interface UserRoom {
    id?: string;
    roomId: string;
    roomName: string;
}

export interface UserFriend {
    id?: string;
    friendId: string;
    friendEmail: string;
    friendName: string;
}