import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './screens/searchScreen';
import DetailScreen from './screens/DetailScreen';


export type RootStackParamList = {
  Search: undefined;
  Detail: {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Search">
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{
            title: 'Recipe Details',
            headerBackTitle: 'Back',
          }}
           />
      </Stack.Navigator>
    </NavigationContainer>
  );
}