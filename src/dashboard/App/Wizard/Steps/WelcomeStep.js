import React from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { ArrowRight } from 'lucide-react';

const WelcomeStep = () => {
	const navigate = useNavigate();

	const handleStepRedirection = function ( e ) {
		e.preventDefault();

		if ( e.target.id ) {
			const stepToRedirect = e.target.id;
			navigate( `${ autoblog_data.admin_app_url }&step=${ stepToRedirect }` );
		}
	};

	return (
		<div className="wpaib-container">
			<div className="wpaib-row">
				<div className="bg-white rounded mx-auto px-11">
					<span className="text-sm font-medium text-primary-600 mb-10 text-center block tracking-[.24em] uppercase">
						{ __( 'Step 1 of 4', 'wp-ai-blogger' ) }
					</span>
					<h1 className="wpaib-step-heading mb-4 text-center">
						{ __( 'Welcome to WP AI Blogger', 'wp-ai-blogger' ) }
					</h1>

					<p className="wpaib-step-text text-center overflow-hidden max-w-2xl mb-10 mx-auto text-lg font-normal text-slate-500">
						{ __(
							"Launch your AI-powered blog in minutes! Let's set up WP AI Blogger and unleash your content potential.",
							'wp-ai-blogger'
						) }
					</p>

					<div className="flex justify-center mb-10">
						<div
							className={ `wpaib-wizard--button` }
							id={ 'persona-form' } // Changed id to persona-form
							onClick={ handleStepRedirection }
						>
							{ __( "Let's Start", 'wp-ai-blogger' ) }
							<ArrowRight className="h-4 w-4" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomeStep;
