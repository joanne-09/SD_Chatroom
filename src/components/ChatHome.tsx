import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config';
import { ChatroomBlock } from './ChatroomBlock';
import { Loading } from './Loading';
import { UseUser } from '../helper/UserContext';
import { newRoomsAdded, addFriendToUser } from '../helper/AccessUser';
import { UserRoom } from '../helper/Interface';
import { UseAlert } from '../helper/CreateAlert';
import { AccountMenu, StartChatButton } from '../helper/MuiComponents';
import '../styles/ChatHome.css';

const ChatHome = () => {
  const navigate = useNavigate();
  const { authUser, profile, loading } = UseUser();
  const {showAlert} = UseAlert();

  const [ isLoading, setIsLoading ] = useState(true);
  const [ rooms, setRooms ] = useState<UserRoom[]>([]);

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

        <StartChatButton 
          alertFunc={showAlert}
        />
      </div>
    </div>
  )
};

export default ChatHome;