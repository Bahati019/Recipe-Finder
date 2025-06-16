import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFavorites, FavoriteRecipe, removeFavorite } from '../utils/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AntDesign } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchFavorites = async () => {
      const favs = await getFavorites();
      setFavorites(favs);
    };

    const unsubscribe = navigation.addListener('focus', fetchFavorites);
    return unsubscribe;
  }, [navigation]);

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    const updated = favorites.filter((item) => item.idMeal !== id);
    setFavorites(updated);
  };

  const renderItem = ({ item }: { item: FavoriteRecipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Detail', {
          idMeal: item.idMeal,
          strMeal: item.strMeal,
          strMealThumb: item.strMealThumb,
        })
      }
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.strMeal}</Text>
        <TouchableOpacity onPress={() => handleRemove(item.idMeal)}>
          <AntDesign name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>❤️ Your Favorite Recipes</Text>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
