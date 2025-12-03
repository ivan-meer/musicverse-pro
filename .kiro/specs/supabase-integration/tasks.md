# Implementation Plan: Supabase Integration

- [ ] 1. Setup Supabase database schema and migrations
  - Create SQL migration files for database schema
  - Include tables: users, playlists, playlist_tracks, favorites, recommendations
  - Add foreign key constraints and cascade delete rules
  - Create indexes for telegram_id and user_id fields
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.1 Create initial schema migration file
  - Write `supabase/migrations/001_initial_schema.sql` with all table definitions
  - Include UUID generation, timestamps, and JSONB fields
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 Create Row Level Security policies migration
  - Write `supabase/migrations/002_rls_policies.sql` with RLS policies for all tables
  - Ensure users can only access their own data
  - _Requirements: 1.4, 1.5_

- [ ] 1.3 Write property test for RLS isolation
  - **Property 1: Row Level Security Isolation**
  - **Validates: Requirements 1.5, 3.4, 4.3**

- [ ] 1.4 Create indexes migration file
  - Write `supabase/migrations/003_indexes.sql` with performance indexes
  - _Requirements: 1.3_

- [ ] 2. Install dependencies and setup Supabase client
  - Add @supabase/supabase-js to package.json
  - Update .env.example with Supabase configuration variables
  - Create centralized Supabase client module
  - _Requirements: 5.1, 6.1_

- [ ] 2.1 Update package.json with Supabase dependency
  - Add @supabase/supabase-js package
  - Add express-rate-limit for API rate limiting
  - _Requirements: 6.1_

- [ ] 2.2 Update .env.example with Supabase variables
  - Add SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY
  - Document each variable with comments
  - _Requirements: 5.1_

- [ ] 2.3 Create Supabase client module
  - Implement `bot/services/supabaseClient.js` with client initialization
  - Add environment variable validation
  - Export singleton instance
  - _Requirements: 2.1, 5.2_

- [ ] 2.4 Write property test for environment variable validation
  - **Property 8: Environment Variable Validation**
  - **Validates: Requirements 5.3**

- [ ] 3. Implement User Service
  - Create user service with CRUD operations
  - Integrate with bot /start command
  - Handle user creation and updates
  - _Requirements: 2.2_

- [ ] 3.1 Create userService.js module
  - Implement createOrUpdateUser function
  - Implement getUserByTelegramId function
  - Implement updateUserPreferences function
  - _Requirements: 2.2_

- [ ] 3.2 Write property test for user creation idempotence
  - **Property 2: User Creation Idempotence**
  - **Validates: Requirements 2.2**

- [ ] 3.3 Update handleStart to use userService
  - Modify `bot/handlers.js` to create/update user on /start
  - Add error handling for database failures
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 4. Implement Playlist Service
  - Create playlist service with full CRUD operations
  - Handle playlist-track relationships
  - Implement cascade deletion
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.1 Create playlistService.js module
  - Implement createPlaylist function
  - Implement getUserPlaylists function
  - Implement updatePlaylist function
  - Implement deletePlaylist function
  - Implement addTrackToPlaylist function
  - Implement removeTrackFromPlaylist function
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 Write property test for cascade deletion
  - **Property 3: Playlist-Track Cascade Deletion**
  - **Validates: Requirements 3.3**

- [ ] 4.3 Write property test for playlist update preservation
  - **Property 4: Playlist Update Preservation**
  - **Validates: Requirements 3.5**

- [ ] 4.4 Add playlist management bot commands
  - Implement /playlists command handler
  - Add callback query handlers for playlist operations
  - _Requirements: 3.1, 3.4_

- [ ] 5. Implement Favorites Service
  - Create favorites service with add/remove/list operations
  - Handle duplicate prevention
  - Ensure data isolation per user
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.1 Create favoritesService.js module
  - Implement addToFavorites function
  - Implement removeFromFavorites function
  - Implement getUserFavorites function
  - Implement isFavorite function
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5.2 Write property test for favorite uniqueness
  - **Property 5: Favorite Uniqueness**
  - **Validates: Requirements 4.4**

- [ ] 5.3 Write property test for favorite round-trip
  - **Property 6: Favorite Round-Trip**
  - **Validates: Requirements 4.1, 4.3**

- [ ] 5.4 Add favorites bot command
  - Implement /favorites command handler
  - Display user's favorite tracks
  - _Requirements: 4.3_

- [ ] 6. Implement Recommendations Service
  - Create recommendations service
  - Handle recommendation generation and storage
  - Implement expiration and refresh logic
  - Track user interactions
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 6.1 Create recommendationsService.js module
  - Implement generateRecommendations function
  - Implement getUserRecommendations function
  - Implement updateRecommendationInteraction function
  - Implement refreshRecommendations function
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 6.2 Write property test for recommendations round-trip
  - **Property 13: Recommendations Round-Trip**
  - **Validates: Requirements 8.1, 8.2**

- [ ] 6.3 Write property test for interaction counter
  - **Property 14: Recommendation Interaction Counter**
  - **Validates: Requirements 8.4**

- [ ] 6.4 Write property test for recommendation expiration
  - **Property 15: Recommendation Expiration Update**
  - **Validates: Requirements 8.3**

- [ ] 6.5 Update handleMusic to use recommendationsService
  - Modify `bot/handlers.js` to fetch recommendations from database
  - _Requirements: 8.2_

- [ ] 7. Implement Telegram authentication middleware
  - Create middleware for Mini App authentication
  - Verify Telegram initData signatures
  - Extract and validate user data
  - _Requirements: 4.5_

- [ ] 7.1 Create telegramAuth.js middleware
  - Implement authenticateRequest middleware function
  - Implement extractUserFromRequest helper
  - Add initData expiry checking
  - _Requirements: 4.5_

- [ ] 7.2 Write property test for authentication verification
  - **Property 7: Telegram Authentication Verification**
  - **Validates: Requirements 4.5**

- [ ] 7.3 Update webapp.js to use authentication middleware
  - Apply middleware to protected API routes
  - Update /api/auth/verify endpoint
  - _Requirements: 4.5_

- [ ] 8. Update API endpoints to use Supabase services
  - Refactor all API endpoints in webapp.js
  - Replace mock data with real database queries
  - Add proper error handling
  - _Requirements: 2.4, 3.4, 4.3, 8.2_

- [ ] 8.1 Update user data endpoint
  - Modify `/api/user/:userId` to fetch from userService
  - _Requirements: 2.4_

- [ ] 8.2 Update recommendations endpoint
  - Modify `/api/recommendations/:userId` to use recommendationsService
  - _Requirements: 8.2_

- [ ] 8.3 Create playlists API endpoints
  - Add GET `/api/playlists/:userId` endpoint
  - Add POST `/api/playlists` endpoint
  - Add PUT `/api/playlists/:playlistId` endpoint
  - Add DELETE `/api/playlists/:playlistId` endpoint
  - Add POST `/api/playlists/:playlistId/tracks` endpoint
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.4 Create favorites API endpoints
  - Add GET `/api/favorites/:userId` endpoint
  - Add POST `/api/favorites` endpoint
  - Add DELETE `/api/favorites/:favoriteId` endpoint
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Implement enhanced health check endpoint
  - Update health check to verify Supabase connection
  - Return detailed status information
  - Handle connection failures gracefully
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9.1 Update /health endpoint in webapp.js
  - Add Supabase connection check
  - Return 200 when healthy, 503 when unhealthy
  - Include timestamp and service status
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9.2 Write property test for error logging
  - **Property 16: Error Logging Completeness**
  - **Validates: Requirements 9.5**

- [ ] 10. Add centralized error handling
  - Create error handler middleware
  - Implement service-level error handling
  - Add logging for all errors
  - _Requirements: 2.3, 2.5, 9.5_

- [ ] 10.1 Create errorHandler.js middleware
  - Implement centralized error handler
  - Map database errors to HTTP status codes
  - Log errors with full context
  - _Requirements: 2.5, 9.5_

- [ ] 10.2 Update all services with try-catch blocks
  - Add error handling to all service functions
  - Return consistent error response format
  - _Requirements: 2.3, 2.5_

- [ ] 11. Update Docker configuration
  - Update docker-compose.yml with Supabase environment variables
  - Ensure proper environment variable propagation
  - Test container restart resilience
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.1 Update docker-compose.yml
  - Add all Supabase environment variables
  - Configure restart policy
  - _Requirements: 7.1, 7.2_

- [ ] 11.2 Write property test for environment propagation
  - **Property 11: Docker Environment Variable Propagation**
  - **Validates: Requirements 7.2**

- [ ] 11.3 Write property test for reconnection resilience
  - **Property 12: Database Reconnection Resilience**
  - **Validates: Requirements 7.4**

- [ ] 12. Create comprehensive documentation
  - Write Supabase setup guide
  - Document Telegram bot configuration
  - Create Mini App setup instructions
  - Add troubleshooting section
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12.1 Create SUPABASE_SETUP.md documentation
  - Step-by-step Supabase project creation
  - Migration execution instructions
  - API credentials configuration
  - _Requirements: 10.1, 10.2_

- [ ] 12.2 Create TELEGRAM_SETUP.md documentation
  - Bot creation with @BotFather
  - Mini App registration and configuration
  - Command setup instructions
  - _Requirements: 10.3, 10.4_

- [ ] 12.3 Create TROUBLESHOOTING.md documentation
  - Common errors and solutions
  - Connection issues debugging
  - Authentication problems
  - _Requirements: 10.5_

- [ ] 12.4 Update main README.md
  - Add Supabase integration overview
  - Link to setup documentation
  - Update quick start guide
  - _Requirements: 10.1_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Write unit tests for services
  - Create test files for userService, playlistService, favoritesService, recommendationsService
  - Test success cases and error handling
  - Mock Supabase client responses
  - _Requirements: All service-related requirements_

- [ ] 15. Write integration tests
  - Test complete flows: user creation → playlist creation → adding tracks
  - Test authentication flow end-to-end
  - Test API endpoints with real database (test environment)
  - _Requirements: All requirements_
