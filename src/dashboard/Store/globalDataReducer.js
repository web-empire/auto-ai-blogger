/**
 * Initial state for the global data reducer
 */
const initialState = {
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
	licenseStatus: 'inactive',
	// Add loading and error states for better UX
	isLoading: false,
	error: null,
};

/**
 * Global data reducer with improved error handling and structure
 *
 * @param {Object} state  - Current state
 * @param {Object} action - Action object with type and payload
 * @return {Object} New state
 */
const globalDataReducer = ( state = initialState, action ) => {
	// Apply WordPress hooks filter for action type
	const actionType = wp?.hooks?.applyFilters?.( 'ai_blogger_dashboard/data_reducer_action', action.type ) || action.type;

	// Validate action structure
	if ( ! action || typeof action !== 'object' || ! action.type ) {
		console.warn( 'Invalid action dispatched to globalDataReducer:', action );
		return state;
	}

	// Handle loading states
	if ( actionType.endsWith( '_REQUEST' ) ) {
		return {
			...state,
			isLoading: true,
			error: null,
		};
	}

	if ( actionType.endsWith( '_SUCCESS' ) ) {
		return {
			...state,
			isLoading: false,
			error: null,
		};
	}

	if ( actionType.endsWith( '_FAILURE' ) ) {
		return {
			...state,
			isLoading: false,
			error: action.payload?.message || 'An error occurred',
		};
	}

	// Action handlers with type safety
	const actionHandlers = {
		UPDATE_INITIAL_STATE: () => {
			// Validate that payload is an object
			if ( ! action.payload || typeof action.payload !== 'object' ) {
				console.warn( 'UPDATE_INITIAL_STATE: Invalid payload', action.payload );
				return state;
			}
			return { ...state, ...action.payload };
		},
		UPDATE_INITIAL_STATE_FLAG: () => ( { ...state, initialStateSetFlag: Boolean( action.payload ) } ),
		UPDATE_SETTINGS_ACTIVE_NAVIGATION_TAB: () => ( { ...state, activeSettingsNavigationTab: String( action.payload || 'general' ) } ),
		UPDATE_SETTINGS_SAVED_NOTIFICATION: () => ( { ...state, settingsSavedNotification: Boolean( action.payload ) } ),
		UPDATE_CONFETTI_SHOW: () => ( { ...state, confettiShow: Boolean( action.payload ) } ),
		UPDATE_ONBOARDING_TAB: () => ( { ...state, onboardingTab: Number( action.payload ) || 0 } ),
		UPDATE_SITE_TITLE: () => ( { ...state, siteTitle: String( action.payload || '' ) } ),
		UPDATE_SITE_FOR: () => ( { ...state, siteFor: String( action.payload || '' ) } ),
		UPDATE_SITE_DESCRIPTION: () => ( { ...state, siteDescription: String( action.payload || '' ) } ),
		UPDATE_LICENSE: () => ( { ...state, license: String( action.payload || '' ) } ),
		UPDATE_USER_ONBOARDED: () => ( { ...state, userOnboarded: Boolean( action.payload ) } ),
		UPDATE_USER_NAME: () => ( { ...state, userName: String( action.payload || '' ) } ),
		UPDATE_USER_EMAIL: () => ( { ...state, userEmail: String( action.payload || '' ) } ),
		UPDATE_PLUGIN_SETTINGS: () => {
			const settings = action.payload && typeof action.payload === 'object' ? action.payload : {};
			return { ...state, pluginSettings: { ...state.pluginSettings, ...settings } };
		},
		UPDATE_TEMPERATURE: () => {
			const temp = Number( action.payload );
			const validTemp = isNaN( temp ) ? 0.7 : Math.max( 0, Math.min( 2, temp ) ); // Clamp between 0 and 2
			return { ...state, temperature: validTemp };
		},
		UPDATE_HARASSMENT: () => ( { ...state, harassment: Boolean( action.payload ) } ),
		UPDATE_HATE: () => ( { ...state, hate: Boolean( action.payload ) } ),
		UPDATE_SEXUALLY_EXPLICIT: () => ( { ...state, sexuallyExplicit: Boolean( action.payload ) } ),
		UPDATE_DANGEROUS_CONTENT: () => ( { ...state, dangerousContent: Boolean( action.payload ) } ),
		UPDATE_POST_IDEAS: () => {
			const ideas = Array.isArray( action.payload ) ? action.payload : [];
			return { ...state, postIdeas: ideas };
		},
		UPDATE_TOKEN_TOTAL: () => ( { ...state, tokenTotal: Number( action.payload ) || 0 } ),
		UPDATE_TOKEN_REMAINING: () => ( { ...state, tokenRemaining: Number( action.payload ) || 0 } ),
		UPDATE_LICENSE_STATUS: () => ( { ...state, licenseStatus: String( action.payload || 'inactive' ) } ),
		CLEAR_ERROR: () => ( { ...state, error: null } ),
		RESET_STATE: () => initialState,
	};

	const handler = actionHandlers[ actionType ];
	if ( handler && typeof handler === 'function' ) {
		try {
			return handler();
		} catch ( error ) {
			console.error( `Error in reducer handler for ${ actionType }:`, error );
			return {
				...state,
				error: `Reducer error: ${ error.message }`,
			};
		}
	}

	// Unknown action type
	if ( process.env.NODE_ENV === 'development' ) {
		console.warn( `Unknown action type: ${ actionType }` );
	}

	return state;
};

export default globalDataReducer;
