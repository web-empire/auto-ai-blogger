import { __ } from '@wordpress/i18n';
import { Fragment, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandIcon from '@AppImages/crown.svg';
import { Tooltip } from '@wordpress/components';

/**
 * Core version display component with enhanced accessibility
 */
const CoreVersion = () => {
	const coreVersion = wpaib_localized_data?.version || '1.0.0';
	const proVersion = wpaib_localized_data?.pro_version || '';
	const proAvailable = Boolean( wpaib_localized_data?.pro_available );

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
						aria-label={ `Core version ${ coreVersion }` }
					>
						V-{ coreVersion }
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
 * Enhanced MainNav component with better performance and accessibility
 */
export default function MainNav() {
	const location = useLocation();

	// Memoize license status to prevent unnecessary recalculations
	const licenseEnabled = useMemo( () => {
		return wpaib_localized_data?.license_status === 'licensed';
	}, [ wpaib_localized_data?.license_status ] );

	// Memoize navigation menus with proper filtering
	const navMenus = useMemo( () => {
		const baseMenus = [
			{
				name: __( 'Welcome', 'wp-ai-blogger' ),
				slug: wpaib_localized_data?.home_slug || 'wp-ai-blogger',
				path: '',
				icon: null,
			},
			{
				name: __( 'Campaigns', 'wp-ai-blogger' ),
				slug: wpaib_localized_data?.home_slug || 'wp-ai-blogger',
				path: 'campaigns',
				icon: null,
				requiresLicense: true,
			},
			{
				name: __( 'Settings', 'wp-ai-blogger' ),
				slug: wpaib_localized_data?.home_slug || 'wp-ai-blogger',
				path: 'settings',
				icon: null,
			},
			{
				name: __( 'Free vs Pro', 'wp-ai-blogger' ),
				slug: wpaib_localized_data?.home_slug || 'wp-ai-blogger',
				path: 'free-vs-pro',
				icon: null,
			},
		];

		// Filter out license-required menus if license is not enabled
		const filteredMenus = baseMenus.filter( menu => {
			return ! menu.requiresLicense || licenseEnabled;
		} );

		// Apply WordPress hooks filter
		return wp?.hooks?.applyFilters?.( 'wp_ai_blogger_dashboard.main_navigation', filteredMenus ) || filteredMenus;
	}, [ licenseEnabled ] );

	// Memoize URL query parsing
	const { activePage, activePath } = useMemo( () => {
		const query = new URLSearchParams( location?.search );
		return {
			activePage: query.get( 'page' ) || wpaib_localized_data?.home_slug || 'wp-ai-blogger',
			activePath: query.get( 'path' ) || '',
		};
	}, [ location?.search ] );

	// Memoized pro purchase handler
	const handleProPurchase = useCallback( ( event ) => {
		event.preventDefault();

		const proUrl = wpaib_localized_data?.pro_purchase_url;
		if ( proUrl ) {
			try {
				window.open( proUrl, '_blank', 'noopener,noreferrer' );
			} catch ( error ) {
				console.error( 'Failed to open pro purchase URL:', error );
				// Fallback to location.href
				window.location.href = proUrl;
			}
		}
	}, [ wpaib_localized_data?.pro_purchase_url ] );

	// Memoized pro availability check
	const proAvailable = useMemo( () => {
		return Boolean( wpaib_localized_data?.pro_available );
	}, [ wpaib_localized_data?.pro_available ] );

	return (
		<section className="bg-white header-nav" role="navigation" aria-label="Main navigation">
			<div className="max-w-3xl mx-auto px-3 sm:px-6 lg:max-w-full">
				<div className="relative flex flex-col lg:flex-row justify-between h-28 lg:h-16 py-3 lg:py-0">
					<div className="lg:flex-1 flex items-center justify-start">
						<span className="flex-shrink-0">
							<img
								className="block h-6 w-auto"
								src={ BrandIcon }
								alt="WP AI Blogger"
								loading="lazy"
								decoding="async"
							/>
						</span>
						<nav
							className="h-full ml-4 sm:ml-8 sm:flex gap-y-4 gap-x-8"
							aria-label="Primary navigation"
						>
							{ navMenus.map( ( menu, index ) => {
								const isActive = activePage === menu.slug && activePath === menu.path;
								const linkClasses = isActive
									? 'mb-4 sm:mb-0 border-blogapp text-blogapp active:text-blogapp focus:text-blogapp focus-visible:text-blogapp-hover hover:text-blogapp-hover inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer wpaib-menu wpaib-active-menu'
									: 'mb-4 sm:mb-0 border-transparent text-slate-600 active:text-blogapp focus-visible:border-slate-300 focus-visible:text-slate-800 hover:border-slate-300 hover:text-slate-800 inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer wpaib-menu';

								return (
									<Fragment key={ `${ menu.slug }-${ menu.path || 'home' }` }>
										<Link
											to={ {
												search: `?page=${ menu.slug }${ menu.path ? '&path=' + menu.path : '' }`,
											} }
											className={ linkClasses }
											aria-current={ isActive ? 'page' : undefined }
											aria-label={ menu.name }
										>
											{ menu.icon && (
												<span className="mr-2" aria-hidden="true">
													{ menu.icon }
												</span>
											) }
											{ menu.name }
										</Link>
									</Fragment>
								);
							} ) }
						</nav>
					</div>

					<div className="absolute bottom-2 lg:inset-y-0 right-0 flex gap-6 items-center sm:static sm:inset-auto ml-auto lg:ml-6 sm:pr-0">
						{ ! proAvailable && (
							<div className="text-sm font-medium text-slate-600 border-r hover:text-[#1E293B] hover:svg-hover-color">
								<button
									onClick={ handleProPurchase }
									className="inline-flex items-center cursor-pointer text-[#046BD2] hover:text-[#1E293B] focus-visible:text-[#1E293B] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-2 py-1 transition-colors duration-200"
									aria-label={ __( 'Unlock Pro Features - Opens in new tab', 'wp-ai-blogger' ) }
									type="button"
								>
									<svg
										width="16"
										height="12"
										viewBox="0 0 16 12"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="mr-2 svg-focusable"
										aria-hidden="true"
									>
										<path
											d="M3.3335 11.3337H12.6668M1.3335 0.666992L3.3335 8.66699H12.6668L14.6668 0.666992L10.6668 5.33366L8.00016 0.666992L5.3335 5.33366L1.3335 0.666992Z"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="svg-path"
										/>
									</svg>
									{ __( 'Unlock Pro Features', 'wp-ai-blogger' ) }
								</button>
							</div>
						) }

						<div
							className="flex items-center text-[0.625rem] sm:text-sm font-medium leading-[1.375rem] text-slate-400 divide-x divide-slate-200 gap-2 border-r"
							aria-label="Version information"
						>
							<CoreVersion />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
