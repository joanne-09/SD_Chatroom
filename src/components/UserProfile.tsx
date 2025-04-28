import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UseUser } from '../helper/UserContext';
import { Loading } from './Loading';
import '../styles/UserProfile.css';

const UserProfile = () => {
	const { authUser, profile, loading } = UseUser();
	const navigate = useNavigate();

	if(loading) {
		return <Loading />;
	}

	return (
		<div className='UserProfile'>
			<div className="Nav-bar">
					<div className="Nav-bar-Logo">
					  {profile ? (
						<p>{profile.name}</p>
					  ) : (
						<p>Welcome</p>
					  )}
					</div>
					<div className="Nav-bar-Links">
						<a onClick={() => navigate('/chatHome')}>Back to Home</a>
					</div>
				  </div>
		</div>
	)
}

export default UserProfile;