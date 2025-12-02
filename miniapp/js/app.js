// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Expand the Web App to full height
tg.expand();

// Set header color
tg.setHeaderColor('#667eea');

// Get user data from Telegram
const user = tg.initDataUnsafe?.user;

// App State
const appState = {
    userId: user?.id || 'demo',
    userName: user?.first_name || 'User',
    recommendations: [],
    playlists: [],
    favorites: []
};

// Initialize app
async function initApp() {
    // Display user info
    displayUserInfo();
    
    // Load data
    await loadRecommendations();
    
    // Setup event listeners
    setupEventListeners();
    
    // Enable main button
    setupMainButton();
}

// Display user information
function displayUserInfo() {
    const userNameEl = document.getElementById('user-name');
    const userIdEl = document.getElementById('user-id');
    
    if (userNameEl) {
        userNameEl.textContent = appState.userName;
    }
    
    if (userIdEl) {
        userIdEl.textContent = `User ID: ${appState.userId}`;
    }
}

// Load music recommendations
async function loadRecommendations() {
    const listEl = document.getElementById('recommendations-list');
    
    try {
        // In production, fetch from your API
        const response = await fetch(`/api/recommendations/${appState.userId}`);
        const data = await response.json();
        
        if (data.success) {
            appState.recommendations = data.data;
            displayRecommendations(data.data);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        
        // Fallback to demo data
        const demoData = [
            {
                id: '1',
                title: 'Midnight Dreams',
                artist: 'Electronic Vibes',
                genre: 'Electronic',
                duration: '3:45'
            },
            {
                id: '2',
                title: 'Rock Anthem',
                artist: 'Thunder Band',
                genre: 'Rock',
                duration: '4:20'
            },
            {
                id: '3',
                title: 'Jazz Evening',
                artist: 'Smooth Jazz Collective',
                genre: 'Jazz',
                duration: '5:15'
            }
        ];
        
        appState.recommendations = demoData;
        displayRecommendations(demoData);
    }
}

// Display recommendations in UI
function displayRecommendations(tracks) {
    const listEl = document.getElementById('recommendations-list');
    
    if (!tracks || tracks.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No recommendations available</p>';
        return;
    }
    
    listEl.innerHTML = tracks.map(track => `
        <div class="music-item" data-track-id="${track.id}">
            <div class="music-info">
                <div class="music-title">${track.title}</div>
                <div class="music-artist">${track.artist}</div>
                <div class="music-meta">${track.genre} • ${track.duration}</div>
            </div>
            <div class="music-actions">
                <button class="icon-btn play-btn" data-track-id="${track.id}">▶️</button>
                <button class="icon-btn favorite-btn" data-track-id="${track.id}">❤️</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to new buttons
    attachMusicItemListeners();
}

// Attach event listeners to music items
function attachMusicItemListeners() {
    // Play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackId = btn.dataset.trackId;
            playTrack(trackId);
        });
    });
    
    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackId = btn.dataset.trackId;
            toggleFavorite(trackId);
        });
    });
}

// Play track
function playTrack(trackId) {
    tg.showAlert(`Playing track ${trackId}`);
    // TODO: Implement actual playback
}

// Toggle favorite
function toggleFavorite(trackId) {
    const index = appState.favorites.indexOf(trackId);
    
    if (index > -1) {
        appState.favorites.splice(index, 1);
        tg.showAlert('Removed from favorites');
    } else {
        appState.favorites.push(trackId);
        tg.showAlert('Added to favorites');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Send data to bot
    const sendBtn = document.getElementById('send-data-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendDataToBot);
    }
    
    // Close app
    const closeBtn = document.getElementById('close-app-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            tg.close();
        });
    }
    
    // Create playlist
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', createPlaylist);
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Send data to bot
function sendDataToBot() {
    const dataToSend = {
        favorites: appState.favorites,
        timestamp: new Date().toISOString(),
        action: 'share_favorites'
    };
    
    tg.sendData(JSON.stringify(dataToSend));
}

// Create new playlist
function createPlaylist() {
    tg.showPopup({
        title: 'Create Playlist',
        message: 'Enter playlist name',
        buttons: [
            { id: 'cancel', type: 'cancel' },
            { id: 'create', type: 'default', text: 'Create' }
        ]
    }, (buttonId) => {
        if (buttonId === 'create') {
            tg.showAlert('Playlist creation coming soon!');
        }
    });
}

// Setup Telegram main button
function setupMainButton() {
    tg.MainButton.setText('Share Favorites');
    tg.MainButton.onClick(sendDataToBot);
    
    // Show button only when there are favorites
    if (appState.favorites.length > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handle back button
tg.BackButton.onClick(() => {
    tg.close();
});
