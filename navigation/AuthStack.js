import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LearnMoreScreen from '../screens/LearnMoreScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{headerTransparent: true, headerTintColor: '#fff'}}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown: false}}/>
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: "Login"}}/>
      <Stack.Screen name="SignupScreen" component={SignupScreen} options={{title: "Signup"}}/>
      <Stack.Screen name="LearnMoreScreen" component={LearnMoreScreen} options={{title: "Learn More"}}/>
    </Stack.Navigator>
  );
}