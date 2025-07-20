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
		return {};
	}

	// Build initial state with safe parsing
	const parsedState = {
		...( wpaib_localized_data.defaults || {} ),
		siteTitle: safeParseLocalizedData( wpaib_localized_data.site_title, 'string', '' ),
		siteFor: safeParseLocalizedData( wpaib_localized_data.site_for, 'string', '' ),
		siteDescription: safeParseLocalizedData( wpaib_localized_data.site_description, 'string', '' ),
		temperature: safeParseLocalizedData( wpaib_localized_data.temperature, 'number', 0.7 ),
		harassment: safeParseLocalizedData( wpaib_localized_data.harassment, 'boolean', false ),
		hate: safeParseLocalizedData( wpaib_localized_data.hate, 'boolean', false ),
		sexuallyExplicit: safeParseLocalizedData( wpaib_localized_data.sexually_explicit, 'boolean', false ),
		dangerousContent: safeParseLocalizedData( wpaib_localized_data.dangerous_content, 'boolean', false ),
		license: safeParseLocalizedData( wpaib_localized_data.license, 'string', '' ),
		postIdeas: safeParseLocalizedData( wpaib_localized_data.post_ideas, 'array', [] ),
		tokenTotal: safeParseLocalizedData( wpaib_localized_data.token_total, 'number', 0 ),
		tokenRemaining: safeParseLocalizedData( wpaib_localized_data.token_remaining, 'number', 0 ),
		licenseStatus: safeParseLocalizedData( wpaib_localized_data.license_status, 'string', 'inactive' ),
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
		return createStore( globalDataReducer, {} );
	}
};

const globalDataStore = createEnhancedStore();

export default globalDataStore;
