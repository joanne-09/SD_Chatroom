import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../config';
import {
	Avatar,
	Button,
	CircularProgress,
} from '@mui/material';
import { UseUser } from './UserContext';
import { UseAlert } from './CreateAlert';
import '../styles/AccessImage.css';

export const ProfileImage = () => {
	const { authUser } = UseUser();
	const { showAlert } = UseAlert();
	const [uploading, setUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState('');

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files[0] || !authUser) return;

		const file = e.target.files[0];

		// Check file size - stay within free tier limits
		if (file.size > 2 * 1024 * 1024) { // 2MB limit
			alert('File too large. Please select an image under 2MB');
			return;
		}

		setUploading(true);
		try {
			// Create storage reference
			const storageRef = ref(storage, `profileImages/${authUser.uid}`);

			// Upload file
			await uploadBytes(storageRef, file);

			// Get download URL
			const url = await getDownloadURL(storageRef);

			// Update user profile in Firestore
			await updateDoc(doc(firestore, 'users', authUser.uid), {
				photoURL: url
			});

			setImageUrl(url);
			showAlert('Profile photo updated successfully!', 'success');
		} catch (error) {
			console.error('Error uploading image:', error);
			showAlert('Error uploading image', 'error');
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="profile-image-container">
			<Avatar
				src={imageUrl}
				sx={{ width: 120, height: 120 }}
			/>

			<input
				type="file"
				accept="image/*"
				style={{ display: 'none' }}
				id="profile-image-upload"
				onChange={handleImageChange}
			/>

			<label htmlFor="profile-image-upload">
				<Button
					variant="contained"
					component="span"
					disabled={uploading}
					sx={{ mt: 2 }}
				>
					{uploading ? <CircularProgress size={24} /> : 'Upload Photo'}
				</Button>
			</label>
		</div>
	);
};