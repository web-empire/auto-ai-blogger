// Import the apiFetch function from the '@wordpress/api-fetch' package.
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * A function to send form data via API fetch.
 *
 * @function
 *
 * @param {string}   key                - Settings key.
 * @param {string}   value              - The data to send.
 * @param {Function} dispatch
 * @param {Object}   abortControllerRef - The ref object with to hold abort controller.
 *
 * @return {Promise} Returns a promise representing the processed request.
 */
const updateApiData = async ( key, value, dispatch, abortControllerRef = null ) => {
	// Abort any previous request.
	if ( abortControllerRef.current[ key ] ) {
		abortControllerRef.current[ key ]?.abort();
	}

	// Create a new AbortController.
	const abortController = new AbortController();
	abortControllerRef.current[ key ] = abortController;

	const formData = new window.FormData();

	formData.append( 'action', 'wpaib_update_admin_setting' );
	formData.append( 'security', autoblog_data.admin_nonce );
	formData.append( 'key', key );
	formData.append( 'value', value );

	return apiFetch( {
		url: autoblog_data.ajax_url,
		method: 'POST',
		body: formData,
		signal: abortControllerRef.current[ key ]?.signal, // Pass the signal to the fetch request.
	} )
		.then( () => {
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Successfully saved!', 'wp-ai-blogger' ),
			} );
		} )
		.catch( () => {} );
};

export { updateApiData };
