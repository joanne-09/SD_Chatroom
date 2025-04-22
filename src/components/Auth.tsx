import React, { createContext, useContext, useEffect, useState} from 'react';
import {auth, database} from '../config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { ref, push, set } from 'firebase/database';
import { useNavigate } from "react-router-dom";
import './Auth.css';

// Sign in page and can link to Sign up
const MainSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User signed in successfully!');
      navigate('/chatHome');
    } catch {
      alert('Error signing in');
    }
  };

  // Sign in and Sign up with Google
  const handleSignInGoogle = () => {
    let provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      try {
        const userRef = ref(database, 'user-data');
        const newUser = {
          name: user.displayName,
          email: user.email,
          password: null,
        };
        push(userRef, newUser);
      }catch (error) {
        console.error('Error saving user data:', error);
      }

      alert('Signed in Successfully!');
      navigate('/chatHome');
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
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        
        <button onClick={handleSignIn}>
          Sign In
        </button>
        <button onClick={handleSignInGoogle}>
          Sign In with Google
        </button>

        <a href='/signUp'>Sign Up</a>
        <a href='/'>Back to Home</a>
      </div>
    </div>
  );
}

// Sign up
const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      let newUser = {
        name: name,
        email: email,
        password: password,
      }
      let userData = ref(database, 'user-data')
      push(userData, newUser);
      alert('User created successfully!');
      navigate('/chatHome');
    } catch {
      alert('Error creating user');
    }
  };

  return (
    <div className='SignUp'>
      <h2>Sign Up</h2>
      <div>
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

        <button onClick={handleSignUp}>
          Register
        </button>
        
        <a href='/'>Back to Home</a>
      </div>
    </div>
  );
};

export { MainSignIn, SignUp };