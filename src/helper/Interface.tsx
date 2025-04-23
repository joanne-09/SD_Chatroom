import { FieldValue } from "firebase/firestore";

export interface ChatroomData {
    roomId: string;
    name: string;
    createdAt: FieldValue;
    admin: string[];
    participants: string[];
}

export interface Message {
    senderId: string;
    senderEmail: string;
    content: string;
    timestamp: FieldValue;
}

export interface UserData {
    userId: string;
    name: string;
    email: string;
}