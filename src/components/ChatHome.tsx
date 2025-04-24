import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  styled,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { auth } from '../config';
import { ChatroomBlock } from './ChatroomBlock';
import { UseUser } from '../helper/UserContext';
import {createNewRoom, joinExistRoom} from "../helper/AccessRoom";
import { getUserRooms, addNewRooms } from '../helper/AccessUser';
import { UserRoom } from '../helper/Interface';
import './ChatHome.css';

// Button for Start a new Chat
const NewButton = styled(Button)({
  width: '20px',
  height: '50px',
  backgroundColor: '#AF6B46',
  color: '#FFF3EB',
  borderRadius: '10px',
  border: '2px solid #AF6B46',
  boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)',
  position: 'absolute',
  top: '85%',
  left: '90%',
  '&:hover': {
    backgroundColor: '#B97550',
    boxShadow: '6px 6px 6px rgba(0, 0, 0, 0.5)',
    transform: 'translateY(-3px) translateX(-5px)',
    transition: '0.1s',
  },
});

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const [ isLoading, setIsLoading ] = useState(true);
  const [ openOption, setOpenOption ] = useState(false);
  const [ rooms, setRooms ] = useState<UserRoom[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      alert("No authenticated user found.");
      navigate('/');
    }
  }, [authUser, loading, navigate]);

  // Log Out
  const handleLogOut = () => {
    if (!authUser) {
      alert("No user is signed in.");
      return;
    }
    auth.signOut().then(() => {
      alert("User signed out successfully!");
      navigate('/');
    }).catch((error) => {
      alert("Error signing out: " + error.message);
    });
  }

  // Get All Rooms for User
  useEffect(() => {
    const fetchRooms = async () => {
      if (authUser && !loading) {
        const unsubscribe = await addNewRooms(authUser.uid, (rooms: UserRoom[]) => {
          setRooms(rooms);
        });
        return () => unsubscribe();
      }
    };
    fetchRooms();
  }, [authUser, loading]);

  if(loading) {
    return <p>Loading...</p>;
  }

  // Option List when Click on New Button
  const handleClickOpen = () => {
    setOpenOption(true);
  };

  const handleClose = () => {
    setOpenOption(false);
  };

  const handleStartChat = () => {
    // Logic to start a new chat
    alert("Starting a new chat...");
    const roomName = prompt("Enter the name of the new chat room:");
    if (roomName && authUser) {
      createNewRoom(roomName, authUser.uid).then((roomId) => {
        navigate(`/chatroom/${roomId}`);
      }).catch((error) => {
        alert("Error creating new chat room: " + error.message);
      });
    }
    setOpenOption(false);
  };

  const handleJoinChat = async () => {
    // Logic to join an existing chat
    alert("Joining an existing chat...");
    try{
      const roomId = prompt("Enter the ID of the chat room to join:");
      if (roomId && authUser) {
        await joinExistRoom(roomId, authUser.uid);
        console.log('Joining the room:', roomId);
        navigate(`/chatroom/${roomId}`);
      } else {
        alert("Invalid room ID or user not authenticated.");
      }
    }catch(error){
      alert("Error joining chat room: " + error);
    }
    setOpenOption(false);
  };

  return(
    <div className='ChatHome'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {profile ? (
            <p>Welcome, {profile.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          <a onClick={handleLogOut}>Log Out</a>
          <a href='/signIn'>Account</a>
        </div>
      </div>

      <div className='ChatHome-Content'>
        <div className='user-rooms'>
          {
            rooms ? (
              rooms.map((room) => (
                <ChatroomBlock 
                  key={room.id} 
                  room={room} 
                />
              ))
            ) : (
              <p>No rooms Joined.</p>
            )
          }
        </div>

        <NewButton 
          variant='outlined'
          size="large"
          onClick={handleClickOpen}
        >
          <Add fontSize="large"/>
        </NewButton>

        <Dialog
          open={openOption}
          onClose={handleClose}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Start a New Chat</DialogTitle>
          
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleStartChat}
                fullWidth
              >
                Create New Chat Room
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleJoinChat}
                fullWidth
              >
                Join Existing Chat Room
              </Button>
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
};

export default ChatHome;