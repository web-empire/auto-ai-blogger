import { legacy_createStore as createStore } from 'redux';
import globalDataReducer from './globalDataReducer';

// Get the initial state, applying the filter.
const initialState = wp.hooks.applyFilters( 'ai_blogger_dashboard/datastore', {
	...wpaib_localized_data.defaults,
	siteTitle: wpaib_localized_data.site_title || '',
	siteFor: wpaib_localized_data.site_for || '',
	siteDescription: wpaib_localized_data.site_description || '',
	temperature: parseFloat( wpaib_localized_data.temperature ),
	harassment: parseInt( wpaib_localized_data.harassment ),
	hate: parseInt( wpaib_localized_data.hate ),
	sexuallyExplicit: parseInt( wpaib_localized_data.sexually_explicit ),
	dangerousContent: parseInt( wpaib_localized_data.dangerous_content ),
	license: wpaib_localized_data.license || '',
	postIdeas: wpaib_localized_data.post_ideas || '',
	tokenTotal: wpaib_localized_data.token_total || 0,
	tokenRemaining: wpaib_localized_data.token_remaining || 0,
	licenseStatus: wpaib_localized_data.license_status || 0,
} );

const globalDataStore = createStore(
	globalDataReducer,
	initialState,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default globalDataStore;
