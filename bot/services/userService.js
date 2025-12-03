const { supabase } = require('./supabaseClient');

/**
 * Create or update user in database
 * @param {Object} userData - Telegram user data
 * @returns {Promise<Object>} User record
 */
async function createOrUpdateUser(userData) {
  try {
    const { telegram_id, username, first_name } = userData;
    
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          username,
          first_name
        })
        .eq('telegram_id', telegram_id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('User updated:', data.id);
      return { success: true, user: data, isNew: false };
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          telegram_id,
          username,
          first_name
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('User created:', data.id);
      return { success: true, user: data, isNew: true };
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка, попробуйте позже' 
    };
  }
}

/**
 * Get user by Telegram ID
 * @param {number} telegramId - Telegram user ID
 * @returns {Promise<Object>} User record
 */
async function getUserByTelegramId(telegramId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'User not found' };
      }
      throw error;
    }
    
    return { success: true, user: data };
  } catch (error) {
    console.error('Error in getUserByTelegramId:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка, попробуйте позже' 
    };
  }
}

module.exports = {
  createOrUpdateUser,
  getUserByTelegramId
};
