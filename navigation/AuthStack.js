import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomepageScreen from '../screens/HomepageScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LearnMoreScreen from '../screens/LearnMoreScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="HomepageScreen">
      <Stack.Screen name="HHomepageScreenomepage" component={HomepageScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="LearnMoreScreen" component={LearnMoreScreen} />
    </Stack.Navigator>
  );
}
