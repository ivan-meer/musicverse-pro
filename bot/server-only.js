require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./services/supabaseClient');

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('miniapp'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count');
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Database connection working',
      userCount: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Test DB: http://localhost:${PORT}/api/test-db`);
});
