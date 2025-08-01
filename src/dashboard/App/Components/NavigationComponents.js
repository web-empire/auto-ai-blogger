import { __ } from '@wordpress/i18n';
import { useState, useRef, useCallback } from 'react';
import { Tooltip } from '@wordpress/components';
import { RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';

/**
 * Core version display component with enhanced accessibility
 */
export const CoreVersion = () => {
	const version = useSelector((state) => state.version) || '1.0.0';
	const proVersion = useSelector((state) => state.proVersion) || '';
	const proAvailable = useSelector((state) => state.proAvailable) || false;

	return (
		<>
			<div className="flex items-center">
				<Tooltip
					text={ __( 'CORE Version', 'wp-ai-blogger' ) }
					delay={ 100 }
					className="z-[99999] bg-black text-white shadow-md p-2 rounded-md"
				>
					<span
						className="select-none cursor-help"
						aria-label={ `Core version ${ version }` }
					>
						V-{ version }
					</span>
				</Tooltip>
			</div>

			{ proAvailable && proVersion && (
				<div className="flex items-center">
					<span
						className="mr-1 sm:mr-2"
						aria-label={ `Pro version ${ proVersion }` }
					>
						{ proVersion }
					</span>
					<span
						className="ml-1 sm:ml-2 text-[0.625rem] leading-[1rem] font-medium text-white border border-slate-800 bg-slate-800 rounded-[0.1875rem] relative inline-flex flex-shrink-0 py-[0rem] px-1.5"
						aria-label="Pro version indicator"
					>
						{ __( 'PRO', 'wp-ai-blogger' ) }
					</span>
				</div>
			) }

			{ wp?.hooks?.applyFilters?.(
				'wp_ai_blogger_dashboard.after_navigation_version',
				<span />
			) }
		</>
	);
};

/**
 * Token Display and Refresh Component
 */
export const TokenDisplayAndRefresh = () => {
	const dispatch = useDispatch();
	const [ processing, setProcessing ] = useState( false );
	const licenseStatus = useSelector( ( state ) => state.license_status ) || 'unlicensed';
	const tokenTotal = useSelector( ( state ) => state.tokenTotal ) || 0;
	const tokenRemaining = useSelector( ( state ) => state.tokenRemaining ) || 0;
	const license = useSelector( ( state ) => state.license ) || '';
	const abortControllerRef = useRef( {} );

	// Calculate tokens used and format numbers
	const tokensUsed = licenseStatus === 'licensed' ? tokenTotal - tokenRemaining : 0;
	const totalTokens = licenseStatus === 'licensed' ? tokenTotal : 0;

	const refreshTokens = useCallback( async () => {
		if ( licenseStatus !== 'licensed' || processing || ! license ) {
			return;
		}

		setProcessing( true );

		try {
			// Fetch fresh token data using the license key from Redux store
			const response = await fetch( `https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${ license }`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const tokenData = await response.json();

			if ( tokenData && tokenData.success && tokenData.data ) {
				// Update the store with fresh token data
				dispatch( {
					type: 'UPDATE_TOKEN_TOTAL',
					payload: tokenData.data.total,
				} );
				dispatch( {
					type: 'UPDATE_TOKEN_REMAINING',
					payload: tokenData.data.remaining,
				} );

				// Update API data
				await updateApiData( 'tokenTotal', tokenData.data.total, dispatch, abortControllerRef );
				await updateApiData( 'tokenRemaining', tokenData.data.remaining, dispatch, abortControllerRef );

				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'Tokens refreshed successfully!', 'wp-ai-blogger' ),
				} );
			} else {
				throw new Error( 'Invalid response from token API.' );
			}
		} catch ( error ) {
			console.error( 'Token refresh error:', error );
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Failed to refresh token data', 'wp-ai-blogger' ),
			} );
		} finally {
			setProcessing( false );
		}
	}, [ licenseStatus, processing, license, dispatch ] );

	if ( licenseStatus !== 'licensed' ) {
		return null;
	}

	const isError = tokenRemaining < 100;
	const isWarning = tokenRemaining <= 1000;

	const formattedTokensUsed = tokensUsed.toLocaleString();
	const formattedTotalTokens = totalTokens.toLocaleString();

	// Calculate progress percentage and status
	const progressPercentage = totalTokens > 0 ? ((totalTokens - tokenRemaining) / totalTokens) * 100 : 0;
	const getTokenStatus = () => {
		const remaining = tokenRemaining;
		if (remaining >= 6000) {
			return {
				text: __('Plenty of tokens', 'wp-ai-blogger'),
				color: 'bg-green-500'
			};
		}
		if (remaining >= 3000) {
			return {
				text: __('Moderate', 'wp-ai-blogger'),
				color: 'bg-amber-500'
			};
		}
		return {
			text: __('Low', 'wp-ai-blogger'),
			color: 'bg-red-500'
		};
	};
	const tokenStatus = getTokenStatus();

	return (
		<div className="flex items-center gap-2">
			<div className="flex flex-col gap-1">
				<p className={ `text-sm m-0 p-0 ${
					isError ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'
				}` }>
					{ formattedTokensUsed }
					{ '/' }
					{ formattedTotalTokens }
					{ ' ' }
					{ __( 'Tokens', 'wp-ai-blogger' ) }
				</p>

				{/* Progress bar */}
				<Tooltip
					text={ tokenStatus.text }
					delay={ 100 }
					className="z-[99999] bg-black text-xs text-white shadow-md p-2 rounded-md"
				>
					<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-help">
						<div
							className={ `h-full transition-all duration-500 ease-in-out ${tokenStatus.color}` }
							style={{ width: `${Math.min(progressPercentage, 100)}%` }}
						/>
					</div>
				</Tooltip>
			</div>

			<button
				disabled={ licenseStatus !== 'licensed' || processing || ! license }
				className={ `
					text-indigo-700
					bg-indigo-50
					border border-indigo-200
					rounded-md px-2 py-1
					flex items-center justify-center
					font-medium
					focus:outline-none focus:ring-0
					${ licenseStatus !== 'licensed' || processing || ! license
						? 'opacity-50 cursor-not-allowed'
						: 'cursor-pointer hover:text-indigo-900 hover:bg-indigo-100 hover:border-indigo-300' }
					${ processing ? 'pointer-events-none' : '' }
				` }
				onClick={ refreshTokens }
				aria-label={ __( 'Refresh token data', 'wp-ai-blogger' ) }
			>
				<Tooltip text={ __( 'Refresh', 'wp-ai-blogger' ) } delay={ 100 } className="z-[99999] bg-black text-xs text-white shadow-md p-2 rounded-md">
					<div className="relative">
						<RefreshCw className={ `w-4 h-4 ${ processing ? 'animate-spin' : '' }` } />
					</div>
				</Tooltip>
			</button>
		</div>
	);
};

// Default export for convenience
export default {
	CoreVersion,
	TokenDisplayAndRefresh,
};
