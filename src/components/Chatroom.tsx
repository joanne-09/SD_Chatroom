import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import { firestore } from '../config';
import {
  TextField,
  IconButton,
  styled,
} from '@mui/material'
import {
  Send,
  Gif,
} from '@mui/icons-material';
import { UseUser } from '../helper/UserContext';
import { findRoomById } from '../helper/AccessRoom';
import { sendMessage, getAllMessages, newMessageAdded, newMessageDeleted } from '../helper/AccessMessage';
import GifPicker from './GifPicker';
import { ChatroomData, MessageData } from '../helper/Interface';
import { SideBar } from './SidebarChat';
import { MessageBox } from './MessageBox';
import { Loading } from './Loading';
import '../styles/Chatroom.css';

const CustomTextField = styled(TextField)({
  width: '90%',
  height: 'auto',
  backgroundColor: 'var(--color-navbar)',
  borderRadius: '10px',
  // overflow: 'hidden',
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
  transition: 'transform 0.2s ease, filter 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--color-button-orange-dark)',
    transform: 'translateY(-2px)',
    filter: 'brightness(1.05)',
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

  // handle sending GIF
  const [gifPickerOpen, setGifPickerOpen] = useState(false);

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

  // Send GIF
  const sendGif = (gifUrl: string) => {
    if(roomId && authUser?.uid && profile?.email){
      const gifMessage: MessageData = {
        senderId: authUser.uid,
        senderEmail: profile.email,
        content: "GIF image",
        messageType: 'gif',
        gifUrl: gifUrl,
        timestamp: '',
      };

      sendMessage(roomId, gifMessage).catch((error) => {
        console.error('Error sending GIF:', error);
      });
    }

    setGifPickerOpen(false);
  }

  if ((isLoading && !roomData) || loading) {
    return <Loading />;
  }

  return (
    <div className='Chatroom'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {roomData ? (
            <p>{roomData.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          <a onClick={() => navigate('/chatHome')}>Home</a>
        </div>
      </div>

      <div className='Content'>
        <SideBar />

        <div className='Chatroom-Content'>
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
            <IconButton
              onClick={() => setGifPickerOpen(true)}
              sx={{
                color: 'var(--color-button-orange)',
                mr: '8px',
              }}
            >
              <Gif fontSize='large'/>
            </IconButton>

            <CustomIconButton
              onClick={() => {
                if (roomId && authUser?.uid && profile?.email && message.trim()) {
                  if (authUser?.uid) {
                    const newmessage: MessageData = {
                      senderId: authUser?.uid,
                      senderEmail: profile?.email,
                      content: message,
                      messageType: 'text',
                      timestamp: '',
                    };
                    sendMessage(
                      roomId, 
                      newmessage
                    )
                      .then(()=> {setMessage('')})
                      .catch((error) => {console.error('Error sending message:', error)});
                  } else {
                    console.error("User ID is undefined.");
                  }
                } else {
                  console.error("Missing required parameters for sending a message.");
                }
              }}
            >
              <Send />
            </CustomIconButton>
          </div>
        </div>

        <GifPicker 
          open={gifPickerOpen}
          onClose={() => setGifPickerOpen(false)}
          onSelect={sendGif}
        />
      </div>

      
    </div>
  );
}

export default Chatroom;