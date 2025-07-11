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
    } );
};

/**
 * A function to create a new campaign.
 *
 * @function
 *
 * @param {string} value              - The data to send.
 * @param {string} isNew              - Is new campaign or not.
 * @param {Object} abortControllerRef - The ref object with to hold abort controller.
 *
 * @return {Promise} Returns a promise representing the processed request.
 */
const updateCampaign = async ( value, isNew, abortControllerRef = null ) => {
	// Abort any previous request.
	if ( abortControllerRef.current.campaign_details ) {
		abortControllerRef.current.campaign_details?.abort();
	}

	// Create a new AbortController.
	const abortController = new AbortController();
	abortControllerRef.current.campaign_details = abortController;

	const formData = new window.FormData();

	formData.append( 'action', isNew ? 'wpaib_create_campaign' : 'wpaib_update_campaign' );
	formData.append( 'security', autoblog_data.admin_nonce );
	formData.append( 'key', 'campaign_details' );
	formData.append( 'value', JSON.stringify( value ) );

	return apiFetch( {
		url: autoblog_data.ajax_url,
		method: 'POST',
		body: formData,
		signal: abortControllerRef.current.campaign_details?.signal, // Pass the signal to the fetch request.
	} )
		.then( ( data ) => {
			if ( data.success ) {
				window.location.reload();
			} else {
				// Show error message.
				console.error( data.data.message );
			}
		} )
		.catch( () => {} );
};

export { updateApiData, updateCampaign };
