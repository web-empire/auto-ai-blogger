import { __ } from '@wordpress/i18n';
import { Fragment, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandIcon from '@AppImages/crown.svg';
import { CoreVersion, TokenDisplayAndRefresh } from '@Components/NavigationComponents';
import { useSelector } from 'react-redux';

/**
 * Enhanced MainNav component with better performance and accessibility
 */
export default function MainNav() {
	const location = useLocation();
	
	// Redux selectors for dynamic data
	const licenseStatus = useSelector((state) => state.license_status) || 'unlicensed';
	const homeSlug = useSelector((state) => state.homeSlug) || 'wp-ai-blogger';
	const proPurchaseUrl = useSelector((state) => state.proPurchaseUrl) || 'https://wpaiblogger.com/';
	const proAvailable = useSelector((state) => state.proAvailable) || false;

	// Memoize license status to prevent unnecessary recalculations
	const licenseEnabled = useMemo( () => {
		return licenseStatus === 'licensed';
	}, [ licenseStatus ] );

	// Memoize navigation menus with proper filtering
	const navMenus = useMemo( () => {
		const baseMenus = [
			{
				name: __( 'Welcome', 'wp-ai-blogger' ),
				slug: homeSlug,
				path: '',
				icon: null,
			},
			{
				name: __( 'Campaigns', 'wp-ai-blogger' ),
				slug: homeSlug,
				path: 'campaigns',
				icon: null,
				requiresLicense: true,
			},
			{
				name: __( 'Settings', 'wp-ai-blogger' ),
				slug: homeSlug,
				path: 'settings',
				icon: null,
			},
			{
				name: __( 'Free vs Pro', 'wp-ai-blogger' ),
				slug: homeSlug,
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
	}, [ licenseEnabled, homeSlug ] );

	// Memoize URL query parsing
	const { activePage, activePath } = useMemo( () => {
		const query = new URLSearchParams( location?.search );
		return {
			activePage: query.get( 'page' ) || homeSlug,
			activePath: query.get( 'path' ) || '',
		};
	}, [ location?.search, homeSlug ] );

	// Memoized pro purchase handler
	const handleProPurchase = useCallback( ( event ) => {
		event.preventDefault();

		if ( proPurchaseUrl ) {
			try {
				window.open( proPurchaseUrl, '_blank', 'noopener,noreferrer' );
			} catch ( error ) {
				console.error( 'Failed to open pro purchase URL:', error );
				// Fallback to location.href
				window.location.href = proPurchaseUrl;
			}
		}
	}, [ proPurchaseUrl ] );

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

					<div className="absolute bottom-2 lg:inset-y-0 right-0 flex items-center sm:static sm:inset-auto ml-auto lg:ml-6 sm:pr-0 divide-x divide-slate-300">
						{ ! proAvailable && (
							<div className="text-sm font-medium text-slate-600 hover:text-[#1E293B] hover:svg-hover-color pr-4">
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

						<div className={ `${ ! proAvailable ? 'px-4' : '' }` }>
							<TokenDisplayAndRefresh />
						</div>

						<div
							className="flex items-center text-[0.625rem] sm:text-sm font-medium leading-[1.375rem] text-slate-400 gap-2 pl-4"
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
