import React from 'react';
import {StatusBar, StyleSheet, View, Button} from 'react-native';

function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Button title="데이터 수집 시작" onPress={() => {}} color={'#000000'} />
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

export default App;
