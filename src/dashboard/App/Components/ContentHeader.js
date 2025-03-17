import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const ContentHeader = ( { title, tab } ) => {
	const [ processing, setProcessing ] = useState( false );

	if ( 'license' === tab ) {
		return;
	}

	const saveSettings = () => {
		setProcessing( true );
		console.log( __( 'Settings saved', 'wp-ai-blogger' ) );
		setProcessing( false );
	};

	return (
		<div className="flex items-center justify-between pb-4 mb-8 wpaib-content-header">
			<h1 className="text-lg font-semibold text-gray-900 p-0 m-0">{ title + __( ' Settings', 'wp-ai-blogger' ) }</h1>

			<button
				type="submit"
				disabled={ processing }
				onClick={ () => {
					saveSettings();
				} }
				className="cursor-pointer inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				{ __( 'Save', 'wp-ai-blogger' ) }
			</button>
		</div>
	);
};

export default ContentHeader;
