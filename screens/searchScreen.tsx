import React, { use, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export default function SearchScreen() {
  const [query, setQuery] = useState<string>('');
  const [recipes, setRecipes] = useState<Meal[]>([]);

  const searchRecipes = async () => {
    try {
      const response = await axios.get<{ meals: Meal[] | null }>(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const renderItem = ({ item }: { item: Meal }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.strMealThumb }} style={styles.image} />
      <Text style={styles.title} onPress={() =>
        navigation.navigate('Detail', {
        idMeal: item.idMeal,
        strMeal: item.strMeal,
        strMealThumb: item.strMealThumb,
      })
    }>
      {item.strMeal}
    </Text>
  </View>
);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recipe Finder</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a recipe..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={searchRecipes} />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.idMeal}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No recipes found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 40 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { marginTop: 8, fontSize: 18, fontWeight: '600' },
});
