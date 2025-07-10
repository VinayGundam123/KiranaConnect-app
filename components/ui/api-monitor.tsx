import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRequestCount, printRequestSummary, resetRequestCount } from '../../lib/api';

export function ApiMonitor() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(getRequestCount());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePrintSummary = () => {
    printRequestSummary();
  };

  const handleReset = () => {
    resetRequestCount();
    setCount(0);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>API Monitor</Text>
        <Text style={styles.count}>Requests: {count}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handlePrintSummary}>
            <Text style={styles.buttonText}>Log Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 4,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
  },
}); 