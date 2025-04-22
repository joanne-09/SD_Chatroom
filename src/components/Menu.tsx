import React, {useState} from 'react';
import {
  Button,
  styled
} from '@mui/material';
import './Menu.css';

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

interface MenuProps {
  handleSignIn: () => void;
}

class Menu extends React.Component < MenuProps > {
  constructor(props : any) {
    super(props);
  }

  render() {
    const { handleSignIn } = this.props;

    return (
      <div className="Menu">
        <div>
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
            onClick={handleSignIn}
          >
            Get Started
          </MenuButton>
        </div>
      </div>
    );
  }
}

export default Menu;
