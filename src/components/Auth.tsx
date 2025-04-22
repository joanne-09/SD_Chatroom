import React, { createContext, useContext, useEffect, useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import config from '../config';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import './Auth.css';

const auth = getAuth(config);

// Sign in page and can link to Sign up
const MainSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User signed in successfully!');
    } catch {
      alert('Error signing in');
    }
  };

  // Sign in and Sign up with Google
  const handleSignInGoogle = () => {
    let provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then((result) => {
      alert('Signed in Successfully!');
    }).catch((error) => {
      alert('Error signing in with Google');
    });
  };

  return(
    <div className='SignIn'>
      <h2>Sign In</h2>
      <div className='totalForm'>
        <div className='form'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>

        <div className='form'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            name='password'
            value={password}
          />
        </div>

        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleSignInGoogle}>Sign In with Google</button>

        <a href='/signUp'>
          Sign Up
        </a>
      </div>
    </div>
  );
}

// Sign up
const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User created successfully!');
    } catch {
      alert('Error creating user');
    }
  };

  return (
    <div className='SignUp'>
      <h2>Sign In</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Name</label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            name='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type='submit'>Register</button>
      </form>
    </div>
  );
};

// User Context


export { MainSignIn, SignUp };