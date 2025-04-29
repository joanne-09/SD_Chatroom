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
  Avatar,
  Autocomplete,
  TextField,
} from '@mui/material'
import {
  Menu,
  Close,
  Chat,
  Add,
} from '@mui/icons-material'
import { UseUser } from '../helper/UserContext';
import { UseAlert } from '../helper/CreateAlert';
import { newRoomsAdded, newFriendsAdded } from '../helper/AccessUser';
import { joinExistRoom } from '../helper/AccessRoom';
import { UserRoom, UserFriend } from '../helper/Interface';
import '../styles/SidebarChat.css';
import { join } from 'path';

export const SideBar = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();
  const { showAlert } = UseAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [friends, setFriends] = useState<UserFriend[]>([]);
  const [friendEmail, setFriendEmail] = useState<string>('');

  const [open, setOpen] = useState(false);

  // Toggle Drawer
  const toggleDrawer = () => {
    setOpen(prevState => !prevState);
  }

  // Check if user is authenticated
  if (!authUser && !loading) {
    showAlert("No authenticated user found.", "error");
    setTimeout(() => {navigate('/')}, 1500);
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
    }, [authUser, loading]
  );

  // Get All Friends for User
  useEffect(() => {
    const fetchFriends = async () => {
      if (authUser && !loading) {
        const unsubscribe = await newFriendsAdded(authUser.uid, (friends: UserFriend[]) => {
          setFriends(friends);
          setIsLoading(false);
        });
        return () => unsubscribe();
      }
    };
    fetchFriends();
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
                <Avatar className="room-avatar">
                  {room.roomName?.charAt(0).toUpperCase() || <Chat />}
                </Avatar>
                <ListItemText 
                  primary={room.roomName} 
                  secondary={room.roomId}
                  className="room-text"
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem className="no-rooms">
            <ListItemText primary="No conversations yet" />
          </ListItem>
        )}
      </List>

      <Divider />
      
      <Box
        className="Add-Friends"
      >
        <Autocomplete 
          disablePortal
          options={friends.map((friend) => friend.friendEmail)}
          renderInput={(params) => <TextField {...params} label="Add Friends" />}
          fullWidth
          value={friendEmail}
          onChange={(event, value) => {
            setFriendEmail(value || '');
          }}
        />
        <IconButton
          className="add-friend-button"
          onClick={() => {
            if (!friendEmail) {
              alert("Please select a friend to add.");
              return;
            }
            const friendId = friends.find(friend => friend.friendEmail === friendEmail)?.friendId;
            if(activeRoom && friendId) {
              joinExistRoom(activeRoom, friendId, showAlert);
            }
            setFriendEmail('');
          }}
        >
          <Add />
        </IconButton>
      </Box>
      
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