import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from '../config';
import {
  TextField,
  IconButton,
  styled,
} from '@mui/material'
import {
  Search,
  Close,
  Send,
  Gif,
  NotificationsActive,
} from '@mui/icons-material';
import { UseUser } from '../helper/UserContext';
import { UseAlert } from '../helper/CreateAlert';
import { resetUnreadCount } from '../helper/UnreadMessages';
import { newRoomsAdded, updateNotification } from '../helper/AccessUser';
import { findRoomById } from '../helper/AccessRoom';
import { sendMessage, getAllMessages, newMessageAdded } from '../helper/AccessMessage';
import { getImageData } from '../helper/AccessImage';
import GifPicker from './GifPicker';
import { ChatroomData, MessageData, UserRoom } from '../helper/Interface';
import { SideBar } from './SidebarChat';
import { MessageBox } from './MessageBox';
import { Loading } from './Loading';
import '../styles/Chatroom.css';

const CustomTextField = styled(TextField)({
  width: '100%',
  height: 'auto',
  backgroundColor: 'var(--color-light)',
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
  const { showAlert } = UseAlert();

  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<ChatroomData>({} as ChatroomData);
  const [roomImages, setRoomImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [fullMessages, setFullMessages] = useState<MessageData[]>([]);

  const [enbleNotifications, setEnableNotifications] = useState<Record<string, boolean>>({});

  // handle sending GIF
  const [gifPickerOpen, setGifPickerOpen] = useState(false);

  // handle message search
  const [searchOpen, setSearchOpen] = useState(false);

  // handle if update room name
  const [refreshKey, setRefreshKey] = useState(0);

  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      showAlert("No authenticated user found.", "error");
      setTimeout(() => { navigate('/chatHome') }, 1500);
    }
  }, [authUser, navigate, loading]);

  // Fetch room data
  useEffect(() => {
    if (roomId && authUser) {
      setIsLoading(true);
      findRoomById(roomId, showAlert)
        .then((data) => {
          console.log("Room data:", data);
          if (!data) {
            showAlert("Room not found.", "error");
            setTimeout(() => { navigate('/chatHome') }, 1500);
          } else {
            setRoomData(data);
          }
        }).catch((error) => {
          console.error("Error fetching room:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [roomId, authUser, refreshKey]);

  // Load room Images
  useEffect(() => {
    const loadRoomImage = async () => {
      if (roomId) {
        try {
          const imageUrl = await getImageData('roomcover', roomId);
          if (imageUrl) {
            setRoomImages(prev => ({
              ...prev,
              [roomId]: imageUrl
            }));
          }
        } catch (error) {
          console.error("Error loading room image:", error);
        }
      }
    };

    loadRoomImage();
  }, [roomId]);

  // Load Notification Settings
  useEffect(() => {
    const fetchNotify = async () => {
      if(authUser && !loading){
        const unsubscribe = await newRoomsAdded(authUser.uid, (rooms: UserRoom[]) => {
          const notifications: Record<string, boolean> = {};
          rooms.forEach((room) => {
            notifications[room.roomId] = room.notification;
          });
          setEnableNotifications(notifications);
        })
      }
    }
    fetchNotify();
  }, [authUser, loading]);

  // Update Messages
  useEffect(() => {
    if (roomId && !isLoading) {
      const unsubscribe = newMessageAdded(roomId, (newMessages: MessageData[]) => {
        setMessages(newMessages);
        setFullMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [roomId, isLoading]);

  // Reset Unread Messages Count
  useEffect(() => {
    if(roomId){
      resetUnreadCount(roomId);
    }
  }, [roomId]);

  // Auto Scroll to Bottom
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Send GIF
  const sendGif = (gifUrl: string) => {
    if (roomId && authUser?.uid && profile?.email) {
      const gifMessage: MessageData = {
        senderId: authUser.uid,
        senderEmail: profile.email,
        content: "GIF image",
        messageType: 'gif',
        gifUrl: gifUrl,
        timestamp: '',
      };

      sendMessage(roomId, gifMessage, showAlert).catch((error) => {
        console.error('Error sending GIF:', error);
      });
    }

    setGifPickerOpen(false);
  }

  // Toggle Notification Button for current room
  const toggleNotificationButton = async () => {
    if(!roomId || !authUser) return;

    const newValue = !enbleNotifications[roomId];
    setEnableNotifications((prev) => ({
      ...prev,
      [roomId]: newValue
    }));
    await updateNotification(authUser.uid, roomId, newValue);
  }

  if ((isLoading && !roomData) || loading) {
    return <Loading />;
  }

  return (
    <div className='Chatroom' key={refreshKey}>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {roomData ? (
            <p>{roomData.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          <IconButton
            className={`notification-button ${enbleNotifications[roomId ?? ''] ? 'active' : ''}`}
            onClick={toggleNotificationButton}
          >
            <NotificationsActive fontSize="medium" />
          </IconButton>

          <IconButton
            className='search-button'
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <Close fontSize='medium' /> : <Search fontSize='medium' />}
          </IconButton>

          <a onClick={() => navigate('/chatHome')}>Home</a>
        </div>
      </div>

      <div className='Content'>
        <SideBar
          refresh={() => { setRefreshKey((prev) => prev + 1) }}
        />

        <div className='Chatroom-Content'>
          {
            searchOpen &&
            <div className='Search-Area'>
              <CustomTextField
                fullWidth
                id="search-field"
                label="Search messages"
                variant="outlined"
                size="small"
                onChange={(e) => {
                  if (e.target.value === '') {
                    setMessages(fullMessages);
                    return;
                  }

                  const searchTerm = e.target.value.toLowerCase();
                  const filteredMessages = fullMessages.filter((msg) =>
                    msg.content.toLowerCase().includes(searchTerm)
                  );
                  setMessages(filteredMessages);
                }}
              />
            </div>
          }

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
              <Gif fontSize='large' />
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
                      newmessage,
                      showAlert
                    )
                      .then(() => { setMessage('') })
                      .catch((error) => { console.error('Error sending message:', error) });
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