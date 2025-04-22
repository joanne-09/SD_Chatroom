import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  createSvgIcon,
  styled
} from '@mui/material';
import { auth } from '../config';
import { UseUser } from './UserContext';
import './ChatHome.css';

// Button for Start a new Chat
const NewButton = styled(Button)({
  width: '50px',
  height: '50px',
  backgroundColor: '#F0EFEB',
  color: '#606553',
  borderRadius: '10px',
  border: '1px solid #606553',
});

const PlusIcon = createSvgIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>,
  'Plus',
);

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile } = UseUser();

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
        >
          <PlusIcon />
        </NewButton>
      </div>
    </div>
  )
};

export default ChatHome;