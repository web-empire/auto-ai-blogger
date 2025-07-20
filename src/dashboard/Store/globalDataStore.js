import { legacy_createStore as createStore, compose } from 'redux';
import globalDataReducer from './globalDataReducer';

/**
 * Safely parse localized data with fallbacks
 *
 * @param {*}      value        - Value to parse
 * @param {string} type         - Type to parse to ('string', 'number', 'boolean', 'array')
 * @param {*}      defaultValue - Default value if parsing fails
 * @return {*} Parsed value or default
 */
const safeParseLocalizedData = ( value, type = 'string', defaultValue = '' ) => {
	try {
		switch ( type ) {
			case 'number':
				const num = parseFloat( value );
				return isNaN( num ) ? defaultValue : num;
			case 'boolean':
				return Boolean( parseInt( value ) );
			case 'array':
				return Array.isArray( value ) ? value : ( value ? [ value ] : [] );
			case 'object':
				return value && typeof value === 'object' ? value : defaultValue;
			default:
				return value ? String( value ) : defaultValue;
		}
	} catch ( error ) {
		console.warn( `Failed to parse localized data:`, error );
		return defaultValue;
	}
};

/**
 * Get safely parsed initial state from localized data
 */
const getInitialState = () => {
	// Ensure wpaib_localized_data exists
	if ( typeof wpaib_localized_data === 'undefined' ) {
		console.warn( 'wpaib_localized_data is not defined, using default state' );
		return {
			initialStateSetFlag: false,
			activeSettingsNavigationTab: 'general',
			settingsSavedNotification: false,
			confettiShow: false,
			onboardingTab: 0,
			siteTitle: '',
			siteFor: '',
			siteDescription: '',
			license: '',
			userOnboarded: false,
			userName: '',
			userEmail: '',
			pluginSettings: {},
			temperature: 0.7,
			harassment: false,
			hate: false,
			sexuallyExplicit: false,
			dangerousContent: false,
			postIdeas: [],
			tokenTotal: 0,
			tokenRemaining: 0,
			license_status: 'inactive',
			isLoading: false,
			error: null,
		};
	}

	// Build initial state with safe parsing
	const parsedState = {
		initialStateSetFlag: false,
		activeSettingsNavigationTab: 'general',
		settingsSavedNotification: false,
		confettiShow: false,
		onboardingTab: 0,
		userName: safeParseLocalizedData( wpaib_localized_data.current_user_name, 'string', '' ),
		userEmail: safeParseLocalizedData( wpaib_localized_data.current_user_email, 'string', '' ),
		userOnboarded: safeParseLocalizedData( wpaib_localized_data.userOnboarded, 'boolean', false ),
		pluginSettings: {},
		siteTitle: safeParseLocalizedData( wpaib_localized_data.site_title, 'string', '' ),
		siteFor: safeParseLocalizedData( wpaib_localized_data.site_for, 'string', '' ),
		siteDescription: safeParseLocalizedData( wpaib_localized_data.site_description, 'string', '' ),
		temperature: safeParseLocalizedData( wpaib_localized_data.temperature, 'number', 0.7 ),
		harassment: safeParseLocalizedData( wpaib_localized_data.harassment, 'boolean', false ),
		hate: safeParseLocalizedData( wpaib_localized_data.hate, 'boolean', false ),
		sexuallyExplicit: safeParseLocalizedData( wpaib_localized_data.sexually_explicit, 'boolean', false ),
		dangerousContent: safeParseLocalizedData( wpaib_localized_data.dangerous_content, 'boolean', false ),
		license: safeParseLocalizedData( wpaib_localized_data.license, 'string', '' ),
		postIdeas: safeParseLocalizedData( wpaib_localized_data.postIdeas, 'string', '' ),
		tokenTotal: safeParseLocalizedData( wpaib_localized_data.token_total, 'number', 0 ),
		tokenRemaining: safeParseLocalizedData( wpaib_localized_data.token_remaining, 'number', 0 ),
		license_status: safeParseLocalizedData( wpaib_localized_data.license_status, 'string', 'inactive' ),

		// Static configuration data that doesn't change during app lifecycle
		homeSlug: safeParseLocalizedData( wpaib_localized_data.home_slug, 'string', 'wp-ai-blogger' ),
		adminNonce: safeParseLocalizedData( wpaib_localized_data.admin_nonce, 'string', '' ),
		ajaxUrl: safeParseLocalizedData( wpaib_localized_data.ajax_url, 'string', '/wp-admin/admin-ajax.php' ),
		editPostLink: safeParseLocalizedData( wpaib_localized_data.edit_post_link, 'string', '/wp-admin/post.php?post={{POST_ID}}&action=edit' ),
		allCampaigns: safeParseLocalizedData( wpaib_localized_data.all_campaigns, 'object', {} ),
		postmetaDefaults: safeParseLocalizedData( wpaib_localized_data.postmeta_defaults, 'object', {} ),
		licensingNonce: safeParseLocalizedData( wpaib_localized_data.licensing_nonce, 'string', '' ),
		upgradeLink: safeParseLocalizedData( wpaib_localized_data.upgrade_link, 'string', '#' ),
		adminEmail: safeParseLocalizedData( wpaib_localized_data.admin_email, 'string', '' ),
		adminAppUrl: safeParseLocalizedData( wpaib_localized_data.admin_app_url, 'string', '' ),
		adminBaseUrl: safeParseLocalizedData( wpaib_localized_data.admin_base_url, 'string', '' ),
		proPurchaseUrl: safeParseLocalizedData( wpaib_localized_data.pro_purchase_url, 'string', 'https://wpaiblogger.com/' ),
		proAvailable: safeParseLocalizedData( wpaib_localized_data.pro_available, 'boolean', false ),
		version: safeParseLocalizedData( wpaib_localized_data.version, 'string', '1.0.0' ),
		proVersion: safeParseLocalizedData( wpaib_localized_data.pro_version, 'string', '' ),
		postTypes: safeParseLocalizedData( wpaib_localized_data.post_types, 'object', {} ),

		isLoading: false,
		error: null,
	};

	// Apply WordPress hooks filter if available
	return wp?.hooks?.applyFilters?.( 'ai_blogger_dashboard/datastore', parsedState ) || parsedState;
};

/**
 * Configure Redux DevTools with enhanced options
 */
const configureDevTools = () => {
	if ( typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ) {
		return window.__REDUX_DEVTOOLS_EXTENSION__( {
			name: 'AI Blogger Dashboard',
			trace: process.env.NODE_ENV === 'development',
			traceLimit: 25,
		} );
	}
	return undefined;
};

/**
 * Create enhanced store with middleware and DevTools
 */
const createEnhancedStore = () => {
	try {
		const initialState = getInitialState();
		const devTools = configureDevTools();

		// Validate initial state
		if ( ! initialState || typeof initialState !== 'object' ) {
			console.error( 'Invalid initial state, using fallback' );
			const fallbackState = {
				initialStateSetFlag: false,
				activeSettingsNavigationTab: 'general',
				settingsSavedNotification: false,
				confettiShow: false,
				onboardingTab: 0,
				siteTitle: '',
				siteFor: '',
				siteDescription: '',
				license: '',
				userOnboarded: false,
				userName: '',
				userEmail: '',
				pluginSettings: {},
				temperature: 0.7,
				harassment: false,
				hate: false,
				sexuallyExplicit: false,
				dangerousContent: false,
				postIdeas: '',
				tokenTotal: 0,
				tokenRemaining: 0,
				license_status: 'inactive',
				isLoading: false,
				error: null,
			};
			return createStore( globalDataReducer, fallbackState );
		}

		// Use compose to properly combine enhancers
		const enhancers = devTools ? compose( devTools ) : undefined;

		const store = createStore(
			globalDataReducer,
			initialState,
			enhancers
		);

		// Add error handling for dispatch
		const originalDispatch = store.dispatch;
		store.dispatch = ( action ) => {
			try {
				return originalDispatch( action );
			} catch ( error ) {
				console.error( 'Store dispatch error:', error, 'Action:', action );
				// Dispatch error action instead of throwing
				return originalDispatch( {
					type: 'STORE_ERROR',
					payload: { message: error.message },
				} );
			}
		};

		// Log store creation in development
		if ( process.env.NODE_ENV === 'development' ) {
			console.log( 'AI Blogger Dashboard store created with initial state:', store.getState() );
		}

		return store;
	} catch ( error ) {
		console.error( 'Failed to create Redux store:', error );
		// Return a minimal store as fallback
		const fallbackState = {
			initialStateSetFlag: false,
			tokenTotal: 0,
			tokenRemaining: 0,
			license_status: 'inactive',
			isLoading: false,
			error: 'Failed to initialize store',
		};
		return createStore( globalDataReducer, fallbackState );
	}
};

const globalDataStore = createEnhancedStore();

export default globalDataStore;
