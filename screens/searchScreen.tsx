import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  Dimensions,
  ScrollView,
} from 'react-native';
import axios from 'axios';

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

const CATEGORIES = ['Seafood', 'Beef', 'Chicken', 'Vegetarian', 'Dessert', 'Pasta'];
const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const [query, setQuery] = useState<string>('');
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [mealOfDay, setMealOfDay] = useState<Meal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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
    if (!query.trim()) return;
    setSelectedCategory('');
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

  const fetchByCategory = async (cat: string) => {
    setSelectedCategory(cat);
    setQuery('');
    setLoading(true);
    try {
      const response = await axios.get<{ meals: Meal[] | null }>(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: Meal; index: number }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('Detail', {
            idMeal: item.idMeal,
            strMeal: item.strMeal,
            strMealThumb: item.strMealThumb,
          })
        }
      >
        <Image source={{ uri: item.strMealThumb }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {item.strMeal}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.idMeal}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListEmptyComponent={() =>
         !loading && query !== '' ? <Text style={styles.emptyText}>No recipes found.</Text> : null
      }
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, Chef! 👨‍🍳</Text>
              <Text style={styles.subheading}>What are you craving today?</Text>
            </View>
          </View>

          <View style={styles.searchSection}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search for delicious meals..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchRecipes}
              placeholderTextColor="#999"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={searchRecipes} style={styles.searchAction}>
                <LinearGradient colors={['#FF7F50', '#FF6F61']} style={styles.searchActionGradient}>
                  <Feather name="arrow-right" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    onPress={() => fetchByCategory(cat)}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  >
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {query === '' && selectedCategory === '' && mealOfDay && (
            <View style={styles.mealOfDayContainer}>
              <Text style={styles.sectionTitle}>Chef's Pick of the Day</Text>
              <View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.featuredCard}
                  onPress={() =>
                    navigation.navigate('Detail', {
                      idMeal: mealOfDay.idMeal,
                      strMeal: mealOfDay.strMeal,
                      strMealThumb: mealOfDay.strMealThumb,
                    })
                  }
                >
                  <Image source={{ uri: mealOfDay.strMealThumb }} style={styles.featuredImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.featuredGradient}
                  >
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Must Try 🔥</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{mealOfDay.strMeal}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(query !== '' || selectedCategory !== '') && recipes.length > 0 && (
            <Text style={styles.sectionTitle}>Search Results</Text>
          )}

          {loading && <ActivityIndicator size="large" color="#FF7F50" style={{ marginTop: 40 }} />}
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FDFBF7',
    paddingBottom: 40,
    minHeight: '100%',
  },
  headerContainer: {
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3142',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#9094A6',
    fontWeight: '500',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3142',
    height: 40,
    fontWeight: '500',
  },
  searchAction: {
    marginLeft: 8,
  },
  searchActionGradient: {
    padding: 8,
    borderRadius: 12,
  },
  categoriesContainer: {
    marginBottom: 24,
    marginLeft: -4,
  },
  categoriesScroll: {
    paddingRight: 16,
    paddingVertical: 5,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9094A6',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  mealOfDayContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3142',
    marginBottom: 16,
  },
  featuredCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  badge: {
    backgroundColor: '#FF7F50',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 12,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#9094A6',
    fontWeight: '500',
  },
});
