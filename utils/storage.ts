import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favoriteRecipes';

export async function getFavorites(): Promise<string[]> {
  const json = await AsyncStorage.getItem(FAVORITES_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  const updated = favorites.filter((fav) => fav !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(id);
}
