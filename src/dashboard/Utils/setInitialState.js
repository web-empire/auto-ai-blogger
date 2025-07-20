import apiFetch from '@wordpress/api-fetch';

const setInitialState = ( store ) => {
	apiFetch( {
		path: '/wp-ai-blogger/v1/admin/settings/',
	} )
		.then( ( wpAiBloggerSettings ) => {
			// Get current state to preserve certain values that are correctly initialized from PHP
			const currentState = store.getState();

			// Debug logging for license preservation
			console.log('setInitialState - License preservation check:', {
				currentLicense: currentState.license,
				currentLicenseStatus: currentState.license_status,
				apiLicense: wpAiBloggerSettings.license,
				shouldPreserveLicense: !!(currentState.license && !wpAiBloggerSettings.license)
			});

			// Only update specific fields that should come from the API, preserve others
			const selectiveUpdate = {
				settingsSavedNotification: '',
				initialStateSetFlag: true,
				activeSettingsNavigationTab: 'home',
				// Only update these specific fields from API, preserve tokens and other critical data
				...(wpAiBloggerSettings.siteTitle && { siteTitle: wpAiBloggerSettings.siteTitle }),
				...(wpAiBloggerSettings.siteFor && { siteFor: wpAiBloggerSettings.siteFor }),
				...(wpAiBloggerSettings.siteDescription && { siteDescription: wpAiBloggerSettings.siteDescription }),
				...(wpAiBloggerSettings.temperature !== undefined && { temperature: wpAiBloggerSettings.temperature }),
				...(wpAiBloggerSettings.harassment !== undefined && { harassment: wpAiBloggerSettings.harassment }),
				...(wpAiBloggerSettings.hate !== undefined && { hate: wpAiBloggerSettings.hate }),
				...(wpAiBloggerSettings.sexually_explicit !== undefined && { sexuallyExplicit: wpAiBloggerSettings.sexually_explicit }),
				...(wpAiBloggerSettings.dangerous_content !== undefined && { dangerousContent: wpAiBloggerSettings.dangerous_content }),
				...(wpAiBloggerSettings.post_ideas && { postIdeas: wpAiBloggerSettings.post_ideas }),
				// Preserve license and license_status from initial state (they come from PHP localized data)
				// Only update license if API provides one AND current state doesn't have one
				...(wpAiBloggerSettings.license && !currentState.license && { license: wpAiBloggerSettings.license }),
				// Always preserve existing license in current state - never override with empty API data
				...(currentState.license && { license: currentState.license }),
				// Only update tokens if API returns better data than what we already have
				...(wpAiBloggerSettings.tokenTotal > currentState.tokenTotal && { tokenTotal: wpAiBloggerSettings.tokenTotal }),
				...(wpAiBloggerSettings.tokenRemaining > currentState.tokenRemaining && { tokenRemaining: wpAiBloggerSettings.tokenRemaining }),
			};

			store.dispatch( {
				type: 'UPDATE_INITIAL_STATE',
				payload: selectiveUpdate,
			} );
		} )
		.catch( ( error ) => {
			console.error( 'Error occurred while setting the initial store data: ' + error );

			// Even if API fails, make sure we set the initial state flag
			store.dispatch( {
				type: 'UPDATE_INITIAL_STATE_FLAG',
				payload: true,
			} );
		} );
};

export default setInitialState;
