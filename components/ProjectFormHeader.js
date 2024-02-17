// ProjectFormHeader.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ProjectFormHeader = ({ projectName, setProjectName, email, setEmail, searchUsersByEmail, startDate, setStartDate, endDate, setEndDate, handleSubmit }) => {
    return (
        <View>
            <Text style={styles.headerText}>Create your project</Text>
            <TextInput
                style={styles.input}
                placeholder="Project name"
                value={projectName}
                onChangeText={setProjectName}
            />
            <TextInput
                style={styles.input}
                placeholder="Invite friends by email"
                value={email}
                onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={searchUsersByEmail}>
                <Text style={styles.buttonText}>Search Users</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Start date"
                value={startDate}
                onChangeText={setStartDate}
            />
            <TextInput
                style={styles.input}
                placeholder="End date"
                value={endDate}
                onChangeText={setEndDate}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerText: {
        fontSize: 24,
        color: 'white',
        padding: 16,
    },
    input: {
        height: 50,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#5f5fc4',
        padding: 10,
        margin: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default ProjectFormHeader;
