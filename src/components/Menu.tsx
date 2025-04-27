import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  styled
} from '@mui/material';
import '../styles/Menu.css';

const MenuButton = styled(Button)({
  width: 'auto',
  fontSize: 16,
  zIndex: 2,
  backgroundColor: '#B97550',
  borderRadius: '50px',
  marginTop: '20px',
  transition: 'marginBottom 3s',
  '&:hover': {
    backgroundColor: '#AF6B46',
    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)',
    transform: 'translateY(-10px)',
    transition: '0.1s',
  }
});

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="Menu">
      <div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          <p>Chatroom</p>
        </div>
        <div className="Nav-bar-Links">
          <a href="/">Home</a>
          <a href="/signIn">Sign In</a>
          <a href="/signUp">Sign Up</a>
        </div>
      </div>

      <div className="Menu-Content">
        <h1 className="Title">
          Start your journey with us
        </h1>

        <MenuButton
          variant='contained'
          onClick={() => {navigate('/signIn')}}
        >
          Get Started
        </MenuButton>
      </div>
    </div>
  );
}

export default Menu;
