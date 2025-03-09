import apiFetch from '@wordpress/api-fetch';

const setInitialState = ( store ) => {
	apiFetch( {
		path: '/wp-ai-blogger/v1/admin/settings/',
	} )
		.then( ( wpAiBloggerSettings ) => {
			const initialState = {
				settingsSavedNotification: '',
				initialStateSetFlag: true,
				activeSettingsNavigationTab: 'home',
				...wpAiBloggerSettings,
			};

			store.dispatch( {
				type: 'UPDATE_INITIAL_STATE',
				payload: initialState,
			} );
		} )
		.catch( ( error ) => {
			console.error( 'Error occurred while setting the initial store data: ' + error );
		} );
};

export default setInitialState;
