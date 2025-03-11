const globalDataReducer = ( state = {}, action ) => {
	const actionType = wp.hooks.applyFilters( 'ai_blogger_dashboard/data_reducer_action', action.type );

	const actionHandlers = {
		UPDATE_INITIAL_STATE: { ...action.payload },
		UPDATE_INITIAL_STATE_FLAG: { initialStateSetFlag: action.payload },
		UPDATE_SETTINGS_ACTIVE_NAVIGATION_TAB: { activeSettingsNavigationTab: action.payload },
		UPDATE_SETTINGS_SAVED_NOTIFICATION: { settingsSavedNotification: action.payload },
		UPDATE_CONFETTI_SHOW: { confettiShow: action.payload },
		UPDATE_ONBOARDING_TAB: { onboardingTab: action.payload },
		UPDATE_USER_ONBOARDED: { userOnboarded: action.payload },
		UPDATE_USER_NAME: { userName: action.payload },
		UPDATE_USER_EMAIL: { userEmail: action.payload },
		UPDATE_PLUGIN_SETTINGS: { pluginSettings: action.payload },
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
