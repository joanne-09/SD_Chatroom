self.addEventListener('push', function (event) {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/notification-badge.png',
        data: {
            roomId: data.roomId
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(`/chatroom/${event.notification.data.roomId}`)
    );
});