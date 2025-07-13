import { useState } from 'react';
import { aiClassNames } from '@Utils/aiClassNames';
import { BellIcon, UserCircleIcon, CubeIcon } from '@heroicons/react/24/outline';
import { General, Notifications, License } from '@Elements/Settings';
import ContentHeader from '@Components/ContentHeader';
import { useSettingsSelector } from '@Utils/useSettingsSelector';
import { TriangleAlert } from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';

export default function Settings() {
	const siteTitle = useSelector( ( state ) => state.siteTitle ) || '';
	const siteFor = useSelector( ( state ) => state.siteFor ) || '';
	const siteDescription = useSelector( ( state ) => state.siteDescription ) || '';

	const [ currentTab, setCurrentTab ] = useState( 'general' );

	const settings = useSettingsSelector();

	const secondaryNavigation = [
		{ name: 'General', slug: 'general', icon: UserCircleIcon, current: true, element: <General /> },
		{ name: 'Notifications', slug: 'notifications', icon: BellIcon, current: false, element: <Notifications /> },
		{ name: 'License', slug: 'license', icon: CubeIcon, current: false, element: <License /> },
	];

	const licenseEnabled = 'licensed' === autoblog_data.license_status;
	const siteDetailedUnfilled = ! siteTitle || ! siteFor || ! siteDescription ? true : false;

	// If license is not enabled, we need to remove 'notifications' navigation from secondaryNavigation.
	if ( ! licenseEnabled ) {
		secondaryNavigation.splice( 1, 1 );
	}

	return (
		<>
			<div className="mx-auto lg:flex lg:gap-x-0 h-full">
				<aside className="flex overflow-x-auto lg:block lg:w-72 py-8 px-4 lg:flex-none settings-nav">
					<nav className="flex-none px-4 sm:px-6 lg:px-0">
						<ul className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
							{ secondaryNavigation.map( ( item ) => (
								<li key={ item.slug }>
									<a
										onClick={ () =>
											setCurrentTab( item.slug )
										}
										className={ aiClassNames(
											currentTab === item.slug
												? 'bg-gray-50 text-indigo-600'
												: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
											'group flex items-center justify-between gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm/6 font-semibold cursor-pointer',
										) }
									>
										<span className='flex items-center gap-2'>
											<item.icon
												aria-hidden="true"
												className={ aiClassNames(
													currentTab === item.slug ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'size-6 shrink-0',
												) }
											/>
											{ item.name }
										</span>
										{
											'license' === item.slug && ! licenseEnabled && (
												<span title={ __( 'License is Required', 'wp-ai-blogger' ) } className="flex ml-1">
													<TriangleAlert className="w-4 h-4 text-orange-400" />
												</span>
											)
										}
										{
											'general' === item.slug && siteDetailedUnfilled && (
												<span title={ __( 'All site Details are Required', 'wp-ai-blogger' ) } className="flex ml-1">
													<TriangleAlert className="w-4 h-4 text-orange-400" />
												</span>
											)
										}
									</a>
								</li>
							) ) }
						</ul>
					</nav>
				</aside>

				<main className="px-4 sm:px-6 lg:flex-auto py-8 bg-gray-50">
					<div className="mx-auto max-w-3xl">
						<ContentHeader title={ secondaryNavigation.find( ( item ) => item.slug === currentTab ).name } tab={ currentTab } { ...settings } />

						{ secondaryNavigation.map( ( item ) => (
							<div key={ item.slug } className={ aiClassNames( currentTab === item.slug ? 'block' : 'hidden' ) }>
								{ item.element }
							</div>
						) ) }
					</div>
				</main>
			</div>
		</>
	);
}
