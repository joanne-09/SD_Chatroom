import { getUserById, getUserRoomById } from "./AccessUser";

export const showNotification = async (roomId: string, senderId: string, roomName: string, newMessage: any) => {
  console.log('Notification data:', roomId, senderId, roomName, newMessage);

  if (Notification.permission === 'granted') {
    getUserById(senderId).then((sender) => {
      if (!sender) {
        console.error('Sender not found:', senderId);
        return;
      }
      console.log('Sender data:', sender);

      try {
        console.log('Creating notification object...');
        const notification = new Notification(`New message from ${sender.name || 'Unknown'} in ${roomName}`, {
          body: newMessage.messageType === 'text' ? newMessage.content : `Sent a ${newMessage.messageType}`,
          icon: '/favicon.ico',
        });
        
        console.log('Notification created successfully');
        
        notification.onshow = () => {
          console.log('Notification shown to user!');
        };
        
        notification.onclick = () => {
          console.log('Notification clicked!');
          window.focus();
          window.location.href = `/chatroom/${roomId}`;
          notification.close();
        };
        
        notification.onerror = (e) => {
          console.error('Notification error:', e);
        };
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(roomId, senderId, roomName, newMessage);
      }
    });
  }
}