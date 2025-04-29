import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import { firestore } from '../config';
import {
  TextField,
  IconButton,
  styled,
} from '@mui/material'
import {Send} from '@mui/icons-material';
import { UseUser } from '../helper/UserContext';
import { findRoomById } from '../helper/AccessRoom';
import { sendMessage, getAllMessages, newMessageAdded, newMessageDeleted } from '../helper/AccessMessage';
import { ChatroomData, MessageData } from '../helper/Interface';
import { MessageBox } from './MessageBox';
import { Loading } from './Loading';
import '../styles/Chatroom.css';

const CustomTextField = styled(TextField)({
  width: '90%',
  height: 'auto',
  color: '#ccc',
  '&:focus': {
    color: 'var(--color-border-green)',
  }
})

const CustomIconButton = styled(IconButton)({
  width: '60px',
  height: '50px',
  backgroundColor: 'var(--color-button-orange)',
  color: '#FFF3EB',
  borderRadius: '10px',
  '&:hover': {
    backgroundColor: 'var(--color-button-orange-dark)',
  }
})

const Chatroom = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<ChatroomData>({} as ChatroomData);
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageData[]>([]);

  const [deleteMsg, setDeleteMsg] = useState<string[]>([]);

  const messageAreaRef = useRef<HTMLDivElement>(null);

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
  
  // Update Messages
  useEffect(() => {
    if(roomId && !isLoading){
      const unsubscribe = newMessageAdded(roomId, (newMessages: MessageData[]) => {
        setMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [roomId, isLoading]);

  useEffect(() => {
    if(roomId && !isLoading){
      const unsubscribeDelete = newMessageDeleted(roomId, (messageId: string) => {
        setDeleteMsg((prev) => [...prev, messageId]);
        console.log('Message deleted:', messageId);
      });

      return () => unsubscribeDelete();
    }
  }, [roomId, isLoading]);

  // Auto Scroll to Bottom
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if ((isLoading && !roomData) || loading) {
    return <Loading />;
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

      <div className='Message-Area' ref={messageAreaRef}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBox
              key={msg.id}
              roomId={roomId || ''}
              message={msg}
            />
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      <div className='Input-Area'>
        <CustomTextField
          id="text-field"
          label="Type a message"
          multiline
          maxRows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <CustomIconButton
          onClick={() => {
            if (roomId && authUser?.uid && profile?.email && message.trim()) {
              sendMessage(roomId, authUser.uid, profile.email, message)
                .then(()=> {setMessage('')})
                .catch((error) => {console.error('Error sending message:', error)});
            } else {
              console.error("Missing required parameters for sending a message.");
            }
          }}
        >
          <Send />
        </CustomIconButton>
      </div>
    </div>
  );
}

export default Chatroom;