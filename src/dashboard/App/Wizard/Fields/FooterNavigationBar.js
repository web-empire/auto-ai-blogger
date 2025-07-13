import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateApiData } from '@Utils/ApiData';
import { useDispatch } from 'react-redux';

const FooterNavigationBar = ( props ) => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();

	const { previousStep, nextStep, currentStep, maxSteps } = props;
	const paginationClass = 'relative z-10 inline-flex items-center rounded-full p-1 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

	const query = new URLSearchParams( useLocation().search );
	const currentActiveStep = query.get( 'step' );

	const defaultNextButtonString = __( 'Next', 'wp-ai-blogger' );

	const navigate = useNavigate();

	const handlePreviousStep = function () {
		if ( 'dashboard' !== previousStep ) {
			navigate( `${ wpaib_localized_data.admin_app_url }&step=${ previousStep }` );
		}

		return '';
	};

	const handleNextStep = function ( e ) {
		e.preventDefault();

		if ( '' !== nextStep ) {
			navigate( `${ wpaib_localized_data.admin_app_url }&step=${ nextStep }` );
		}

		if ( '' === nextStep && 'ready' === currentActiveStep ) {
			e.target.innerText = __( 'Redirecting..', 'wp-ai-blogger' );

			dispatch( { type: 'UPDATE_USER_ONBOARDED', payload: true } );
			updateApiData( 'userOnboarded', true, dispatch, abortControllerRef );
		}
	};

	const getNextButtonString = function () {
		const stepsToSkip = [ 'ready', 'optin' ];

		if ( '' !== nextStep && ! stepsToSkip.includes( currentActiveStep ) ) {
			return defaultNextButtonString;
		} else if (
			( '' !== nextStep ) ||
			'optin' === currentActiveStep
		) {
			return __( 'Skip', 'wp-ai-blogger' );
		}
		return __( 'Finish Store Setup', 'wp-ai-blogger' );
	};

	return (
		<footer className="wpaib-setup-footer bg-white shadow-md-1 fixed right-0 left-[160px] bottom-0 h-[70px] z-10">
			<div className="flex items-center justify-between max-w-md mx-auto px-7 h-full">
				<div className="wpaib-footer-left-section flex">
					<div
						className={ `flex-shrink-0 flex text-sm font-normal hover:text-primary-500 cursor-pointer ${
							'dashboard' === previousStep
								? 'text-slate-300 pointer-events-none'
								: 'text-primary-300'
						}` }
						onClick={ handlePreviousStep }
					>
						<span>
							{ __( 'Back', 'wp-ai-blogger' ) }
						</span>
					</div>
				</div>

				<div className="wpaib-footer--pagination hidden md:-mt-px md:flex gap-3">
					{ Array( maxSteps )
						.fill()
						.map( ( i, index ) => {
							return (
								<span
									key={ index }
									className={ `wpaib-footer-pagination--tab ${ paginationClass } ${
										currentStep === index
											? 'bg-primary-500'
											: 'bg-primary-100'
									}` }
								></span>
							);
						} ) }
				</div>

				<div className="wpaib-footer-right-section flex">
					<span
						onClick={ handleNextStep }
						className={ `flex-shrink-0 flex text-sm text-primary-300 font-normal hover:text-primary-500 cursor-pointer` }
					>
						{ getNextButtonString() }
					</span>
				</div>
			</div>
		</footer>
	);
};

export default FooterNavigationBar;
