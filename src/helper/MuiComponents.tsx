import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
} from '@mui/material';
import { UseUser } from './UserContext';
import { addFriendToUser } from './AccessUser';
import { set } from 'firebase/database';

export const CreateAlert = (
  { message, type }: { message: string, type: 'success' | 'error' }
) => {
  return (
    <Alert severity={type}>
      {message}
    </Alert>
  );
}

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
  const navigate = useNavigate();
  const { authUser, profile } = UseUser();
  const [ showAlert, setShowAlert ] = useState(false);
  const [ alertMessage, setAlertMessage ] = useState('');
  const [ alertType, setAlertType ] = useState<'success' | 'error'>('success');

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

  // Create custom Alert
  const displayAlert = (message: string, type: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  }

  const addFriend = () => {
    addFriendToUser(authUser!.uid, email)
      .then(() => {
        displayAlert('Friend added successfully!', 'success');
      }).catch((error) => {
        displayAlert('Error adding friend!', 'error');
      });
    setEmail('');
  }

  return (
    <div>
      {showAlert && <CreateAlert message={alertMessage} type={alertType} />}

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