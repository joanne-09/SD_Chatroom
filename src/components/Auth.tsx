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
import { UseAlert } from '../helper/CreateAlert';
import { SignInPage, SignUpPage } from '../helper/MuiAuth';
import '../styles/Auth.css';

// Sign in page and can link to Sign up
const MainSignIn = () => {
  const navigate = useNavigate();
  const { showAlert } = UseAlert();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert('User signed in successfully!', 'success');
      setTimeout(() => {navigate('/chatHome')}, 1500);
    } catch {
      showAlert('Error signing in', 'error');
    }
  };

  // Sign in and Sign up with Google
  const handleSignInGoogle = () => {
    let provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then(async (result) => {
      await handleAddNewGoogleUser(result.user);

      showAlert('User signed in successfully!', 'success');
      setTimeout(() => {navigate('/chatHome')}, 1500);
    }).catch((error) => {
      showAlert('Error signing in with Google', 'error');
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
  const { showAlert } = UseAlert();

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      createUserData(auth.currentUser?.uid!, name, email);
      showAlert('User signed up successfully!', 'success');
      setTimeout(() => {navigate('/chatHome')}, 1500);
    } catch {
      showAlert('Error creating user', 'error');
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