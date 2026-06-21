// import { Platform } from 'react-native';
// import PushNotification from 'react-native-push-notification'

// const LocalNotification = () => {
//     const key = Date.now().toString();
//     if (Platform.OS === 'android') {
//         PushNotification.createChannel(
//             {
//                 channelId: key,
//                 channelName: "Local messasge",
//                 channelDescription: "Notification for Local message",
//                 importance: 4,
//                 vibrate: true,
//             },
//             (created) => console.log(`createChannel returned '${created}'`)
//         );
//         PushNotification.localNotification({
//             channelId: key,
//             title: 'Local Message',
//             message: 'Local message !!',
//         })
//     }
// };

// export default LocalNotification