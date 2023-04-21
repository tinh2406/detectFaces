import {useNetInfo} from '@react-native-community/netinfo';
import {useFocusEffect} from '@react-navigation/native';
import React, {useContext} from 'react';
import {FlatList, SafeAreaView, Text} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';
import DoorItem from '../components/DoorItem';
import {AuthContext} from '../contexts/authContext';
import DoorItemBluetooth from '../components/DoorItemBluetooth';
export default function OpenDoor() {
  const {user} = useContext(AuthContext);
  const netInfor = useNetInfo();

  useFocusEffect(
    React.useCallback(() => {
      const unsub = async () => {
        BluetoothSerial.isEnabled().then(res => {
          console.log('Status bluetooth', res);
          if (!res) {
            BluetoothSerial.enable()
              .then(res => {
                console.log('Bật thành công', res);
              })
              .catch(err => {
                console.log('Bật thất bại', err);
              });
          }
        });
      };
      unsub();
    }, [netInfor]),
  );
  return (
    <SafeAreaView style={{backgroundColor: 'dodgerblue', flex: 1}}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
        }}>
        Devices
      </Text>
      {netInfor.isConnected ? (
        <FlatList
          data={user.devices}
          renderItem={({item}) => <DoorItem address={item} />}
          keyExtractor={item => item.addressDoor}
          item></FlatList>
      ) : (
        <FlatList
          data={user.devices}
          renderItem={({item}) => <DoorItemBluetooth address={item} />}
          keyExtractor={item => item.addressDoor}
          item></FlatList>
      )}
    </SafeAreaView>
  );
}
