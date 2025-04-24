import React from 'react';
import { FieldValue, Timestamp } from 'firebase/firestore';
import { UseUser } from '../helper/UserContext';
import { MessageData } from '../helper/Interface';
import './MessageBox.css';

export const MessageBox = (
    {message}: {message: MessageData}
) => {
    const { authUser } = UseUser();

    const handleTimestanp = (timestamp: Timestamp) => {
        if(!timestamp) return 'Invalid date';

        try{
            return timestamp.toDate().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }catch(error){
            console.error('Error formatting timestamp:', error);
            return 'Invalid date';
        }
    }

    return (
        <div 
            key={message.id}
            className={`message-box ${message.senderId === authUser?.uid ? 'sent' : 'received'}`}
        >
            <p className='sender'>{message.senderEmail}</p>
            <p className='message'>{message.content}</p>
            <p className='timestamp'>
                {handleTimestanp(message.timestamp)}
            </p>
        </div>
    );
}