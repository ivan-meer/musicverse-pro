const cors = require('cors');
const { verifyTelegramWebAppData, extractUserData, checkInitDataExpiry } = require('./utils/auth');

/**
 * Setup Web App routes and middleware
 */
function setupWebApp(app) {
  // Enable CORS for Telegram Mini App
  app.use(cors({
    origin: ['https://web.telegram.org', 'https://telegram.org'],
    credentials: true
  }));

  // API endpoint to verify Telegram Web App data
  app.post('/api/auth/verify', (req, res) => {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({
        success: false,
        message: 'Init data is required'
      });
    }

    try {
      // Verify the init data signature
      const isValid = verifyTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid init data signature'
        });
      }

      // Check if data is not expired
      const isNotExpired = checkInitDataExpiry(initData);
      
      if (!isNotExpired) {
        return res.status(401).json({
          success: false,
          message: 'Init data has expired'
        });
      }

      // Extract user data
      const userData = extractUserData(initData);
      
      if (!userData) {
        return res.status(401).json({
          success: false,
          message: 'Could not extract user data'
        });
      }

      // Authentication successful
      res.json({
        success: true,
        message: 'Authentication successful',
        user: userData
      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // API endpoint for user data
  app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    // TODO: Fetch user data from database
    res.json({
      userId,
      playlists: [],
      favorites: [],
      settings: {}
    });
  });

  // API endpoint for music recommendations
  app.get('/api/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
      // TODO: Get recommendations from music service
      const recommendations = [
        {
          id: '1',
          title: 'Sample Track 1',
          artist: 'Artist 1',
          genre: 'Electronic',
          duration: '3:45'
        },
        {
          id: '2',
          title: 'Sample Track 2',
          artist: 'Artist 2',
          genre: 'Rock',
          duration: '4:20'
        }
      ];
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching recommendations'
      });
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = { setupWebApp };
