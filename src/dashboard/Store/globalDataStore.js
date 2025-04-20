import { legacy_createStore as createStore } from 'redux';
import globalDataReducer from './globalDataReducer';

const initialState = wp.hooks.applyFilters( 'ai_blogger_dashboard/datastore', autoblog_data.defaults );

const globalDataStore = createStore(
	globalDataReducer,
	initialState,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default globalDataStore;
