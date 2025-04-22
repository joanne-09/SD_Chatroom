import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UseUser } from './UserContext';
import './ChatHome.css';
import { auth } from '../config';

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
    </div>
  )
};

export default ChatHome;