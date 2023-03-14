import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import firebaseApp from './firebase' 

firebaseApp
AppRegistry.registerComponent(appName, () => App);

