const globalDataReducer = ( state = {}, action ) => {
	const actionType = wp.hooks.applyFilters( 'ai_blogger_dashboard/data_reducer_action', action.type );

	const actionHandlers = {
		UPDATE_INITIAL_STATE: { ...action.payload },
		UPDATE_INITIAL_STATE_FLAG: { initialStateSetFlag: action.payload },
		UPDATE_SETTINGS_ACTIVE_NAVIGATION_TAB: { activeSettingsNavigationTab: action.payload },
		UPDATE_SETTINGS_SAVED_NOTIFICATION: { settingsSavedNotification: action.payload },
		UPDATE_CONFETTI_SHOW: { confettiShow: action.payload },
		UPDATE_ONBOARDING_TAB: { onboardingTab: action.payload },
		UPDATE_SITE_TITLE: { siteTitle: action.payload },
		UPDATE_SITE_FOR: { siteFor: action.payload },
		UPDATE_SITE_DESCRIPTION: { siteDescription: action.payload },
		UPDATE_USER_ONBOARDED: { userOnboarded: action.payload },
		UPDATE_USER_NAME: { userName: action.payload },
		UPDATE_USER_EMAIL: { userEmail: action.payload },
		UPDATE_PLUGIN_SETTINGS: { pluginSettings: action.payload },
		UPDATE_TEMPERATURE: { temperature: action.payload },
		UPDATE_HARASSMENT: { harassment: action.payload },
		UPDATE_HATE: { hate: action.payload },
		UPDATE_SEXUALLY_EXPLICIT: { sexually_explicit: action.payload },
		UPDATE_DANGEROUS_CONTENT: { dangerous_content: action.payload },
		UPDATE_CIVIC_INTEGRITY: { civic_integrity: action.payload },
		UPDATE_POST_IDEAS: { postIdeas: action.payload },
	};

	if ( actionHandlers[ actionType ] ) {
		return {
			...state,
			...actionHandlers[ actionType ],
		};
	}

	return state;
};

export default globalDataReducer;
