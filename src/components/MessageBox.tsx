import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { UseUser } from '../helper/UserContext';
import { MessageData } from '../helper/Interface';
import { deleteMessage } from '../helper/AccessMessage';
import '../styles/MessageBox.css';

export const MessageBox = (
  { roomId, message }: { roomId: string; message: MessageData }
) => {
  const { authUser } = UseUser();
  const [isHover, setIsHover] = useState(false);

  const handleTimestanp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Invalid date';

    try {
      return timestamp.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  }

  return (
    <div
      key={message.id}
      className={`message-box ${message.senderId === authUser?.uid ? 'sent' : 'received'}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {
        isHover && message.senderId === authUser?.uid && (
          <IconButton
            className='delete-button'
            size='small'
            onClick={() => {
              if(message.id && roomId) {
                deleteMessage(roomId, message.id);
              }
            }}
          >
            <Delete />
          </IconButton>
        )
      }

      <div className='message-content'>
        <p className='sender'>{message.senderEmail}</p>
        <p className='message'>{message.content}</p>
        <p className='timestamp'>
          {handleTimestanp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}