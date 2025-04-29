import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config';
import { ChatroomBlock } from './ChatroomBlock';
import { Loading } from './Loading';
import { UseUser } from '../helper/UserContext';
import { newRoomsAdded, addFriendToUser } from '../helper/AccessUser';
import { UserRoom } from '../helper/Interface';
import { AccountMenu, StartChatButton } from '../helper/MuiComponents';
import '../styles/ChatHome.css';

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();

  const [ isLoading, setIsLoading ] = useState(true);
  const [ rooms, setRooms ] = useState<UserRoom[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    if (!authUser && !loading) {
      alert("No authenticated user found.");
      navigate('/');
    }
  }, [authUser, loading, navigate]);

  // Log Out
  const handleLogOut = () => {
    if (!authUser) {
      alert("No user is signed in.");
      return;
    }
    auth.signOut().then(() => {
      alert("User signed out successfully!");
      navigate('/');
    }).catch((error) => {
      alert("Error signing out: " + error.message);
    });
  }

  // Add Friend To User
  const addFriend = (email: string) => {
    addFriendToUser(authUser!.uid, email)
      .then(() => {
        alert('Friend added successfully!');
      }).catch((error) => {
        alert('Error adding friend!');
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

  if(isLoading || loading) {
    return <Loading />;
  }

  return(
    <div className='ChatHome'>
      <div className="Nav-bar">
        <div className="Nav-bar-Logo">
          {profile ? (
            <p>Welcome, {profile.name}</p>
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
                />
              ))
            ) : (
              <p>No rooms Joined.</p>
            )
          }
        </div>

        <StartChatButton />
      </div>
    </div>
  )
};

export default ChatHome;