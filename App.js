import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import React,{useState} from 'react';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function App() {

  const [value,setValue] = useState(0);

  return (
    <View style={styles.container}>
      <Text>Project Progress</Text>
      <CircularProgress 
        radius={90} 
        value={85} 
        textColor='#222' 
        fontSize = {20} 
        valueSuffix={'%'} 
        inActiveStrokeColor='#2ecc71' 
        inActiveStrokeOpacity={0.2}
        duration={3000}>

        </CircularProgress>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
