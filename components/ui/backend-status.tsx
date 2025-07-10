import { StyleSheet } from 'react-native';

export function BackendStatus() {
  // Disabled health check to avoid unnecessary API requests
  return null;
  
  /* 
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      setStatus('checking');
      await healthAPI.check();
      setStatus('online');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('offline');
    } finally {
      setLastCheck(new Date());
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#10B981';
      case 'offline': return '#EF4444';
      case 'checking': return '#F59E0B';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      case 'checking': return 'Checking...';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getStatusColor() }]}
      onPress={checkBackendStatus}
    >
      <Text style={styles.statusText}>{getStatusText()}</Text>
      <Text style={styles.urlText}>localhost:5000</Text>
      {lastCheck && (
        <Text style={styles.timeText}>
          {lastCheck.toLocaleTimeString()}
        </Text>
      )}
    </TouchableOpacity>
  );
  */
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    zIndex: 1000,
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  urlText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  timeText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 2,
  },
}); 