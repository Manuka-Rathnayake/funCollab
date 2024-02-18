
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You should have the expo vector icons installed

const Dashboard = () => {
  // Render project placeholders
  const renderProjectPlaceholders = () => {
    const placeholders = [];
    for (let i = 0; i < 10; i++) {
      placeholders.push(
        <TouchableOpacity key={i} style={styles.projectPlaceholder}>
          {/* Project content goes here */}
        </TouchableOpacity>
      );
    }
    return placeholders;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="md-menu" size={24} color="white" />
        <Text style={styles.headerText}>Dashboard</Text>
        <Ionicons name="md-grid" size={24} color="white" />
      </View>
      <Text style={styles.welcomeText}>Welcome User!</Text>
      <TouchableOpacity style={styles.searchButton}>
        <Ionicons name="md-search" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.projectsHeader}>Your Projects</Text>
      <ScrollView contentContainerStyle={styles.projectsGrid}>
        {renderProjectPlaceholders()}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="md-add" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7f7fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#5f5fc4',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    margin: 16,
  },
  searchButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  projectsHeader: {
    fontSize: 16,
    color: 'white',
    marginLeft: 16,
    marginTop: 16,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#5f5fc4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  projectPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#8f8fc4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});

export default Dashboard;
