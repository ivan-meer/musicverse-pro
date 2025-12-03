const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Replace with your Telegram ID (get it from bot when you send /start)
const TELEGRAM_ID = '123456789'; // Update this!

async function testAPI() {
  console.log('🧪 Testing MusicVerse Pro API\n');

  try {
    // Test 1: Create playlist
    console.log('1️⃣ Creating playlist...');
    const createResult = await axios.post(`${BASE_URL}/playlists`, {
      telegram_id: TELEGRAM_ID,
      name: 'Test Playlist',
      description: 'Created via API test'
    });
    console.log('✅ Playlist created:', createResult.data);
    const playlistId = createResult.data.playlist?.id;

    // Test 2: Get playlists
    console.log('\n2️⃣ Getting playlists...');
    const getResult = await axios.get(`${BASE_URL}/playlists/${TELEGRAM_ID}`);
    console.log('✅ Playlists:', getResult.data);

    // Test 3: Add track to playlist
    if (playlistId) {
      console.log('\n3️⃣ Adding track to playlist...');
      const trackResult = await axios.post(`${BASE_URL}/playlists/${playlistId}/tracks`, {
        track_id: 'track_001',
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 180
      });
      console.log('✅ Track added:', trackResult.data);
    }

    // Test 4: Add to favorites
    console.log('\n4️⃣ Adding to favorites...');
    const favResult = await axios.post(`${BASE_URL}/favorites`, {
      telegram_id: TELEGRAM_ID,
      track_id: 'track_002',
      title: 'Favorite Song',
      artist: 'Favorite Artist',
      duration: 200
    });
    console.log('✅ Added to favorites:', favResult.data);

    // Test 5: Get favorites
    console.log('\n5️⃣ Getting favorites...');
    const getFavResult = await axios.get(`${BASE_URL}/favorites/${TELEGRAM_ID}`);
    console.log('✅ Favorites:', getFavResult.data);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
