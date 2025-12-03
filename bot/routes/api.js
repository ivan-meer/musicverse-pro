const express = require('express');
const router = express.Router();
const { getUserByTelegramId } = require('../services/userService');
const {
  createPlaylist,
  getUserPlaylists,
  addTrackToPlaylist,
  deletePlaylist,
  getPlaylistWithTracks
} = require('../services/playlistService');
const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
} = require('../services/favoritesService');

// Middleware to get user from telegram_id
async function getUserMiddleware(req, res, next) {
  const telegramId = req.params.userId || req.body.telegram_id;
  
  if (!telegramId) {
    return res.status(400).json({
      success: false,
      error: 'telegram_id обязателен'
    });
  }

  const result = await getUserByTelegramId(parseInt(telegramId));
  
  if (!result.success) {
    return res.status(404).json(result);
  }

  req.user = result.user;
  next();
}

// Playlist routes
router.get('/playlists/:userId', getUserMiddleware, async (req, res) => {
  const result = await getUserPlaylists(req.user.id);
  res.json(result);
});

router.post('/playlists', getUserMiddleware, async (req, res) => {
  const { name, description } = req.body;
  const result = await createPlaylist(req.user.id, name, description);
  res.json(result);
});

router.get('/playlists/:playlistId/tracks', async (req, res) => {
  const { playlistId } = req.params;
  const result = await getPlaylistWithTracks(playlistId);
  res.json(result);
});

router.post('/playlists/:playlistId/tracks', async (req, res) => {
  const { playlistId } = req.params;
  const trackData = req.body;
  const result = await addTrackToPlaylist(playlistId, trackData);
  res.json(result);
});

router.delete('/playlists/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  const result = await deletePlaylist(playlistId);
  res.json(result);
});

// Favorites routes
router.get('/favorites/:userId', getUserMiddleware, async (req, res) => {
  const result = await getUserFavorites(req.user.id);
  res.json(result);
});

router.post('/favorites', getUserMiddleware, async (req, res) => {
  const trackData = req.body;
  const result = await addToFavorites(req.user.id, trackData);
  res.json(result);
});

router.delete('/favorites/:trackId', getUserMiddleware, async (req, res) => {
  const { trackId } = req.params;
  const result = await removeFromFavorites(req.user.id, trackId);
  res.json(result);
});

module.exports = router;
