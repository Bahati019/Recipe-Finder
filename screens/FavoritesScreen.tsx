import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFavorites, FavoriteRecipe, removeFavorite } from '../utils/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

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
    Toast.show({
      type: 'info',
      text1: 'Recipe Removed 🗑️',
    });
  };

  const renderItem = ({ item }: { item: FavoriteRecipe }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
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
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.cardGradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {item.strMeal}
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemove(item.idMeal)}
          >
            <Feather name="trash-2" size={16} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      key={'2-column-grid'}
      data={favorites}
      keyExtractor={(item) => item.idMeal}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Your Favorites</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="heart-broken-outline" size={64} color="#FFD1CC" style={{ marginBottom: 16 }} />
          <Text style={styles.empty}>No favorites yet.</Text>
          <Text style={styles.emptySub}>Start exploring and save some recipes!</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFBF7',
    paddingBottom: 40,
    minHeight: '100%',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3142',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 80,
  },
  empty: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3142',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 16,
    color: '#9094A6',
    fontWeight: '500',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    height: 180,
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
    height: '60%',
    padding: 12,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 111, 97, 0.9)',
    padding: 8,
    borderRadius: 10,
  },
});
