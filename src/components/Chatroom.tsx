import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import { firestore } from '../config';
import { UseUser } from '../helper/UserContext';
import { findRoomById } from '../helper/AccessRoom';
import { ChatroomData } from '../helper/Interface'
import './Chatroom.css';

const Chatroom = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<ChatroomData>({} as ChatroomData);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      alert("No authenticated user found.");
      navigate('/chatHome');
    }
  }, [authUser, navigate, loading]);

  // Fetch room data
  useEffect(() => {
    if (roomId && authUser) {
      setIsLoading(true);
      findRoomById(roomId)
        .then((data) => {
          console.log("Room data:", data);
          if(!data){
            alert("Room not found.");
            navigate('/chatHome');
          }else{
            setRoomData(data);
          }
        }).catch((error) => {
          console.error("Error fetching room:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [roomId, authUser]);

  if (isLoading && !roomData) {
    return <div>Loading room data...</div>;
  }

  return (
    <div className='Chatroom'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {roomData ? (
            <p>Welcome to {roomData.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          {profile ? (
            <p>{profile.name}</p>
          ) : (
            <p>Guest</p>
          )}
          <a onClick={() => navigate('/chatHome')}>Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default Chatroom;