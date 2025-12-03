const { supabase } = require('./supabaseClient');

/**
 * Create a new playlist
 * @param {string} userId - User UUID
 * @param {string} name - Playlist name
 * @param {string} description - Playlist description
 * @returns {Promise<Object>} Created playlist
 */
async function createPlaylist(userId, name, description = '') {
  try {
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Название не может быть пустым'
      };
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert([{
        user_id: userId,
        name: name.trim(),
        description: description.trim()
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('Playlist created:', data.id);
    return { success: true, playlist: data };
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Get all playlists for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User playlists
 */
async function getUserPlaylists(userId) {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, playlists: data };
  } catch (error) {
    console.error('Error in getUserPlaylists:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Add track to playlist
 * @param {string} playlistId - Playlist UUID
 * @param {Object} trackData - Track information
 * @returns {Promise<Object>} Added track
 */
async function addTrackToPlaylist(playlistId, trackData) {
  try {
    const { track_id, title, artist, duration } = trackData;

    if (!track_id) {
      return {
        success: false,
        error: 'Track ID обязателен'
      };
    }

    const { data, error } = await supabase
      .from('playlist_tracks')
      .insert([{
        playlist_id: playlistId,
        track_id,
        track_data: {
          title: title || 'Unknown',
          artist: artist || 'Unknown',
          duration: duration || 0
        }
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('Track added to playlist:', data.id);
    return { success: true, track: data };
  } catch (error) {
    console.error('Error in addTrackToPlaylist:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Delete playlist
 * @param {string} playlistId - Playlist UUID
 * @returns {Promise<Object>} Deletion result
 */
async function deletePlaylist(playlistId) {
  try {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;

    console.log('Playlist deleted:', playlistId);
    return { success: true };
  } catch (error) {
    console.error('Error in deletePlaylist:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

/**
 * Get playlist with tracks
 * @param {string} playlistId - Playlist UUID
 * @returns {Promise<Object>} Playlist with tracks
 */
async function getPlaylistWithTracks(playlistId) {
  try {
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (playlistError) throw playlistError;

    const { data: tracks, error: tracksError } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: true });

    if (tracksError) throw tracksError;

    return {
      success: true,
      playlist: {
        ...playlist,
        tracks
      }
    };
  } catch (error) {
    console.error('Error in getPlaylistWithTracks:', error);
    return {
      success: false,
      error: 'Произошла ошибка, попробуйте позже'
    };
  }
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addTrackToPlaylist,
  deletePlaylist,
  getPlaylistWithTracks
};
