import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UseUser } from '../helper/UserContext';
import '../styles/UserProfile.css';

export const UserProfile = () => {
    const { authUser, profile, loading } = UseUser();
    const navigate = useNavigate();
}