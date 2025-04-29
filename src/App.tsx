import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Menu from './components/Menu'
import {MainSignIn, SignUp} from "./components/Auth";
import ChatHome from "./components/ChatHome";
import Chatroom from './components/Chatroom';
import UserProfile from './components/UserProfile';
import { UserChange } from './helper/UserContext';
import { AlertProvider } from './helper/CreateAlert';

const App = () => {
  return (
    <UserChange>
      <AlertProvider>
        <div className="App">
          <Router>
            <Routes>
              <Route element={<Menu />} path={'/'}></Route>
              <Route element={<MainSignIn />} path={'/signIn'}></Route>
              <Route element={<SignUp />} path={'/signUp'}></Route>
              <Route element={<ChatHome />} path={'/chatHome'}></Route>
              <Route element={<UserProfile />} path={'/profile'}></Route>
              <Route element={<Chatroom />} path={'/chatroom/:roomId'}></Route>
            </Routes>
          </Router>
        </div>
      </AlertProvider>
    </UserChange>
  );
};

export default App;
