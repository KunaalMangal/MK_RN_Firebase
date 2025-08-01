/**
 * MK_RN_Firebase
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { NewAppScreen } from '@react-native/new-app-screen';

import { FirebaseNotification } from './src/services';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
    FirebaseNotification.init();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NewAppScreen templateFileName="App.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
