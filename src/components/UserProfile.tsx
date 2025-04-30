import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Button,
	TextField,
} from '@mui/material';
import { UseUser } from '../helper/UserContext';
import { UseAlert } from '../helper/CreateAlert';
import { updateUserData } from '../helper/AccessUser';
import { ProfileImage } from '../helper/AccessImage'
import { UserData } from '../helper/Interface';
import { Loading } from './Loading';
import '../styles/UserProfile.css';

const UserProfile = () => {
	const { authUser, profile, loading } = UseUser();
	const { showAlert } = UseAlert();
	const navigate = useNavigate();

	const [ name, setName ] = useState(profile?.name || '');
	const [ email, setEmail ] = useState(profile?.email || '');
	const [ phone, setPhone ] = useState(profile?.phone || '');
	const [ address, setAddress ] = useState(profile?.address || '');

	const [ refreshKey, setRefreshKey ] = useState(0);

	if (loading) {
		return <Loading />;
	}

	return (
		<div className='UserProfile' key={refreshKey}>
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

			<div className="profile-content">

				<ProfileImage 
					type={'profile'}
				/>

				<div className="profile-details">
					<TextField 
						variant="standard"
						label="Name"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
					<TextField 
						variant="standard"
						label="Email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
						}}
					/>
					<TextField 
						variant="standard"
						label="Phone Number"
						value={phone}
						onChange={(e) => {
							setPhone(e.target.value);
						}}
					/>
					<TextField 
						variant="standard"
						label="Address"
						value={address}
						onChange={(e) => {
							setAddress(e.target.value);
						}}
					/>

					<Button
						variant="contained"
						onClick={() => {
							if (authUser) {
								updateUserData(authUser.uid, {
									name,
									email,
									phone,
									address
								} as Partial<UserData>).then(() => {
									showAlert('Profile updated successfully!', 'success');
									setRefreshKey((prev) => prev + 1);
								}).catch((error) => {
									console.error('Error updating profile:', error);
									showAlert('Failed to update profile', 'error');
								});
							}}
						}
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	)
}

export default UserProfile;