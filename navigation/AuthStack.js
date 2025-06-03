import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomepageScreen from '../screens/HomepageScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LearnMoreScreen from '../screens/LearnMoreScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Homepage">
      <Stack.Screen name="Homepage" component={HomepageScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="LearnMore" component={LearnMoreScreen} />
    </Stack.Navigator>
  );
}
