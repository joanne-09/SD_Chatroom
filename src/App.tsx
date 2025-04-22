import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Menu from './components/Menu'
import {MainSignIn, SignUp} from "./components/Auth";
import ChatHome from "./components/ChatHome";
import { UserChange } from './components/UserContext';

const App = () => {
  return (
    <UserChange>
      <div className="App">
        <Router>
          <Routes>
            <Route element={<Menu />} path={'/'}></Route>
            <Route element={<MainSignIn />} path={'/signIn'}></Route>
            <Route element={<SignUp />} path={'/signUp'}></Route>
            <Route element={<ChatHome />} path={'/chatHome'}></Route>
          </Routes>
        </Router>
      </div>
    </UserChange>
  );
};

export default App;
