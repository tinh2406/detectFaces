import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import deepEqual from 'deep-equal';
import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {AuthContext} from '../contexts/authContext';
import AddFace from '../screens/AddFace';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Notifys from '../screens/Notifys';
import OpenDoor from '../screens/OpenDoor';
import User from '../screens/User';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Tab = createBottomTabNavigator();

export default function TabNavigator({route}) {
  const {user} = useContext(AuthContext);
  console.log(route);

  useFocusEffect(
    React.useCallback(() => {
      const unsub = async () => {
        console.log(user, 'user');
        if (user) {
          await messaging().registerDeviceForRemoteMessages();
          const token = await messaging().getToken();
          try {
            await firestore()
              .collection('tokens')
              .doc(user.phone)
              .update({
                devices: firestore.FieldValue.arrayUnion(token),
              });
          } catch (error) {
            await firestore()
              .collection('tokens')
              .doc(user.phone)
              .set(
                {
                  devices: [token],
                },
                {merge: true},
              );
          }
          console.log(token);
        }
      };
      unsub();
      return () => {
        unsub;
      };
    }, [user]),
  );

  if (!user) return <Login />;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'dodgerblue',
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddFace"
        initialParams={
          route?.params?.screen === 'AddFace'
            ? {message: route.params.message}
            : ''
        }
        component={AddFace}
        options={{
          tabBarLabel: 'AddFace',
          tabBarIcon: ({color, size}) => (
            <Icon name="face" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="OpenDoor"
        component={OpenDoor}
        options={{
          tabBarLabel: 'OpenDoor',
          tabBarIcon: ({color, size}) => (
            <Icon name="sensor-door" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifys"
        component={Notifys}
        options={{
          tabBarLabel: 'Notifys',
          tabBarIcon: ({color, size}) => (
            <Icon name="notifications-active" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        options={{
          tabBarLabel: 'User',
          tabBarIcon: ({color, size}) => (
            <Icon name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
