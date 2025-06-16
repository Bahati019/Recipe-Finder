import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favoriteRecipes';

export type FavoriteRecipe = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export async function getFavorites(): Promise<FavoriteRecipe[]> {
  const json = await AsyncStorage.getItem(FAVORITES_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addFavorite(recipe: FavoriteRecipe): Promise<void> {
  const favorites = await getFavorites();
  const exists = favorites.some((fav) => fav.idMeal === recipe.idMeal);
  if (!exists) {
    favorites.push(recipe);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  const updated = favorites.filter((fav) => fav.idMeal !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((fav) => fav.idMeal === id);
}
