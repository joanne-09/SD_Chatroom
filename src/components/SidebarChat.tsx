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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
} from '@mui/material'
import {
  Menu,
  Close,
  Chat,
  Add,
  Settings,
} from '@mui/icons-material'
import { UseUser } from '../helper/UserContext';
import { UseAlert } from '../helper/CreateAlert';
import { newRoomsAdded, newFriendsAdded } from '../helper/AccessUser';
import { joinExistRoom, updateRoomDoc } from '../helper/AccessRoom';
import { ProfileImage, getImageData } from '../helper/AccessImage';
import { listenAllRooms } from '../helper/AccessMessage';
import { UserRoom, UserFriend, ChatroomData, MessageData } from '../helper/Interface';
import '../styles/SidebarChat.css';

export const SideBar = (
  { refresh }:
    { refresh: () => void }
) => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();
  const { showAlert } = UseAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [roomImages, setRoomImages] = useState<Record<string, string | null>>({});
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('');

  const [roomNotificationsEnabled, setRoomNotificationsEnabled] = useState<Record<string, boolean>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  const [friends, setFriends] = useState<UserFriend[]>([]);
  const [friendEmail, setFriendEmail] = useState<string>('');

  const [open, setOpen] = useState(false);

  const [settings, setSettings] = useState(false);

  // Toggle Drawer
  const toggleDrawer = () => {
    setOpen(prevState => !prevState);
  }

  // Check if user is authenticated
  if (!authUser && !loading) {
    showAlert("No authenticated user found.", "error");
    setTimeout(() => { navigate('/') }, 1500);
  }

  // Load all room images
  const loadRoomImage = async (roomId: string) => {
    try {
      const image = await getImageData('roomcover', roomId);
      setRoomImages(prevImages => ({
        ...prevImages,
        [roomId]: image || null,
      }));
    } catch (error) {
      console.error('Error fetching room image:', error);
    }
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
      } else {
        setIsLoading(true);
      }
    };
    fetchRooms();
  }, [authUser, loading]);

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
      setActiveRoomName(rooms.find(room => room.roomId === roomId)?.roomName || null);
      setRoomName(activeRoomName || '');
    } else {
      setActiveRoom(null);
      setActiveRoomName(null);
      setRoomName('');
    }
  }, [window.location.pathname]);

  // Get room images
  useEffect(() => {
    if (rooms.length > 0) {
      rooms.forEach(room => {
        loadRoomImage(room.roomId);
      });
    }
  }, [rooms]);

  // Sidebar Component
  const sidebar = (
    <>
      <Typography className="sidebar-header">
        {profile ? profile?.name : "Guest"}

        <IconButton
          className="settings-button"
          onClick={() => {
            // Refresh the room name from the current active room
            if (activeRoom) {
              const currentRoom = rooms.find(room => room.roomId === activeRoom);
              if (currentRoom) {
                setActiveRoomName(currentRoom.roomName);
                setRoomName(currentRoom.roomName);
                loadRoomImage(activeRoom);
              }
            }
            setSettings(true);
          }}
          aria-label="settings"
          sx={{ color: 'var(--color-button-orange)' }}
        >
          <Settings />
        </IconButton>
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
                  setActiveRoomName(room.roomName);
                  setRoomName(room.roomName);
                  setOpen(false);

                  setUnreadMessages(prev => ({ ...prev, [room.roomId]: 0 }));
                }}
              >
                <Avatar
                  className="room-avatar"
                  src={roomImages[room.roomId] || ''}
                >
                  {!roomImages[room.roomId] && (room.roomName?.charAt(0).toUpperCase() || <Chat />)}
                </Avatar>
                <ListItemText
                  primary={room.roomName}
                  secondary={room.roomId}
                  className="room-text"
                />
                {unreadMessages[room.roomId] > 0 && (
                  <Badge badgeContent={unreadMessages[room.roomId]} color="error" />
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
              showAlert("Please select a friend to add.", "error");
              return;
            }
            const friendId = friends.find(friend => friend.friendEmail === friendEmail)?.friendId;
            if (activeRoom && friendId) {
              joinExistRoom(activeRoom, friendId, showAlert);
            }
            setFriendEmail('');
          }}
        >
          <Add />
        </IconButton>
      </Box>

      <Dialog
        open={settings}
        onClose={() => setSettings(false)}
        className="settings-dialog"
      >
        <DialogTitle>
          {`${activeRoomName} Settings` || "Settings"}
        </DialogTitle>

        <DialogContent className="settings-content">
          <ProfileImage
            type="roomcover"
            roomId={activeRoom || ''}
            onImageUpdate={(imageUrl) => {
              setRoomImages(prevImages => ({
                ...prevImages,
                [activeRoom || '']: imageUrl,
              }));
              refresh();
            }}
          />

          <TextField
            label="Room Name"
            variant="standard"
            fullWidth
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
            }}
          />
        </DialogContent>

        <DialogActions className="settings-actions">
          <Button onClick={() => setSettings(false)} color="primary">
            Close
          </Button>
          <Button
            onClick={() => {
              const data: Partial<ChatroomData> = {
                name: roomName,
              };
              if (activeRoom) {
                updateRoomDoc(activeRoom, data, showAlert)
                  .then(() => {
                    setActiveRoomName(roomName);
                    setRoomName(roomName);

                    setRooms(prevRooms =>
                      prevRooms.map(room =>
                        room.roomId === activeRoom
                          ? { ...room, roomName: roomName }
                          : room
                      )
                    );

                    refresh()
                  });
              }
              setSettings(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
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