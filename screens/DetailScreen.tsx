import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList } from '../App';
import { addFavorite, removeFavorite, isFavorite } from '../utils/storage';
import { TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // for heart icon

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

type MealDetail = {
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: any;
};

export default function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { idMeal } = route.params;

  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        if (response.data.meals.length > 0) {
            const data = response.data.meals[0];
            setMeal(data);
            const fav = await isFavorite(idMeal);
            setFavorite(fav);
        }
      } catch (error) {
        console.error('Failed to load meal details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [idMeal]);
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>Recipe not found.</Text>
      </View>
    );
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push(`${measure} ${ingredient}`);
    }
  }
  <TouchableOpacity
  style={{ alignSelf: 'flex-end', marginBottom: 10 }}
  onPress={async () => {
    if (favorite) {
      await removeFavorite(meal.idMeal);
      setFavorite(false);
    } else {
      await addFavorite(meal.idMeal);
      setFavorite(true);
    }
  }}
>
  <AntDesign
    name={favorite ? 'heart' : 'hearto'}
    size={28}
    color={favorite ? 'red' : 'gray'}
  />
</TouchableOpacity>
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{meal.strMeal}</Text>
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
      <Text style={styles.subtitle}>Category: {meal.strCategory}</Text>
      <Text style={styles.subtitle}>Cuisine: {meal.strArea}</Text>
      <Text style={styles.heading}>Ingredients:</Text>
      {ingredients.map((item, index) => (
        <Text key={index} style={styles.text}>• {item}</Text>
      ))}
      <Text style={styles.heading}>Instructions:</Text>
      <Text style={styles.text}>{meal.strInstructions}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 6,
  },
});
