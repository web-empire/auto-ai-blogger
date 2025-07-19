import { __ } from '@wordpress/i18n';
import { Fragment, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandIcon from '@AppImages/crown.svg';
import { Tooltip } from '@wordpress/components';
import { TokenNotification } from '@Elements/Welcome';
import { RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';

const CoreVersion = () => (
	<>
		<div className="flex items-center">
			<Tooltip text={ __( 'CORE', 'wp-ai-blogger' ) }
				delay={ 100 }
				className="z-999999 bg-black text-white shadow-md p-2 rounded-md"
			>
				<span>V-{ wpaib_localized_data.version }</span>
			</Tooltip>
		</div>

		{ wpaib_localized_data.pro_available && (
			<div className="flex items-center">
				<span>{ wpaib_localized_data.pro_version }</span>
				<span className="ml-1 sm:ml-2 text-[0.625rem] leading-[1rem] font-medium text-white border border-slate-800 bg-slate-800 rounded-[0.1875rem] relative inline-flex flex-shrink-0 py-[0rem] px-1.5">
					{ ' ' }
					{ __( 'PRO', 'wp-ai-blogger' ) }{ ' ' }
				</span>
			</div>
		) }

		{ wp.hooks.applyFilters(
			'wp_ai_blogger_dashboard.after_navigation_version',
			<span />
		) }
	</>
);

// Token Display and Refresh Component
const TokenDisplayAndRefresh = () => {
	const dispatch = useDispatch();
	const [processing, setProcessing] = useState(false);
	const licenseStatus = useSelector((state) => state.licenseStatus) || 'unlicensed';
	const tokenTotal = useSelector((state) => state.tokenTotal) || 0;
	const tokenRemaining = useSelector((state) => state.tokenRemaining) || 0;
	const license = useSelector((state) => state.license) || '';
	const abortControllerRef = useRef({});

	// Calculate tokens used and format numbers
	const tokensUsed = licenseStatus === 'licensed' ? tokenTotal - tokenRemaining : 0;
	const totalTokens = licenseStatus === 'licensed' ? tokenTotal : 0;
	const formattedTokensUsed = tokensUsed.toLocaleString();
	const formattedTotalTokens = totalTokens.toLocaleString();

	const refreshTokens = () => {
		if (licenseStatus !== 'licensed' || processing || !license) {
			return;
		}

		setProcessing(true);

		// Fetch fresh token data using the license key from Redux store
		fetch(`https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${license}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		}).then(async (tokenData) => {
			if (tokenData && tokenData.success && tokenData.data) {
				// Update the store with fresh token data
				dispatch({
					type: 'UPDATE_TOKEN_TOTAL',
					payload: tokenData.data.total,
				});
				dispatch({
					type: 'UPDATE_TOKEN_REMAINING',
					payload: tokenData.data.remaining,
				});

				// Update API data
				await updateApiData('tokenTotal', tokenData.data.total, dispatch, abortControllerRef);
				await updateApiData('tokenRemaining', tokenData.data.remaining, dispatch, abortControllerRef);

				dispatch({
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __('Tokens refreshed successfully!', 'wp-ai-blogger'),
				});
			} else {
				throw new Error('Invalid response from token API.');
			}
		}).catch((error) => {
			console.error('Token refresh error:', error);
			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __('Failed to refresh token data', 'wp-ai-blogger'),
			});
		}).finally(() => {
			setProcessing(false);
		});
	};

	if (licenseStatus !== 'licensed') {
		return null;
	}

	const isError = tokenRemaining < 100;
	const isWarning = tokenRemaining <= 1000;

	return (
		<div className="flex items-center gap-2 border-r pr-4">
			<p className={`text-sm m-0 p-0 ${
				isError ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'
			}`}>
				{formattedTokensUsed}
				{'/'}
				{formattedTotalTokens}
				{' '}
				{__('Tokens', 'wp-ai-blogger')}
			</p>
			<button
				disabled={licenseStatus !== 'licensed' || processing || !license}
				className={`
					text-indigo-700
					bg-indigo-50
					border border-indigo-200
					rounded-md px-2 py-1
					flex items-center justify-center
					font-medium
					focus:outline-none focus:ring-0
					${licenseStatus !== 'licensed' || processing || !license 
						? 'opacity-50 cursor-not-allowed' 
						: 'cursor-pointer hover:text-indigo-900 hover:bg-indigo-100 hover:border-indigo-300'}
					${processing ? 'pointer-events-none' : ''}
				`}
				onClick={refreshTokens}
			>
				<Tooltip text={__('Refresh', 'wp-ai-blogger')} delay={100} className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md">
					<div className="relative">
						<RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
					</div>
				</Tooltip>
			</button>
		</div>
	);
};

export default function MainNav() {
	const licenseEnabled = 'licensed' === wpaib_localized_data.license_status;

	const navMenus = [
		{
			name: __( 'Welcome', 'wp-ai-blogger' ),
			slug: wpaib_localized_data.home_slug,
			path: '',
		},
		{
			name: __( 'Campaigns', 'wp-ai-blogger' ),
			slug: wpaib_localized_data.home_slug,
			path: 'campaigns',
		},
		{
			name: __( 'Settings', 'wp-ai-blogger' ),
			slug: wpaib_localized_data.home_slug,
			path: 'settings',
		},
		{
			name: __( 'Free vs Pro', 'wp-ai-blogger' ),
			slug: wpaib_localized_data.home_slug,
			path: 'free-vs-pro',
		},
	];

	// If license is not enabled, we need to remove 'campaigns' from the navMenus.
	if ( ! licenseEnabled ) {
		navMenus.splice( 1, 1 );
	}

	const redirectToProPurchase = () => {
		window.open(
			wpaib_localized_data.pro_purchase_url,
			'_blank'
		);
	};

	const menus = wp.hooks.applyFilters( 'wp_ai_blogger_dashboard.main_navigation', navMenus );

	const query = new URLSearchParams( useLocation()?.search );
	const activePage = query.get( 'page' ) || wpaib_localized_data.home_slug;
	const activePath = query.get( 'path' ) || '';

	return (
		<section className="bg-white header-nav">
			<div className="max-w-3xl mx-auto px-3 sm:px-6 lg:max-w-full">
				<div className="relative flex flex-col lg:flex-row justify-between h-28 lg:h-16 py-3 lg:py-0">
					<div className="lg:flex-1 flex items-center justify-start">
						<span>
							<img
								className="block h-6"
								src={ BrandIcon }
								alt="WP Ai Blogger"
							/>
						</span>
						<div className="h-full ml-4 sm:ml-8 sm:flex gap-y-4 gap-x-8">
							{ menus.map( ( menu, key ) => (
								<Fragment key={ `?page=${ menu.slug }&path=${ menu.path }` }>
									<Link
										index={ key }
										to={ {
											search: `?page=${ menu.slug }${
												'' !== menu.path ? '&path=' + menu.path : ''
											}`,
										} }
										className={ `${
											activePage === menu.slug && activePath === menu.path
												? 'mb-4 sm:mb-0 border-blogapp text-blogapp active:text-blogapp focus:text-blogapp focus-visible:text-blogapp-hover hover:text-blogapp-hover inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer wpaib-menu wpaib-active-menu'
												: 'mb-4 sm:mb-0 border-transparent text-slate-600 active:text-blogapp focus-visible:border-slate-300 focus-visible:text-slate-800 hover:border-slate-300 hover:text-slate-800 inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer wpaib-menu'
										}` }
									>
										{ menu.name }
									</Link>
								</Fragment>
							) ) }
						</div>
					</div>

					<div className="absolute bottom-2 lg:inset-y-0 right-0 flex gap-6 items-center sm:static sm:inset-auto ml-auto lg:ml-6 sm:pr-0">
						{ ! wpaib_localized_data.pro_available && (
							<div className="text-sm font-medium text-slate-600 border-r hover:text-[#1E293B] hover:svg-hover-color">
								<a
									onClick={ redirectToProPurchase }
									className="inline-flex items-center cursor-pointer text-[#046BD2] hover:text-[#1E293B] focus-visible:text-[#1E293B]"
								>
									<svg
										width="16"
										height="12"
										viewBox="0 0 16 12"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="mr-2 svg-focusable"
									>
										<path
											d="M3.3335 11.3337H12.6668M1.3335 0.666992L3.3335 8.66699H12.6668L14.6668 0.666992L10.6668 5.33366L8.00016 0.666992L5.3335 5.33366L1.3335 0.666992Z"
											stroke="#046BD2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="svg-path"
										/>
									</svg>
									{ __( 'Unlock Pro Features', 'wp-ai-blogger' ) }
								</a>
							</div>
						) }

						<TokenDisplayAndRefresh />

						<div className="flex items-center text-[0.625rem] sm:text-sm font-medium leading-[1.375rem] text-slate-400 divide-x divide-slate-200 gap-2 border-r">
							<CoreVersion />
						</div>
					</div>
				</div>
			</div>
			<TokenNotification />
		</section>
	);
}
