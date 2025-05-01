import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore, storage } from '../config';
import {
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { UseUser } from './UserContext';
import { UseAlert } from './CreateAlert';
import '../styles/AccessImage.css';

const compressImage = (file: File, maxWidth = 300, maxHeight = 300, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        // Create canvas and context
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Ensure the compressed image is under Firestore's limit (1MB)
        const sizeInBytes = Math.ceil((dataUrl.length * 3) / 4);
        console.log(`Compressed image size: ${(sizeInBytes / 1024).toFixed(2)}KB`);

        if (sizeInBytes > 750000) { // Keep some margin below 1MB
          // If still too large, try again with more compression
          resolve(compressImage(file, Math.floor(width * 0.8), Math.floor(height * 0.8), quality * 0.8));
        } else {
          resolve(dataUrl);
        }
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const getImageData = async (
  type: 'profile' | 'roomcover', 
  roomId?: string,
  userId?: string,
) => {
  try {
    if (type === 'profile' && userId) {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists() && userDoc.data().profileImage) {
        return userDoc.data().profileImage;
      }
    } else if (type === 'roomcover' && roomId) {
      const roomDoc = await getDoc(doc(firestore, 'chatrooms', roomId));
      if (roomDoc.exists() && roomDoc.data().roomImage) {
        return roomDoc.data().roomImage;
      }
    }
  }catch(error){
    console.error('Error fetching image data:', error);
  }
};

export const ProfileImage = (
  { type, roomId, onImageUpdate }:
  { 
    type: 'profile' | 'roomcover',
    roomId?: string,
    onImageUpdate?: (imageUrl: string) => void,
  }
) => {
  const { authUser } = UseUser();
  const { showAlert } = UseAlert();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

   // Fetch image on component mount if available
   useEffect(() => {
    const fetchProfileImage = async () => {
      if(type === 'profile' && authUser) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
          if (userDoc.exists() && userDoc.data().profileImage) {
            setImageUrl(userDoc.data().profileImage);
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      } else if (type === 'roomcover' && roomId) {
        try {
          const roomDoc = await getDoc(doc(firestore, 'chatrooms', roomId));
          if (roomDoc.exists() && roomDoc.data().roomImage) {
            setImageUrl(roomDoc.data().roomImage);
          }
        } catch (error) {
          console.error('Error fetching room cover image:', error);
        }
        
      }
    };
    
    fetchProfileImage();
  }, [authUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !authUser) return;

    const file = e.target.files[0];

    // Check file type
    if (!file.type.startsWith('image/')) {
      showAlert('Please select a valid image file', 'error');
      return;
    }
    
    setUploading(true);
    try {
      // Compress the image
      const compressedImage = await compressImage(file);
      
      // Update user profile in Firestore with compressed image data
      if(type === 'profile'){
        await updateDoc(doc(firestore, 'users', authUser.uid), {
          profileImage: compressedImage
        });
      }else if(type === 'roomcover' && roomId){
        await updateDoc(doc(firestore, 'chatrooms', roomId), {
          roomImage: compressedImage
        });
        if(onImageUpdate) onImageUpdate(compressedImage);
      }
      
      setImageUrl(compressedImage);
      showAlert('Profile photo updated successfully!', 'success');
    } catch (error) {
      console.error('Error processing image:', error);
      showAlert('Error updating profile image', 'error');
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
          sx={{
            mt: 2,
            backgroundColor: 'var(--color-button-orange)',
            color: 'var(--color-button-text)',
            transition: 'all 0.3s ease',
            '&:hover': {
              scale: 1.05,
              backgroundColor: 'var(--color-button-orange-dark)',
            },
          }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload Photo'}
        </Button>
      </label>
    </div>
  );
};