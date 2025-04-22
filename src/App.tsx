import React from 'react';
import Menu from './components/Menu'
import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {MainSignIn, SignUp} from "./components/Auth";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route element={<Menu />} path={'/'}></Route>
        <Route element={<MainSignIn />} path={'/signIn'}></Route>
        <Route element={<SignUp />} path={'/signUp'}></Route>
      </Routes>
    </div>
  );
};

export default App;
