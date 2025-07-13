import React from 'react';
import { useLocation } from 'react-router-dom';
import { Welcome, FreeVsPro, Settings, Campaigns } from '@DashboardApp/pages';

const ROUTE_MAP = {
	'getting-started': Welcome,
	settings: Settings,
	'free-vs-pro': FreeVsPro,
	campaigns: Campaigns,
};

const PagesRoute = () => {
	const { search } = useLocation();
	const query = new URLSearchParams( search );
	const page = query.get( 'page' );
	const path = query.get( 'path' );

	if ( wpaib_localized_data.home_slug !== page ) {
		return <p>Something went wrong..!</p>;
	}

	const Component = ROUTE_MAP[ path ] || Welcome;

	return <Component />;
};

export default PagesRoute;
