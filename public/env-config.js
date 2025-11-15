// Runtime environment configuration
// This script will be loaded before the main app and inject environment variables
// into the window object so they can be accessed at runtime

(function() {
  if (typeof window !== 'undefined') {
    // Initialize env object on window
    window.env = window.env || {};
    
    // For development, use placeholder values that won't break the app
    // In production, these will be replaced during build
    window.env.VITE_SUPABASE_URL = '{{VITE_SUPABASE_URL}}';
    window.env.VITE_SUPABASE_ANON_KEY = '{{VITE_SUPABASE_ANON_KEY}}';
    
    console.log('🌐 Environment config loaded for development');
  }
})();