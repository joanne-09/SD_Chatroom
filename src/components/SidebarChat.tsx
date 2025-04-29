import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Drawer,
  Badge,
} from '@mui/material'
import {
  Menu,
  Close,
  Chat,
} from '@mui/icons-material'
import { UseUser } from '../helper/UserContext';
import { getUserRooms, newRoomsAdded } from '../helper/AccessUser';
import { UserRoom } from '../helper/Interface';
import '../styles/SidebarChat.css';

export const SideBar = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  // Toggle Drawer
  const toggleDrawer = () => {
    setOpen(prevState => !prevState);
  }

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
  }, [window.location.pathname]);

  // Sidebar Component
  const sidebar = (
    <>
      <Typography className="sidebar-header">
        {profile ? profile?.name : "Guest"}
      </Typography>

      <Divider />

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
                  setOpen(false);
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
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer}
        className="sidebar-toggle"
        sx={{ display: { sm: 'none' } }}
      >
        <Menu />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        className="sidebar-drawer"
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        <Box className="mobile-sidebar-header">
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Box>
        <Box className="sidebar mobile-sidebar">
          {sidebar}
        </Box>
      </Drawer>

      {/* Desktop sidebar */}
      <Box 
        className="sidebar desktop-sidebar"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        {sidebar}
      </Box>
    </>
  )
}