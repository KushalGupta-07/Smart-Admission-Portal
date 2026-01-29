import('./supabase/config.toml').then(config => {
  // Initialize your application with the config
}).catch(err => {
  console.error('Error loading config:', err);
});

// Lazy-load non-critical modules (analytics, widgets) after idle or on load
(function loadNonCritical() {
	if ('requestIdleCallback' in window) {
		requestIdleCallback(() => {
			import('./analytics.js').then(m => m.init()).catch(()=>{});
			// import other heavy modules if needed
		});
	} else {
		window.addEventListener('load', () => {
			import('./analytics.js').then(m => m.init()).catch(()=>{});
		});
	}
})();