import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Avatar,
  Paper,
} from '@mui/material'
import { UseAlert } from '../helper/CreateAlert';
import { findRoomById } from '../helper/AccessRoom';
import { UserRoom } from '../helper/Interface';
import '../styles/ChatroomBlock.css';

export const ChatroomBlock = (
  { room, unreadCount = 0, onClick }:
    { room: UserRoom, unreadCount?: number, onClick?: () => void }
) => {
  const navigate = useNavigate();
  const { showAlert } = UseAlert();
  const [roomImage, setRoomImage] = useState<string>('');

  useEffect(() => {
    const updateRoomImage = async () => {
      findRoomById(room.roomId, showAlert).then((roomData) => {
        if (roomData) {
          setRoomImage(roomData.roomImage || '');
        } else {
          showAlert('Room not found', 'error');
        }
      });
    }
    updateRoomImage();
  }, [room, showAlert]);

  return (
    <Paper
      key={room.id}
      elevation={3}
      sx={{ borderRadius: '20px' }}
      className="chatroom-block"
      onClick={() => {
        if (onClick) onClick();
        else navigate(`/chatroom/${room.roomId}`);
      }}
    >
      <Avatar
        alt={room.roomName}
        src={roomImage}
        sx={{ width: 60, height: 60 }}
        className='room-avatar'
      >
        {!roomImage && room.roomName.charAt(0).toUpperCase()}
      </Avatar>
      <div className='room-info'>
          <p className='room-name'>{room.roomName}</p>
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        <p className='room-id'>{room.roomId}</p>
      </div>
    </Paper>
  )
}