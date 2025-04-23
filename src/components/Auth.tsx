import React, { createContext, useContext, useEffect, useState} from 'react';
import {auth, database} from '../config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { ref, push, get, query, orderByChild, equalTo } from 'firebase/database';
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

    signInWithPopup(auth, provider).then(async (result) => {
      const user = result.user;
      await handleAddNewGoogleUser(user);

      alert('Signed in Successfully!');
      navigate('/chatHome');
    }).catch((error) => {
      alert('Error signing in with Google');
    });
  };

  const handleAddNewGoogleUser = async (user: any) => {
    try {
      const userRef = ref(database, 'user-data');
      const checkUser = await get(userRef);

      if(checkUser.exists()){
        const allUsers = checkUser.val();
        const matchingUserKey = Object.keys(allUsers).find(
          key => allUsers[key].email === user.email
        );

        if (matchingUserKey) {
          const matchingUser = allUsers[matchingUserKey];
        }else{
          const newUser = {
            userId: user.uid,
            name: user.displayName,
            email: user.email,
          };
          push(userRef, newUser);
        }
      }
    }catch (error) {
      console.error('Error saving user data:', error);
    }
  }

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
        userId: auth.currentUser?.uid,
        name: name,
        email: email,
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