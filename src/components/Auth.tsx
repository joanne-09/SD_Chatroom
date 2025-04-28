import React, { createContext, useContext, useEffect, useState} from 'react';
import {auth, database} from '../config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { createUserData, getUserByEmail } from '../helper/AccessUser'
import { SignInPage, SignUpPage } from '../helper/MuiComponents';
import '../styles/Auth.css';

// Sign in page and can link to Sign up
const MainSignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string) => {
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
      await handleAddNewGoogleUser(result.user);

      alert('Signed in Successfully!');
      navigate('/chatHome');
    }).catch((error) => {
      alert('Error signing in with Google');
    });
  };

  const handleAddNewGoogleUser = async (user: any) => {
    try {
      const userData = await getUserByEmail(user.email);
      if (!userData) {
        await createUserData(user.uid, user.displayName, user.email);
        console.log('User data created successfully!');
      }
    }catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  return(
    <div className='SignIn'>
      <SignInPage 
        handleSignIn={handleSignIn}
        handleSignInGoogle={handleSignInGoogle}
      />
    </div>
  );
}

// Sign up
const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      createUserData(auth.currentUser?.uid!, name, email);
      alert('User created successfully!');
      navigate('/chatHome');
    } catch {
      alert('Error creating user');
    }
  };

  return (
    <div className='SignUp'>
      <SignUpPage 
        handleSignUp={handleSignUp}
      />
    </div>
  );
};

export { MainSignIn, SignUp };