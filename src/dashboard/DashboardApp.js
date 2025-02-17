import { createRoot } from 'react-dom/client';

// Import main CSS.
import './MainApp.scss';
import { useState } from '@wordpress/element';

const container = document.getElementById( 'autoblog-main-page--wrapper' );

if ( container ) {
	const root = createRoot( container );
	root.render(
		<>
			<h1>
				AutoBlog AI Application
			</h1>
		</>
	);
}
