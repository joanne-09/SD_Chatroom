import React from 'react';
import { UseUser } from './UserContext';
import './ChatHome.css';
import { auth } from '../config';

const ChatHome = () => {
  const { authUser, profile } = UseUser();

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
          <a href="/">Log Out</a>
          <a href="/signIn">Account</a>
        </div>
      </div>
    </div>
  )
};

export default ChatHome;