import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  styled,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { auth } from '../config';
import { UseUser } from './UserContext';
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
  const { authUser, profile } = UseUser();

  const [ openOption, setOpenOption ] = useState(false);

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
    setOpenOption(false);
  };

  const handleJoinChat = () => {
    // Logic to join an existing chat
    alert("Joining an existing chat...");
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