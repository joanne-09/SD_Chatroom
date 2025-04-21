import React, {useState} from 'react';
import {
  Button,
  styled
} from '@mui/material';
import SignUp from './components/SignIn';
import './App.css';

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

function App() {
  const [signUp, setSignUp] = useState(false);

  return (
    <div className="App">
      {signUp && <SignUp />}

      <div className="App-header">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="Nav-bar">
        Nav Bar
      </div>

      <div className="Menu-Content">
        <h1 className="Title">
          Start your journey with us
        </h1>

        <MenuButton
          variant='contained'
          onClick = {() => setSignUp(true)}
        >
          Get Started
        </MenuButton>
      </div>
    </div>
  );
}

export default App;
