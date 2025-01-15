import React, { useState, useEffect } from 'react';
import { supabase } from '../../components/supabaseClient';
import { fetchNotifications, markAsRead, deleteNotification } from '../../services/notificationService';
import './Notifications.css';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext'; // Assuming this is how you get the user ID

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth(); // Assuming useAuth provides the user object

  useEffect(() => {
    if (user) {
      loadNotifications(user.id);

      const channel = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload) => {
            console.log('Change received!', payload);
            if (payload.new.user_id === user.id) { // Only process notifications for the current user
              if (payload.eventType === 'INSERT') {
                setNotifications(prevNotifications => [payload.new, ...prevNotifications]);
              } else if (payload.eventType === 'UPDATE') {
                setNotifications(prevNotifications =>
                  prevNotifications.map(notification =>
                    notification.id === payload.new.id ? payload.new : notification
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setNotifications(prevNotifications =>
                  prevNotifications.filter(notification => notification.id !== payload.old.id)
                );
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async (userId) => {
    const notificationsData = await fetchNotifications(userId);
    setNotifications(notificationsData);
  };

  const handleMarkAsRead = async (id) => {
    const success = await markAsRead(id);
    if (success) {
      loadNotifications(user.id);
    }
  };

  const handleDeleteNotification = async (id) => {
    const success = await deleteNotification(id);
    if (success) {
      loadNotifications(user.id);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || (filter === 'read' && notification.read) || (filter === 'unread' && !notification.read)
  );

  return (
    <div className="notifications-page">
      <Sidebar />
      <div className="notifications-content">
        <h2>Your Notifications</h2>
        <div className="notification-filter">
          <button 
            onClick={() => setFilter('all')} 
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('read')} 
            className={filter === 'read' ? 'active' : ''}
          >
            Read
          </button>
          <button 
            onClick={() => setFilter('unread')} 
            className={filter === 'unread' ? 'active' : ''}
          >
            Unread
          </button>
        </div>
        {filteredNotifications.length > 0 ? (
          <ul className="notifications-list">
            {filteredNotifications.map(notification => (
              <li key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                <p>{notification.message}</p>
                <div className="notification-actions">
                  {!notification.read && <button onClick={() => handleMarkAsRead(notification.id)}>Mark as Read</button>}
                  <button onClick={() => handleDeleteNotification(notification.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications found</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
