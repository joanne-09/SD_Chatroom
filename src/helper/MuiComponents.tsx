import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  styled,
} from '@mui/material';
import {
  Start,
  AddComment,
} from '@mui/icons-material';
import { UseUser } from './UserContext';
import { addFriendToUser } from './AccessUser';
import {createNewRoom, joinExistRoom} from "./AccessRoom";

export const AccountButton = styled(Button)({
  fontSize: '1em',
  fontWeight: '600',
  textTransform: 'none',
  color: '#4B4F40',
  backgroundColor: 'transparent',
  transition: 'color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    color: '#AF6B46',
    backgroundColor: 'transparent',
    transform: 'scale(1.1)',
  }
});

export const AccountMenu = (
  { handleLogOut }: { handleLogOut: () => void }
) => {
  const { authUser, profile } = UseUser();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const [ dialogOpen, setDialogOpen ] = useState(false);
  const [ email, setEmail ] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const addFriend = () => {
    addFriendToUser(authUser!.uid, email)
      .then(() => {
        alert('Friend added successfully!');
      }).catch((error) => {
        alert('Error adding friend!');
      });
    setEmail('');
  }

  return (
    <div>
      <AccountButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Account
      </AccountButton>
      <Menu
        id="basic-menu"
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleDialogOpen}>Add Friend</MenuItem>
        <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Enter Friend Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={() => {
            // Add friend logic here
            handleDialogClose();
            addFriend();
          }}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

// Start Chat Button Used in ChatHome.tsx
const CustomSpeedDial = styled(SpeedDial)({
  position: 'absolute',
  bottom: 16,
  right: 16,

  '& .MuiFab-primary': {
    backgroundColor: '#AF6B46',
    border: '2px solid #AF6B46',
    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)',

    '&:hover': {
      backgroundColor: '#B97550',
      boxShadow: '6px 6px 6px rgba(0, 0, 0, 0.5)',
    },
  },
})

const actions = [
  { icon: <Start />, name: 'Start New Chat' },
  { icon: <AddComment />, name: 'Join Exist Chat' },
]

export const StartChatButton = () => {
  const { authUser, profile, loading } = UseUser();
  const navigate = useNavigate();

  const [ openOption, setOpenOption ] = useState(false);
  const [ dialogType, setDialogType ] = useState('start');

  const handleClickOpen = () => {
    setOpenOption(true);
  };

  const handleClose = () => {
    setOpenOption(false);
  };

  const handleStartChat = (chatName: string) => {
    if (chatName && authUser) {
      createNewRoom(chatName, authUser.uid).then((roomId) => {
        navigate(`/chatroom/${roomId}`);
      }).catch((error) => {
        alert("Error creating new chat room: " + error.message);
      });
    }
    setOpenOption(false);
  }

  const handleJoinChat = async (chatId: string) => {
    try{
      if (chatId && authUser) {
        joinExistRoom(chatId, authUser.uid).then(() => {
          console.log('Joining the room:', chatId);
          navigate(`/chatroom/${chatId}`);
        }).catch((error) => {
          alert('No room found with this ID!');
        });
      } else {
        alert("Invalid room ID or user not authenticated.");
      }
    }catch(error){
      alert("Error joining chat room: " + error);
    }
    setOpenOption(false);
  }

  return (
    <Box sx={{ 
      transform: 'translateZ(0px)', flexGrow: 1,
      position: 'absolute', bottom: '30px', right: '30px',
    }}>
      <CustomSpeedDial
        ariaLabel="SpeedDial basic example"
        icon={<SpeedDialIcon sx={{ color: '#FFF3EB' }} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              if (action.name === 'Start New Chat') {
                setDialogType('start');
                console.log('Start New Chat clicked');
              } else if (action.name === 'Join Exist Chat') {
                setDialogType('join');
                console.log('Join Exist Chat clicked');
              }
              handleClickOpen();
            }}
          />
        ))}
      </CustomSpeedDial>

      <ChatDialog
        openOption={openOption}
        dialogType={dialogType}
        handleClose={handleClose}
        handleStartChat={handleStartChat}
        handleJoinChat={handleJoinChat}
      />
    </Box>
  );
}

const ChatDialog = (
  { openOption, dialogType, handleClose, handleStartChat, handleJoinChat }: 
  { openOption: boolean; dialogType: string; 
    handleClose: () => void; 
    handleStartChat: (chatName: string) => void; 
    handleJoinChat: (chatId: string) => void; }
) => {
  const [ chatContent, setChatContent ] = useState('');

  return (
    <Dialog
      open={openOption}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >      
      {
        dialogType === 'start' ? (
          <DialogTitle>Enter New Chat Name</DialogTitle>
        ) : (
          <DialogTitle>Enter Existing Chat ID</DialogTitle>
        )
      }
      <DialogContent sx={{ pt: 1 }}>
        <TextField 
          autoFocus
          id='chatContent'
          type='text'
          value={chatContent}
          onChange={(e) => setChatContent(e.target.value)}
          fullWidth
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => {
            handleClose();
            if (dialogType === 'start') {
              handleStartChat(chatContent);
            } else {
              handleJoinChat(chatContent);
            }
        }}>Go</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}