import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config';
import { Grid } from '@mui/material';
import { ChatroomBlock } from './ChatroomBlock';
import { Loading } from './Loading';
import { UseUser } from '../helper/UserContext';
import { UseUnreadMessages } from '../helper/UnreadMessages';
import { newRoomsAdded, addFriendToUser } from '../helper/AccessUser';
import { listenAllRooms } from '../helper/AccessMessage';
import { UserRoom } from '../helper/Interface';
import { UseAlert } from '../helper/CreateAlert';
import { AccountMenu, StartChatButton } from '../helper/MuiComponents';
import '../styles/ChatHome.css';
import { clear } from 'console';

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading, clearUserContext } = UseUser();
  const { showAlert } = UseAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<UserRoom[]>([]);

  const { unreadMessages, markRoomAsRead } = UseUnreadMessages(authUser?.uid, rooms);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      showAlert("No authenticated user found.", "error");
      setTimeout(() => {navigate('/')}, 1500);
    }
  }, [authUser, loading, navigate]);

  // Log Out
  const handleLogOut = async () => {
    if (!authUser) {
      showAlert("No user is signed in.", "error");
      return;
    }

    setRooms([]);
    if(clearUserContext) clearUserContext();

    await new Promise(resolve => setTimeout(resolve, 100));

    auth.signOut().then(() => {
      showAlert("User signed out successfully!", "success");
      setTimeout(() => {navigate('/')}, 500);
    }).catch((error) => {
      showAlert("Error signing out" + error.message, "error");
    });
  }

  // Add Friend To User
  const addFriend = (email: string) => {
    addFriendToUser(authUser!.uid, email)
      .then(() => {
        showAlert('Friend added successfully!', 'success');
      }).catch((error) => {
        showAlert('Error adding friend: ' + error.message, 'error');
      });
  }

  // Get All Rooms for User
  useEffect(() => {
    let unsubscribe: () => void = () => {};

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

    return () => unsubscribe();
  }, [authUser, loading]);

  // Reset unread count when navigating to a room
  const handleRoomClick = (roomId: string) => {
    navigate(`/chatroom/${roomId}`);
    markRoomAsRead(roomId);
  };

  if (isLoading || loading) {
    return <Loading />;
  }

  return (
    <div className='ChatHome'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {profile ? (
            <p>{profile.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          <AccountMenu
            handleLogOut={handleLogOut}
            addFriend={addFriend}
          />
        </div>
      </div>

      <div className='ChatHome-Content'>
        <Grid container className='user-rooms' spacing={2}>
          {
            rooms ? (
              rooms.map((room) => (
                <Grid key={room.id} sx={{xs: 12, sm: 6}}>
                  <ChatroomBlock
                    key={room.id}
                    room={room}
                    unreadCount={unreadMessages[room.roomId] || 0}
                    onClick={() => handleRoomClick(room.roomId)}
                  />
                </Grid>
              ))
            ) : (
              <Grid sx={{xs: 12}}>
                <p>No rooms Joined.</p>
              </Grid>
            )
          }
        </Grid>

        <StartChatButton
          alertFunc={showAlert}
        />
      </div>
    </div>
  )
};

export default ChatHome;