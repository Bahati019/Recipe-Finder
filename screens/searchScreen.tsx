import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
  const [loading, setLoading] = useState(false);
  const [mealOfDay, setMealOfDay] = useState<Meal | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchMealOfTheDay = async () => {
      try {
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
        const meal = response.data.meals[0];
        setMealOfDay({
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb,
        });
      } catch (err) {
        console.error('Error fetching the meal of the day', err);
      }
    };
    fetchMealOfTheDay();
  }, []);

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ meals: Meal[] | null }>(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: Meal; index: number }) => (
    <Animatable.View animation="fadeInUp" duration={500} delay={index * 100} useNativeDriver>
      <View style={styles.card}>
        <Image source={{ uri: item.strMealThumb }} style={styles.image} />
        <Text
          style={styles.title}
          onPress={() =>
            navigation.navigate('Detail', {
              idMeal: item.idMeal,
              strMeal: item.strMeal,
              strMealThumb: item.strMealThumb,
            })
          }
        >
          {item.strMeal}
        </Text>
      </View>
    </Animatable.View>
  );

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.idMeal}
      renderItem={renderItem}
      ListEmptyComponent={() =>
         !loading ? <Text style={styles.emptyText}>No recipes found.</Text> : null
        }

      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>🍲 Recipe Finder</Text>
          <MaterialCommunityIcons
            name="food"
            size={48}
            color="#FF6F61"
            style={{ alignSelf: 'center', marginBottom: 10 }}
          />
          <Text style={styles.subheading}>
            Discover delicious meals from around the world!
          </Text>

          <View style={styles.searchSection}>
            <TextInput
              style={styles.input}
              placeholder="Search Meals..."
              value={query}
              onChangeText={setQuery}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity onPress={searchRecipes} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={styles.favoritesButton}
          >
            <Text style={styles.favoritesButtonText}>❤️ View Favorites</Text>
          </TouchableOpacity>

          {query === '' && mealOfDay && (
            <View>
              <Text style={styles.subheading}>🍛 Meal of the Day</Text>
              <Animatable.View animation="fadeInUp" delay={100} useNativeDriver>
                <View style={styles.card}>
                  <Image source={{ uri: mealOfDay.strMealThumb }} style={styles.image} />
                  <Text
                    style={styles.title}
                    onPress={() =>
                      navigation.navigate('Detail', {
                        idMeal: mealOfDay.idMeal,
                        strMeal: mealOfDay.strMeal,
                        strMealThumb: mealOfDay.strMealThumb,
                      })
                    }
                  >
                    {mealOfDay.strMeal}
                  </Text>
                </View>
              </Animatable.View>
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#FF7F50" style={{ marginTop: 20 }} />}
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF8F0',
    paddingBottom: 40,
  },
  headerContainer: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesButton: {
    backgroundColor: '#FF7F50',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  favoritesButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
});
