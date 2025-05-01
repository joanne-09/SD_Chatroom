import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Button,
	TextField,
	Paper,
	Box,
	Typography,
	Avatar,
} from '@mui/material';
import { UseUser } from '../helper/UserContext';
import { UseAlert } from '../helper/CreateAlert';
import { updateUserData, newFriendsAdded, getUserById } from '../helper/AccessUser';
import { ProfileImage } from '../helper/AccessImage'
import { UserData, UserFriend } from '../helper/Interface';
import { Loading } from './Loading';
import '../styles/UserProfile.css';

const UserProfile = () => {
	const { authUser, profile, loading } = UseUser();
	const { showAlert } = UseAlert();
	const navigate = useNavigate();

	const [name, setName] = useState(profile?.name || '');
	const [email, setEmail] = useState(profile?.email || '');
	const [phone, setPhone] = useState(profile?.phone || '');
	const [address, setAddress] = useState(profile?.address || '');

	const [friends, setFriends] = useState<UserFriend[]>([]);
	const [selectedFriend, setSelectedFriend] = useState<string>('');
	const [friendProfile, setFriendProfile] = useState<UserData | null>(null);

	const [refreshKey, setRefreshKey] = useState(0);

	// Handle when refresh page
	useEffect(() => {
		if (profile) {
			setName(profile.name || '');
			setEmail(profile.email || '');
			setPhone(profile.phone || '');
			setAddress(profile.address || '');
		}
	}, [profile]);

	// Get All Friends for User
	useEffect(() => {
		const fetchFriends = async () => {
			if (authUser && !loading) {
				const unsubscribe = await newFriendsAdded(authUser.uid, (friends: UserFriend[]) => {
					setFriends(friends);
				});
				return () => unsubscribe();
			}
		};
		fetchFriends();
	}, [authUser, loading]);

	// Get Friend Profile
	useEffect(() => {
		if (selectedFriend) {
			getUserById(selectedFriend).then((friend) => {
				if (friend) {
					setFriendProfile(friend);
				}
			}).catch((error) => {
				console.error('Error fetching friend profile:', error);
				showAlert('Failed to fetch friend profile', 'error');
			});
		}
	}, [selectedFriend, authUser, loading]);

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
				<Paper
					className="profile-details"
					elevation={3}
					sx={{
						padding: '20px',
						borderRadius: '10px',
						boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
					}}
				>
					<ProfileImage
						type={'profile'}
					/>

					<TextField
						variant="standard"
						label="Name"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
						}}
						fullWidth
					/>
					<TextField
						variant="standard"
						label="Email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						fullWidth
					/>
					<TextField
						variant="standard"
						label="Phone Number"
						value={phone}
						onChange={(e) => {
							setPhone(e.target.value);
						}}
						fullWidth
					/>
					<TextField
						variant="standard"
						label="Address"
						value={address}
						onChange={(e) => {
							setAddress(e.target.value);
						}}
						fullWidth
					/>

					<Button
						variant="contained"
						sx={{
							backgroundColor: 'var(--color-button-orange)',
							color: 'var(--color-button-text)',
							transition: 'all 0.3s ease',
							'&:hover': {
								scale: 1.05,
								backgroundColor: 'var(--color-button-orange-dark)',
							}
						}}
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
							}
						}
						}
					>
						Save
					</Button>
				</Paper>

				<Paper
					className="user-friends"
					elevation={3}
					sx={{
						padding: '20px',
						borderRadius: '10px',
						boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
					}}
				>
					<Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'var(--color-text-green)' }}>
						Friends List
					</Typography>

					<Box sx={{
						width: '100%',
						padding: 2,
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
						flex: 1,

						scrollbarWidth: 'thin',
					}}>
						{friends.length > 0 ? (
							friends.map((friend) => (
								<Paper
									key={friend.id}
									className="friend-item"
									elevation={1}
									onClick={() => {
										if(selectedFriend === friend.friendId) {
											setSelectedFriend('')
											setFriendProfile(null)
										}else{
											setSelectedFriend(friend.friendId)
										}
									}}
								>
									<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
										{friend.friendName}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{friend.friendEmail}
									</Typography>
								</Paper>
							))
						) : (
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
								<Typography color="text.secondary">No friends added yet.</Typography>
							</Box>
						)}
					</Box>
				</Paper>
				
				{
					selectedFriend && friendProfile && 
					(
						<Paper className="friend-profile" elevation={3} sx={{ padding: 2, borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
							<Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'var(--color-text-green)' }}>
								{friendProfile.name}'s Profile
							</Typography>
							<Avatar
								className="friend-avatar"
								src={friendProfile.profileImage || ''}
								sx={{ width: 120, height: 120, mb: 2 }}
							>
								{!friendProfile.profileImage && friendProfile.name.charAt(0).toUpperCase()}
							</Avatar>
							<Typography variant="body1" sx={{ mb: 1 }}>
								Name: {friendProfile.name}
							</Typography>
							<Typography variant="body1" sx={{ mb: 1 }}>
								Email: {friendProfile.email}
							</Typography>
							<Typography variant="body1" sx={{ mb: 1 }}>
								Phone: {friendProfile.phone}
							</Typography>
							<Typography variant="body1" sx={{ mb: 1 }}>
								Address: {friendProfile.address}
							</Typography>
						</Paper>
					)
				}
			</div>
		</div>
	)
}

export default UserProfile;