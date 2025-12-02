const crypto = require('crypto');

/**
 * Verify Telegram Web App init data
 * According to: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * @param {string} initData - The init data string from Telegram Web App
 * @param {string} botToken - The bot token
 * @returns {boolean} - True if data is valid
 */
function verifyTelegramWebAppData(initData, botToken) {
  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }
    
    // Remove hash from params
    urlParams.delete('hash');
    
    // Create data-check-string
    const dataCheckArray = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArray.push(`${key}=${value}`);
    }
    dataCheckArray.sort();
    const dataCheckString = dataCheckArray.join('\n');
    
    // Compute secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Compute hash
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare hashes
    return computedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram Web App data:', error);
    return false;
  }
}

/**
 * Extract user data from init data
 * @param {string} initData - The init data string
 * @returns {object|null} - User data or null if invalid
 */
function extractUserData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }
    
    return JSON.parse(userParam);
  } catch (error) {
    console.error('Error extracting user data:', error);
    return null;
  }
}

/**
 * Check if init data is expired (older than 1 hour)
 * @param {string} initData - The init data string
 * @returns {boolean} - True if data is still valid
 */
function checkInitDataExpiry(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = parseInt(urlParams.get('auth_date'));
    
    if (!authDate) {
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = 3600; // 1 hour in seconds
    
    return (currentTime - authDate) <= expiryTime;
  } catch (error) {
    console.error('Error checking init data expiry:', error);
    return false;
  }
}

module.exports = {
  verifyTelegramWebAppData,
  extractUserData,
  checkInitDataExpiry
};
