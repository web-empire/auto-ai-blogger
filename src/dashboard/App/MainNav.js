import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandIcon from '@AppImages/crown.svg';
import { Tooltip } from '@wordpress/components';

const CoreVersion = () => (
	<>
		<div className="flex items-center">
			<Tooltip text={ __( 'CORE', 'wp-ai-blogger' ) }
				delay={ 100 }
				className="z-999999 bg-black text-white shadow-md p-2 rounded-md"
			>
				<span>V-{ autoblog_data.version }</span>
			</Tooltip>
		</div>

		{ autoblog_data.pro_available && (
			<div className="flex items-center pl-3">
				<span>{ autoblog_data.pro_version }</span>
				<span className="ml-1 sm:ml-2 text-[0.625rem] leading-[1rem] font-medium text-white border border-slate-800 bg-slate-800 rounded-[0.1875rem] relative inline-flex flex-shrink-0 py-[0rem] px-1.5">
					{ ' ' }
					{ __( 'PRO', 'wp-ai-blogger' ) }{ ' ' }
				</span>
			</div>
		) }

		{ wp.hooks.applyFilters(
			'autoblog_ai_dashboard.after_navigation_version',
			<span />
		) }
	</>
);

export default function MainNav() {
	const navMenus = [
		{
			name: __( 'Welcome', 'wp-ai-blogger' ),
			slug: autoblog_data.home_slug,
			path: '',
		},
		{
			name: __( 'Campaigns', 'wp-ai-blogger' ),
			slug: autoblog_data.home_slug,
			path: 'campaigns',
		},
		{
			name: __( 'Settings', 'wp-ai-blogger' ),
			slug: autoblog_data.home_slug,
			path: 'settings',
		},
		{
			name: __( 'Free vs Pro', 'wp-ai-blogger' ),
			slug: autoblog_data.home_slug,
			path: 'free-vs-pro',
		},
	];

	const redirectToProPurchase = () => {
		window.open(
			autoblog_data.pro_purchase_url,
			'_blank'
		);
	};

	const menus = wp.hooks.applyFilters( 'autoblog_ai_dashboard.main_navigation', navMenus );

	const query = new URLSearchParams( useLocation()?.search );
	const activePage = query.get( 'page' ) || autoblog_data.home_slug;
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
												? 'mb-4 sm:mb-0 border-blogapp text-blogapp active:text-blogapp focus:text-blogapp focus-visible:text-blogapp-hover hover:text-blogapp-hover inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer'
												: 'mb-4 sm:mb-0 border-transparent text-slate-600 active:text-blogapp focus-visible:border-slate-300 focus-visible:text-slate-800 hover:border-slate-300 hover:text-slate-800 inline-flex items-center px-1 border-b-2 text-sm leading-[0.875rem] font-medium cursor-pointer'
										}` }
									>
										{ menu.name }
									</Link>
								</Fragment>
							) ) }
						</div>
					</div>

					<div className="absolute bottom-2 lg:inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto ml-auto lg:ml-6 sm:pr-0">
						{ ! autoblog_data.pro_available && (
							<div className="text-sm font-medium text-slate-600 pr-3 tablet:pr-2 border-r hover:text-[#1E293B] hover:svg-hover-color">
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

						<div className="flex items-center text-[0.625rem] sm:text-sm font-medium leading-[1.375rem] text-slate-400 mr-1 sm:mr-3 divide-x divide-slate-200 gap-3 pl-1 sm:pl-3 border-r">
							<CoreVersion />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
