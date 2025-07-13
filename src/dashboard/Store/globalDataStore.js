import { legacy_createStore as createStore } from 'redux';
import globalDataReducer from './globalDataReducer';

// Get the initial state, applying the filter.
const initialState = wp.hooks.applyFilters( 'ai_blogger_dashboard/datastore', {
	...autoblog_data.defaults,
	siteTitle: autoblog_data.site_title || '',
	siteFor: autoblog_data.site_for || '',
	siteDescription: autoblog_data.site_description || '',
	temperature: parseFloat( autoblog_data.temperature ),
	harassment: parseInt( autoblog_data.harassment ),
	hate: parseInt( autoblog_data.hate ),
	sexuallyExplicit: parseInt( autoblog_data.sexually_explicit ),
	dangerousContent: parseInt( autoblog_data.dangerous_content ),
	license: autoblog_data.license || '',
	postIdeas: autoblog_data.post_ideas || '',
	tokenTotal: autoblog_data.token_total || 0,
	tokenRemaining: autoblog_data.token_remaining || 0,
	licenseStatus: autoblog_data.license_status || 0,
} );

const globalDataStore = createStore(
	globalDataReducer,
	initialState,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default globalDataStore;
