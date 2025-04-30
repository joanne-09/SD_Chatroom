import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  styled
} from '@mui/material';
import { UseAlert } from '../helper/CreateAlert';
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
  const { showAlert } = UseAlert();

  // Request Chrome Notification permission
  const requestNotification = async () => {
    if(!("Notification" in window)) {
      showAlert("This browser does not support desktop notifications.", "error");
      return false;
    }

    if(Notification.permission === "granted") {
      localStorage.setItem("notificationsEnabled", "true");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      localStorage.setItem('notificationsEnabled', granted ? 'true' : 'false');
      
      if (granted) {
        showAlert("Notifications enabled!", "success");
      } else {
        showAlert("Notification permission denied. You won't receive alerts for new messages.", "info");
      }
      
      return granted;
    }
    
    return false;
  }

  useEffect(() => {
    requestNotification();
  }, []);

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
