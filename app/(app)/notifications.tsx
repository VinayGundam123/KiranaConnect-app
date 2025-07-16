import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  AlertTriangle,
  Bell,
  Calendar,
  ExternalLink,
  MessageSquare,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  X
} from 'lucide-react-native';
import { theme } from '../../lib/theme';

// Notification Type
interface Notification {
  _id: string;
  type: 'order_update' | 'system' | 'ai_reminder' | 'offer' | 'welcome' | 'order_received' | 'inventory_low';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  itemId?: string;
  itemName?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  const iconProps = {
    size: 22,
    color: theme.colors.primary[600],
  };
  const iconMutedProps = {
    size: 22,
    color: theme.colors.gray[500],
  };

  const icons = {
    order_received: (read: boolean) => <ShoppingCart {...(read ? iconMutedProps : iconProps)} />,
    order_update: (read: boolean) => <Truck {...(read ? iconMutedProps : iconProps)} />,
    inventory_low: (read: boolean) => <AlertTriangle {...(read ? iconMutedProps : iconProps)} />,
    system: (read: boolean) => <Settings {...(read ? iconMutedProps : iconProps)} />,
    ai_reminder: (read: boolean) => <Bell {...(read ? iconMutedProps : iconProps)} />,
    offer: (read: boolean) => <Tag {...(read ? iconMutedProps : iconProps)} />,
    welcome: (read: boolean) => <MessageSquare {...(read ? iconMutedProps : iconProps)} />,
  };
  
  return icons[type] || ((read: boolean) => <Bell {...(read ? iconMutedProps : iconProps)} />);
};


const getNotificationTitle = (type: Notification['type']) => {
  switch (type) {
    case 'order_received':
      return 'New Order Received';
    case 'order_update':
      return 'Order Update';
    case 'inventory_low':
      return 'Low Stock Alert';
    case 'system':
      return 'System Notification';
    case 'ai_reminder':
      return 'AI Personalized Reminder';
    case 'offer':
      return 'Special Offer For You';
    case 'welcome':
      return 'Welcome to KiranaConnect!';
    default:
      return 'Notification';
  }
};

const getTimeAgo = (timestamp: string) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 6) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { title: string; data: Notification[] }[] = [];
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const earlier: Notification[] = [];
  
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      if (date.toDateString() === now.toDateString()) {
        today.push(notification);
      } else if (date.toDateString() === yesterdayDate.toDateString()) {
        yesterday.push(notification);
      } else if (date > lastWeekDate) {
        thisWeek.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    if (today.length > 0) groups.push({ title: 'Today', data: today });
    if (yesterday.length > 0) groups.push({ title: 'Yesterday', data: yesterday });
    if (thisWeek.length > 0) groups.push({ title: 'This Week', data: thisWeek });
    if (earlier.length > 0) groups.push({ title: 'Earlier', data: earlier });
  
    return groups;
  };

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingNotification, setGeneratingNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent duplicate fetches
  const initializedRef = useRef(false); // Track if component was initialized
  
  // Modal state for notification detail
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchNotifications = useCallback(async (id: string) => {
    // Prevent duplicate fetches
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    
    try {
      setLoading(true);
      
      const apiUrl = `https://vigorously-more-impala.ngrok-free.app/buyer/notifications/${id}`;
      
      // Single API call to get all notifications - using fetch like other working APIs
      const response = await fetch(apiUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();

      let allNotifications: Notification[] = [];

      // Process notifications
      if (responseData && responseData.success && responseData.notifications) {
        const notifications = responseData.notifications.map((n: any) => ({
          ...n,
          read: n.status === 'read',
          createdAt: n.sentAt || n.createdAt || n.timestamp, // Try multiple field names
          // Ensure all notifications have the required fields
          type: n.type || 'system', // Default to system if no type specified
        }));
        allNotifications.push(...notifications);
      } else {
      }
      
      
      // Sort by date, newest first
      allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(allNotifications);
      
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      
      if (error.message?.includes('Network request failed') || error.name === 'TypeError') {
        Toast.show({ 
          type: 'error', 
          text1: 'Network Error',
          text2: 'Please check your internet connection and try again' 
        });
      } else if (error.message?.includes('HTTP error! status: 500')) {
        Toast.show({ 
          type: 'error', 
          text1: 'Server Error',
          text2: 'Server returned 500. Try again later.' 
        });
      } else if (error.message?.includes('HTTP error! status: 404')) {
        Toast.show({ 
          type: 'error', 
          text1: 'Endpoint Not Found',
          text2: 'The notifications endpoint might not exist' 
        });
      } else if (error.message?.includes('HTTP error! status: 0')) {
        Toast.show({ 
          type: 'error', 
          text1: 'CORS / Network Error',
          text2: 'This might be a CORS issue or the server is unreachable on Android' 
        });
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Failed to fetch notifications',
          text2: error.message || 'Unknown error occurred' 
        });
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false; // Reset the fetch flag
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization in development mode
    if (initializedRef.current) {
      return;
    }

    const checkAuthAndFetch = async () => {
      
      try {
        // Get all AsyncStorage keys for debugging
        const allKeys = await AsyncStorage.getAllKeys();
        
        // Try multiple possible storage keys
        let userId = await AsyncStorage.getItem('buyerId');
        if (!userId) {
          userId = await AsyncStorage.getItem('userId');
        }
        if (!userId) {
          userId = await AsyncStorage.getItem('user_id');
        }
        if (!userId) {
          // Check the user_session that auth.ts actually uses on Android
          const userSession = await AsyncStorage.getItem('user_session');
          if (userSession) {
            try {
              const session = JSON.parse(userSession);
              userId = session.user?._id || session.id || session.userId || session.buyerId;
            } catch (e) {
              console.log('Failed to parse user_session:', e);
            }
          }
        }
        if (!userId) {
          const userSession = await AsyncStorage.getItem('userSession');
          if (userSession) {
            try {
              const session = JSON.parse(userSession);
              userId = session.user?._id || session.userId || session.buyerId;
            } catch (e) {
              console.log('Failed to parse userSession:', e);
            }
          }
        }
        
        
        setBuyerId(userId);
        
        if (userId && userId.trim() !== '') {
          await fetchNotifications(userId);
        } else {
          
          Toast.show({ 
            type: 'error', 
            text1: 'Authentication required',
            text2: 'Please log in to view notifications.' 
          });
          router.push('/(app)/auth');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in checkAuthAndFetch:', error);
        Toast.show({ 
          type: 'error', 
          text1: 'Authentication error',
          text2: 'Failed to check login status' 
        });
        setLoading(false);
      }
    };

    initializedRef.current = true;
    checkAuthAndFetch();

    // Cleanup function
    return () => {
      fetchingRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  const triggerManualAINotification = useCallback(async () => {
    if (!buyerId) return;
    try {
      setGeneratingNotification(true);
      const response = await axios.post(`https://vigorously-more-impala.ngrok-free.app/buyer/cart/${buyerId}/smart-notification`);
      
      if (response.data.notification) {
        Toast.show({type: 'success', text1: '🤖 AI reminder generated successfully!'});
        await fetchNotifications(buyerId);
      } else {
        Toast.show({type: 'info', text1: 'No new reminder was generated.'});
      }
    } catch (error: any) {
      console.error('Error generating AI notification:', error);
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to generate AI notification' });
    } finally {
      setGeneratingNotification(false);
    }
  }, [buyerId, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    if (isUpdating || !buyerId) return;
    setIsUpdating(notificationId);
    try {
      const response = await fetch(`https://vigorously-more-impala.ngrok-free.app/buyer/notifications/${buyerId}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking as read:', error);
      Toast.show({ type: 'error', text1: 'Failed to update notification.' });
    } finally {
      setIsUpdating(null);
    }
  }, [isUpdating, buyerId]);

  const handleDismiss = useCallback(async (notificationId: string) => {
    if (isUpdating || !buyerId) return;
    setIsUpdating(notificationId);
    try {
      const response = await fetch(`https://vigorously-more-impala.ngrok-free.app/buyer/notifications/${buyerId}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      Toast.show({type: 'success', text1: 'Notification dismissed.'});
    } catch (error: any) {
      console.error('Error dismissing notification:', error);
      Toast.show({ type: 'error', text1: 'Failed to dismiss notification.' });
    } finally {
      setIsUpdating(null);
    }
  }, [isUpdating, buyerId]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!buyerId || notifications.every(n => n.read)) return;
    try {
      const response = await fetch(`https://vigorously-more-impala.ngrok-free.app/buyer/notifications/${buyerId}/read-all`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      Toast.show({type: 'success', text1: 'All notifications marked as read.'});
    } catch (error: any) {
        console.error('Error marking all as read:', error);
        Toast.show({type: 'error', text1: 'Failed to mark all as read.'});
    }
  }, [buyerId, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    
    // Mark as read when opened
    if (!notification.read && notification.type !== 'ai_reminder') {
      handleMarkAsRead(notification._id);
    }
  }, [handleMarkAsRead]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedNotification(null), 300); // Delay to allow animation
  }, []);

  const handleNotificationAction = useCallback(() => {
    if (selectedNotification?.link) {
      closeModal();
      router.push(selectedNotification.link as any);
    }
  }, [selectedNotification, closeModal, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <RNText style={styles.loadingText}>Loading notifications...</RNText>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Action Bar */}
      {notifications.length > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.badgeContainer}>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <RNText style={styles.badgeText}>{unreadCount} unread</RNText>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            style={[styles.markAllButton, unreadCount === 0 ? styles.disabledButton : styles.enabledButton]}
          >
            <RNText style={[styles.buttonText, unreadCount === 0 && styles.disabledButtonText]}>
              Mark all as read
            </RNText>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Bell size={48} color={theme.colors.gray[400]} />
          <RNText style={styles.emptyTitle}>No Notifications Yet</RNText>
          <RNText style={styles.emptySubtitle}>
            We'll notify you when there are updates for your orders and recommendations.
          </RNText>
          
        </View>
      ) : (
        <FlatList
          data={groupNotificationsByDate(notifications)}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <RNText style={styles.groupTitle}>{item.title}</RNText>
              {item.data.map(notification => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification}
                  onDismiss={handleDismiss}
                  onMarkAsRead={handleMarkAsRead}
                  onPress={handleNotificationPress}
                />
              ))}
            </View>
          )}
        />
      )}

      {/* Notification Detail Modal */}
      {modalVisible && selectedNotification && (
        <Animated.View
          style={styles.modalOverlay}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(300)}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              {selectedNotification && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <View style={styles.modalIconContainer}>
                        {getNotificationIcon(selectedNotification.type)(selectedNotification.read)}
                      </View>
                      <RNText style={styles.modalTitle}>
                        {getNotificationTitle(selectedNotification.type)}
                      </RNText>
                    </View>
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <X size={24} color={theme.colors.gray[600]} />
                    </TouchableOpacity>
                  </View>

                  {/* Modal Body */}
                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.messageContainer}>
                      <RNText style={styles.modalMessage}>
                        {selectedNotification.message}
                      </RNText>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoRow}>
                        <Calendar size={16} color={theme.colors.gray[500]} />
                        <RNText style={styles.infoText}>
                          {getTimeAgo(selectedNotification.createdAt)}
                        </RNText>
                      </View>
                      
                      {selectedNotification.itemName && (
                        <View style={styles.infoRow}>
                          <Tag size={16} color={theme.colors.gray[500]} />
                          <RNText style={styles.infoText}>
                            Related to: {selectedNotification.itemName}
                          </RNText>
                        </View>
                      )}

                      <View style={styles.statusContainer}>
                        <View style={[
                          styles.statusBadge, 
                          selectedNotification.read ? styles.readBadge : styles.unreadBadge
                        ]}>
                          <RNText style={[
                            styles.statusText,
                            selectedNotification.read ? styles.readText : styles.unreadText
                          ]}>
                            {selectedNotification.read ? 'Read' : 'Unread'}
                          </RNText>
                        </View>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Modal Footer */}
                  <View style={styles.modalFooter}>
                    {selectedNotification.link && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleNotificationAction}
                      >
                        <ExternalLink size={18} color="white" />
                        <RNText style={styles.actionButtonText}>View Details</RNText>
                      </TouchableOpacity>
                    )}
                    
                    {selectedNotification.type !== 'ai_reminder' && (
                      <TouchableOpacity 
                        style={styles.dismissButtonModal}
                        onPress={() => {
                          handleDismiss(selectedNotification._id);
                          closeModal();
                        }}
                      >
                        <RNText style={styles.dismissButtonText}>Dismiss</RNText>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const NotificationItem = ({ notification, onDismiss, onMarkAsRead, onPress }: { 
  notification: Notification, 
  onDismiss: (id: string) => void, 
  onMarkAsRead: (id: string) => void,
  onPress: (notification: Notification) => void
}) => {
    const router = useRouter();

    const handleNotificationClick = () => {
        onPress(notification);
    };

    const isRead = notification.read;
    const canBeInteractedWith = notification.type !== 'ai_reminder';
    const Icon = getNotificationIcon(notification.type)(isRead);

    return (
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
            <TouchableOpacity 
                style={[styles.itemContainer, !isRead && styles.unreadItem]}
                onPress={handleNotificationClick}
            >
                <View style={[styles.iconContainer, !isRead && styles.unreadIconContainer]}>
                    {Icon}
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.itemHeader}>
                        <RNText style={[styles.title, !isRead && styles.unreadTitle]}>
                            {getNotificationTitle(notification.type)}
                        </RNText>
                        {!isRead && <View style={styles.unreadDot} />}
                    </View>
                    <RNText 
                      style={[styles.message, !isRead && styles.unreadMessage]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                        {notification.message}
                    </RNText>
                    {notification.type === 'ai_reminder' && notification.itemName && (
                        <RNText style={styles.itemName}>For: {notification.itemName}</RNText>
                    )}
                    <RNText style={styles.time}>{getTimeAgo(notification.createdAt)}</RNText>
                </View>
                {canBeInteractedWith && (
                    <TouchableOpacity 
                      style={styles.dismissButton} 
                      onPress={(e) => {
                        e.stopPropagation();
                        onDismiss(notification._id);
                      }}
                    >
                        <X size={16} color={theme.colors.gray[400]} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.gray[600],
  },
  actionBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: theme.colors.primary[700],
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  groupTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    color: theme.colors.gray[500],
  },
  itemContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    alignItems: 'flex-start',
  },
  unreadItem: {
    borderColor: theme.colors.primary[200],
    backgroundColor: theme.colors.primary[50],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: theme.colors.primary[100],
  },
  textContainer: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: theme.colors.gray[600],
    flex: 1,
  },
  unreadTitle: {
    color: theme.colors.gray[900],
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
    marginLeft: 8,
  },
  message: {
    color: theme.colors.gray[500],
    marginBottom: 8,
    lineHeight: 20,
  },
  unreadMessage: {
    color: theme.colors.gray[600],
  },
  itemName: {
    fontSize: 12,
    color: theme.colors.gray[400],
    marginBottom: 6,
  },
  time: {
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  dismissButton: {
    padding: 8,
    marginTop: -4,
  },
  emptyTitle: {
    marginTop: 16,
    color: theme.colors.gray[700],
  },
  emptySubtitle: {
    color: theme.colors.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  enabledButton: {
    opacity: 1,
  },
  
  // Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'android' && { elevation: 5 }),
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    }),
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
  },
  modalContent: {
    flex: 1,
    display: 'flex',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    color: theme.colors.gray[900],
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalBody: {
    flex: 1,
    padding: 20,
    minHeight: 100,
  },
  messageContainer: {
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.gray[700],
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    color: theme.colors.gray[600],
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  readBadge: {
    backgroundColor: theme.colors.gray[100],
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary[100],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readText: {
    color: theme.colors.gray[600],
  },
  unreadText: {
    color: theme.colors.primary[700],
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  dismissButtonModal: {
    backgroundColor: theme.colors.gray[200],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: theme.colors.gray[700],
    fontWeight: '500',
    fontSize: 14,
  },
}); 