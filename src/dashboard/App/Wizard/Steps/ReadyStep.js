import React, { useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import confetti from 'canvas-confetti';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';

const ReadyStep = () => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();

	const showConfetti = useSelector( ( state ) => state.showConfetti );

	const ConfettiFrame = confetti.create(
		document.getElementById( 'wpaib-confetti-wrapper' ),
		{ resize: true }
	);

	const [ isFinishingSetup, setIsFinishingSetup ] = useState( false );

	if ( ! showConfetti ) {
		setTimeout( function () {
			ConfettiFrame( {
				particleCount: 250,
				origin: { x: 1, y: 1.4 },
				gravity: 0.4,
				spread: 80,
				ticks: 300,
				angle: 120,
				startVelocity: 100,
				colors: [
					'#0e6ef1',
					'#f5b800',
					'#ff344c',
					'#98e027',
					'#9900f1',
				],
			} );

			dispatch( {
				type: 'UPDATE_CONFETTI_SHOW',
				payload: true,
			} );
		}, 100 );
	}

	useEffect( () => {
		dispatch( { type: 'UPDATE_USER_ONBOARDED', payload: true } );
		updateApiData( 'userOnboarded', true, dispatch, abortControllerRef );

		setTimeout( () => {
			const redirectUrl = '?page=wp-ai-blogger';
			window.location.href = autoblog_data.admin_base_url + redirectUrl;
		}, 1000 );
	}, [] );

	const handleClick = ( e ) => {
		e.preventDefault();

		setIsFinishingSetup( true );
		const redirectUrl = '?page=wp-ai-blogger';

		// Redirect to the created url.
		window.location.href = autoblog_data.admin_base_url + redirectUrl;
	};

	return (
		<div className="wpaib-container">
			<canvas
				id="wpaib-confetti-wrapper"
				width={ window.innerWidth }
				height={ window.innerHeight }
			/>
			<div className="wpaib-row mt-12">
				<div className="bg-white rounded mx-auto px-11">
					<div className="text-center overflow-hidden">
						<span className="text-sm font-medium text-primary-600 mb-10 text-center block tracking-[.24em] uppercase">
							{ __( 'Step 6 of 6', 'wp-ai-blogger' ) }
						</span>
						<h1 className="wpaib-step-heading mb-4 text-center">
							{ __(
								'Congratulations, You Did It!',
								'wp-ai-blogger'
							) }
						</h1>
						<p className="text-center overflow-hidden mb-10 mx-auto text-lg font-normal text-slate-500">
							{ __(
								'WP AI Blogger is set up on your website! Please watch the short video below for your next steps.',
								'wp-ai-blogger'
							) }
						</p>
					</div>

					<div className="mt-[50px] flex justify-center">
						<div
							className={ `wpaib-wizard--button hover:text-white ${
								isFinishingSetup ? 'cursor-wait opacity-80' : ''
							}` }
							onClick={ handleClick }
						>
							{ ! isFinishingSetup
								? __( 'Finish AI Blogging Setup', 'wp-ai-blogger' )
								: __( 'Finishing the Setup', 'wp-ai-blogger' ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReadyStep;
