import { legacy_createStore as createStore } from 'redux';
import globalDataReducer from './globalDataReducer';

// Get the initial state, applying the filter.
const initialState = wp.hooks.applyFilters( 'ai_blogger_dashboard/datastore', {
	...autoblog_data.defaults,
	siteTitle: autoblog_data.site_title || '',
	siteFor: autoblog_data.site_for || '',
	siteDescription: autoblog_data.site_description || '',
	temperature: autoblog_data.temperature || '',
	harassment: autoblog_data.harassment || '',
	hate: autoblog_data.hate || '',
	sexuallyExplicit: autoblog_data.sexually_explicit || '',
	dangerousContent: autoblog_data.dangerous_content || '',
	civicIntegrity: autoblog_data.civic_integrity || '',
	license: autoblog_data.license || '',
	postIdeas: autoblog_data.post_ideas || '',
} );

const globalDataStore = createStore(
	globalDataReducer,
	initialState,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default globalDataStore;
