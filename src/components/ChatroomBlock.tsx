import { useNavigate } from 'react-router-dom';
import {
    Button,
    styled,
} from '@mui/material'
import { UserRoom } from '../helper/Interface';
import '../styles/ChatroomBlock.css';

const ChatroomBlockButton = styled(Button)({
    height: '50px',
    backgroundColor: 'var(--color-button-gl)',
    color: '#000000',
    borderRadius: '10px',
    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)',
    '&:hover': {
        backgroundColor: 'var(--color-button-gl-dark)',
        boxShadow: '6px 6px 6px rgba(0, 0, 0, 0.5)',
        transform: 'translateY(-3px) translateX(-5px)',
        transition: '0.1s',
    },
})

export const ChatroomBlock = (
    {room}:  {room: UserRoom}
) => {
    const navigate = useNavigate();

    return (
        <div
            key={room.id}
            className='chatroom-block'
        >
            <div className='room-info'>
                <p className='room-name'>{room.roomName}</p>
                <p className='room-id'>{room.roomId}</p>
            </div>
            <ChatroomBlockButton
                variant='contained'
                onClick={() => {
                    navigate(`/chatroom/${room.roomId}`);
                }}
            >
                Join Chatroom
            </ChatroomBlockButton>
        </div>
    )
}