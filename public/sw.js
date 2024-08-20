self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/soundclash.png',
    badge: '/soundclash.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});