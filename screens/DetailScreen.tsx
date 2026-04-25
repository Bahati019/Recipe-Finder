import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../App';
import { addFavorite, removeFavorite, isFavorite } from '../utils/storage';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

type MealDetail = {
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: any;
};

const { width } = Dimensions.get('window');

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
        <ActivityIndicator size="large" color="#FF7F50" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={48} color="#FF6F61" style={{ marginBottom: 16 }} />
        <Text style={styles.notFoundText}>Recipe not found.</Text>
      </View>
    );
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({ ingredient, measure });
    }
  }
  
  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageGradient}
        />
        <TouchableOpacity 
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={async () => {
            if (favorite) {
              await removeFavorite(meal.idMeal);
              setFavorite(false);
              Toast.show({
                type: 'info',
                text1: 'Removed from Favorites 🗑️',
              });
            } else {
              await addFavorite({
                idMeal: meal.idMeal,
                strMeal: meal.strMeal,
                strMealThumb: meal.strMealThumb,
              });
              setFavorite(true);
              Toast.show({
                type: 'success',
                text1: 'Added to Favorites ✨',
                text2: 'You can find it in your favorites tab.',
              });
            }
          }}
        >
          <LinearGradient
            colors={favorite ? ['#FFEDEB', '#FFF'] : ['#FFF', '#FFF']}
            style={styles.favoriteGradient}
          >
            <MaterialCommunityIcons
              name={favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={favorite ? '#FF6F61' : '#2D3142'}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{meal.strMeal}</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Feather name="grid" size={14} color="#FF7F50" />
              <Text style={styles.tagText}>{meal.strCategory}</Text>
            </View>
            <View style={styles.tag}>
              <Feather name="map-pin" size={14} color="#FF7F50" />
              <Text style={styles.tagText}>{meal.strArea}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Ingredients</Text>
          <View style={styles.ingredientsCard}>
            {ingredients.map((item, index) => (
              <View key={index} style={[styles.ingredientRow, index !== ingredients.length - 1 && styles.borderBottom]}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientName}>{item.ingredient}</Text>
                <Text style={styles.ingredientMeasure}>{item.measure}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Instructions</Text>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>{meal.strInstructions}</Text>  
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
  },
  notFoundText: {
    fontSize: 18,
    color: '#9094A6',
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  favoriteGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3142',
    marginBottom: 12,
    lineHeight: 34,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  tagText: {
    color: '#FF6F61',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3142',
    marginBottom: 16,
  },
  ingredientsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7F50',
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#2D3142',
    fontWeight: '500',
  },
  ingredientMeasure: {
    fontSize: 16,
    color: '#9094A6',
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  instructionText: {
    fontSize: 16,
    color: '#4A4D5E',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
});
