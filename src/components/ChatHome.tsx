import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config';
import { ChatroomBlock } from './ChatroomBlock';
import { Loading } from './Loading';
import { UseUser } from '../helper/UserContext';
import { newRoomsAdded, addFriendToUser } from '../helper/AccessUser';
import { findRoomById } from '../helper/AccessRoom';
import { listenAllRooms } from '../helper/AccessMessage';
import { UserRoom } from '../helper/Interface';
import { UseAlert } from '../helper/CreateAlert';
import { showNotification } from '../helper/ChromeNotification';
import { AccountMenu, StartChatButton } from '../helper/MuiComponents';
import '../styles/ChatHome.css';

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();
  const {showAlert} = UseAlert();

  const [ isLoading, setIsLoading ] = useState(true);
  const [ rooms, setRooms ] = useState<UserRoom[]>([]);

  const [ unreadMessages, setUnreadMessages ] = useState<Record<string, number>>({});

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      showAlert("No authenticated user found.", "error");
      setTimeout(() => {navigate('/')}, 1500);
    }
  }, [authUser, loading, navigate]);

  // Log Out
  const handleLogOut = () => {
    if (!authUser) {
      showAlert("No user is signed in.", "error");
      return;
    }
    auth.signOut().then(() => {
      showAlert("User signed out successfully!", "success");
      setTimeout(() => {navigate('/')}, 1500);
    }).catch((error) => {
      showAlert("Error signing out" + error.message, "error");
    });
  }

  // Add Friend To User
  const addFriend = (email: string) => {
    addFriendToUser(authUser!.uid, email)
      .then(() => {
        showAlert('Friend added successfully!', 'success');
      }).catch((error) => {
        showAlert('Error adding friend: ' + error.message, 'error');
      });
  }

  // Get All Rooms for User
  useEffect(() => {
    const fetchRooms = async () => {
      if (authUser && !loading) {
        const unsubscribe = await newRoomsAdded(authUser.uid, (rooms: UserRoom[]) => {
          setRooms(rooms);
          setIsLoading(false);
        });
        return () => unsubscribe();
      }else{
        setIsLoading(true);
      }
    };
    fetchRooms();
  }, [authUser, loading]);

  // Listen for new messages in all rooms
  useEffect(() => {
    if (authUser && rooms.length > 0) {
      const unsubscribe = listenAllRooms(
        authUser.uid,
        rooms,
        (roomId, newMessage) => {
          // Update unread count for this room
          setUnreadMessages(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
          
          // Show notification
          findRoomById(roomId, showAlert).then((room) => {
            if (room) {
              showNotification(
                roomId,
                newMessage.senderId,
                room.name,
                newMessage
              );
            } else {
              console.error('Room not found:', roomId);
            }
          });
        }
      );
      
      return unsubscribe;
    }
  }, [authUser, rooms]);

  // Reset unread count when navigating to a room
  const handleRoomClick = (roomId: string) => {
    navigate(`/chatroom/${roomId}`);
    
    // Clear unread count for this room
    setUnreadMessages(prev => ({
      ...prev,
      [roomId]: 0
    }));
  };

  if(isLoading || loading) {
    return <Loading />;
  }

  return(
    <div className='ChatHome'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {profile ? (
            <p>{profile.name}</p>
          ) : (
            <p>Welcome</p>
          )}
        </div>
        <div className="Nav-bar-Links">
          <AccountMenu 
            handleLogOut={handleLogOut}
            addFriend={addFriend}
          />
        </div>
      </div>

      <div className='ChatHome-Content'>
        <div className='user-rooms'>
          {
            rooms ? (
              rooms.map((room) => (
                <ChatroomBlock 
                  key={room.id} 
                  room={room} 
                  unreadCount={unreadMessages[room.roomId] || 0}
                  onClick={() => handleRoomClick(room.roomId)}
                />
              ))
            ) : (
              <p>No rooms Joined.</p>
            )
          }
        </div>

        <StartChatButton 
          alertFunc={showAlert}
        />
      </div>
    </div>
  )
};

export default ChatHome;