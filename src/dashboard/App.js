import { createRoot } from 'react-dom/client';
import './MainApp.scss';
import { Provider } from 'react-redux';
import globalDataStore from '@AdminRoot/store/globalDataStore';
import setInitialState from '@Utils/setInitialState';
import Entry from '@DashboardApp/Entry';
import { BrowserRouter as Router } from 'react-router-dom';

const currentState = globalDataStore.getState();

if ( ! currentState.initialStateSetFlag ) {
	setInitialState( globalDataStore );
}

const container = document.getElementById( 'autoblog-main-page--wrapper' );

if ( container ) {
	const root = createRoot( container );

	root.render(
		<Provider store={ globalDataStore }>
			<Router>
				<Entry />
			</Router>
		</Provider>
	);
}
