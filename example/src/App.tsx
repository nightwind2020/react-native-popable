/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Popable } from 'react-native-popable';

export default function App() {
  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.top}>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
        </View>
        <View style={styles.center}>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
        </View>
        <View style={styles.buttom}>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
          <View>
            <Popable content="See profile">
              <Text>top</Text>
            </Popable>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  buttom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
