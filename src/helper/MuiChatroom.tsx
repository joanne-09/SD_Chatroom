import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
} from '@mui/material'
import { UseUser } from './UserContext';
import { getUserRooms, newRoomsAdded } from './AccessUser';
import { UserRoom } from './Interface';
import '../styles/MuiChatroom.css';

export const SideBar = () => {
  const navigate = useNavigate();
  const { authUser, loading } = UseUser();

  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  // Check if user is authenticated
  if (!authUser && !loading) {
    alert("No authenticated user found.");
    navigate('/');
  }

  // Get All Rooms for User
  useEffect(() => {
      const fetchRooms = async () => {
        if (authUser && !loading) {
          const unsubscribe = await newRoomsAdded(authUser.uid, (rooms: UserRoom[]) => {
            setRooms(rooms);
            setIsLoading(false);
          });
          return () => unsubscribe();
        }else{
          setIsLoading(true);
        }
      };
      fetchRooms();
    }, [authUser, loading]);

  // Get current roomId
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/chatroom\/([^/]+)/);
    if (match) {
      const roomId = match[1];
      setActiveRoom(roomId);
    } else {
      setActiveRoom(null);
    }
  })

  return (
    <Box className="sidebar">
      <List className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <ListItem 
              key={room.roomId} 
              disablePadding 
              className={`room-item ${room.roomId === activeRoom ? 'active' : ''}`}
            >
              <ListItemButton 
                onClick={() => {
                  navigate(`/chatroom/${room.roomId}`);
                  setActiveRoom(room.roomId);
                }}
              >
                <ListItemText 
                  primary={room.roomName} 
                  secondary={room.roomId}
                  className="room-text"
                />
                {(room.unreadCount ?? 0) > 0 && (
                  <Badge badgeContent={room.unreadCount} color="error" className="unread-badge" />
                )}
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem className="no-rooms">
            <ListItemText primary="No conversations yet" />
          </ListItem>
        )}
      </List>
    </Box>
  )
}