import {AppRegistry,PermissionsAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import firebaseApp from './firebase' 
import messaging from '@react-native-firebase/messaging'
import UpdateNotifyBackground from './src/utils/updateNotify';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);


firebaseApp

messaging().setBackgroundMessageHandler(async remoteMessage => {
    UpdateNotifyBackground() 
    console.log('Message handled in the background!', remoteMessage);
  });

AppRegistry.registerComponent(appName, () => App);

