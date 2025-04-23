import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import { firestore } from '../config';
import { UseUser } from '../helper/UserContext';
import { findRoomById } from '../helper/AccessRoom';
import './Chatroom.css';

const Chatroom = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const { roomId } = useParams<{ roomId: string }>();
  const roomData = findRoomById(roomId!);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      alert("No authenticated user found.");
      navigate('/chatHome');
    }
  }, [authUser, navigate, loading]);

  return (
    <div className='Chatroom'>
      <h1>Chatroom</h1>
      <button onClick={() => navigate('/chatHome')}>Go to Chat Home</button>
    </div>
  );
}

export default Chatroom;