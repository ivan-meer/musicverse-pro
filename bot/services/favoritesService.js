const { supabase } = require('./supabaseClient');

/**
 * Add track to favorites
 * @param {string} userId - User UUID
 * @param {Object} trackData - Track information
 * @returns {Promise<Object>} Added favorite
 */
async function addToFavorites(userId, trackData) {
  try {
    const { track_id, title, artist, duration } = trackData;

    if (!track_id) {
      return {
        success: false,
        error: 'Track ID обязателен'
      };
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        track_id,
        track_data: {
          title: title || 'Unknown',
          artist: artist || 'Unknown',
          duration: duration || 0
        }
      }])
      .select()
      .single();

    if (error) {
      // Check for duplicate
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Этот трек уже в избранном'
        };
      }
      throw error;
    }

    console.log('Track added to favorites:', data.id);
    return { success: true, favorite: data };
  } catch (error) {
    console.error('Error in addToFavorites:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Remove track from favorites
 * @param {string} userId - User UUID
 * @param {string} trackId - Track ID
 * @returns {Promise<Object>} Deletion result
 */
async function removeFromFavorites(userId, trackId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId);

    if (error) throw error;

    console.log('Track removed from favorites:', trackId);
    return { success: true };
  } catch (error) {
    console.error('Error in removeFromFavorites:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Get all favorites for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User favorites
 */
async function getUserFavorites(userId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return { success: true, favorites: data };
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
};
