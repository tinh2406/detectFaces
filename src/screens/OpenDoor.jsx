import {API_URL} from '@env';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {AuthContext} from '../contexts/authContext';
import {useNetInfo} from '@react-native-community/netinfo';
import deepEqual from 'deep-equal';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import ToggleSwitch from 'toggle-switch-react-native';
import prompt from 'react-native-prompt-android';
import axios from 'axios';
export default function OpenDoor() {
  const {user} = useContext(AuthContext);
  const netInfor = useNetInfo();
  useFocusEffect(React.useCallback(() => {}, [netInfor]));
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
      {netInfor.isConnected && (
        <FlatList
          data={user.addressDoor}
          renderItem={({item}) => <Item address={item} />}
          keyExtractor={item => item.addressDoor}
          item></FlatList>
      )}
    </SafeAreaView>
  );
}

const Item = ({address}) => {
  const {addressDoor, name, status} = address;
  const {user, setUser} = useContext(AuthContext);
  const {phone, owner} = user;
  const [loading, setLoading] = useState(false);
  const [resToggle, setResToggle] = useState();

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        // console.log("getDoor loop")
        const door = (
          await firestore().collection('devices').doc(addressDoor).get()
        ).data();
        if (!deepEqual(address, door)) {
          const newAddress = user.addressDoor.map(i => {
            if (i.addressDoor === door.addressDoor) return door;
            return i;
          });
          setUser({...user, addressDoor: newAddress});
        }
      };
      const intervalId = setInterval(() => {
        fetch();
      }, 500);
      return () => {
        clearInterval(intervalId);
      };
    }, [user]),
  );

  const handleTogglePress = async () => {
    setLoading(true);
    if (status) {
      const res = await axios.post(`${API_URL}:3000/lockDoor`, {
        phone,
        addressDoor,
      });
      console.log(status);
      if (res.data.message === 'Locked') {
        setResToggle(false);
      }
      console.log(res.data.message);
    } else {
      const res = await axios.post(`${API_URL}:3000/unlockDoor`, {
        phone,
        addressDoor,
      });
      console.log(status);
      if (res.data.message === 'Unlocked') {
        setResToggle(true);
      }
      console.log(res.data.message);
    }
  };
  useEffect(() => {
    if (status === resToggle) setLoading(false);
  }, [status, resToggle]);
  const handleLongPress = () => {
    prompt(
      'Enter name',
      `Enter name for ${addressDoor}`,
      [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Cancel Pressed');
          },
          style: 'cancel',
        },
        {text: 'OK', onPress: updateName},
      ],
      {
        type: 'text',
        cancelable: false,
        defaultValue: `${name}`,
        placeholder: 'Enter name',
      },
    );
  };
  const updateName = async name => {
    console.log(owner);
    if (owner) {
      await firestore()
        .collection('devices')
        .doc(addressDoor)
        .set({name}, {merge: true});
    }
  };
  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          flexDirection: 'row',
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 10,
          margin: 8,
          padding: 8,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text style={{color: 'black', fontSize: 16}}>{addressDoor}</Text>
          <Text style={{color: 'black', fontSize: 16}}>{name}</Text>
        </View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={status ? '#ffffff' : '#00ff00'}
          />
        ) : (
          <ToggleSwitch
            isOn={status}
            onColor="green"
            offColor="gray"
            onToggle={handleTogglePress}
          />
        )}
      </View>
      {/* <Prompt
                title={addressDoor}
                placeholder="Name"
                defaultValue={name}
                visible={promptVisible}
                onCancel={()=>{setPromptVisible(false)}}
                onSubmit={(value) => {
                    setPromptVisible(false)
                }} /> */}
    </TouchableOpacity>
  );
};
