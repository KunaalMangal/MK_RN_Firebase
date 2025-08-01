/**
 * @format
 */

import {AppRegistry} from 'react-native';

import App from './App';
import {name as appName} from './app.json';
import {NotificationService} from './src/utils';
import {FirebaseNotification} from './src/services';

NotificationService.registerBackgroundHandler();
FirebaseNotification.registerFirebaseBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
