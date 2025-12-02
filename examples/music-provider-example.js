/**
 * Example: Music API Provider Integration
 * 
 * This file demonstrates how to integrate with external music API providers
 * like Spotify, Deezer, or any other music service.
 */

const axios = require('axios');

/**
 * Example: Spotify API Integration
 */
class SpotifyProvider {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseURL = 'https://api.spotify.com/v1';
    this.accessToken = null;
  }

  /**
   * Authenticate with Spotify API
   */
  async authenticate() {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      throw error;
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query, limit = 20) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit: limit
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: this.formatDuration(track.duration_ms),
        preview_url: track.preview_url,
        cover_url: track.album.images[0]?.url,
        external_url: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      throw error;
    }
  }

  /**
   * Format duration from milliseconds to MM:SS
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
}

module.exports = {
  SpotifyProvider
};
