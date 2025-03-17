import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { RefreshCw, Settings, Trash2, Info } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import SwitchControl from '@Components/SwitchControl';
import { ConfigureDrawer } from '@Elements/Campaigns';
import { TrimWordsContent } from '@Utils/TrimWordsContent';

const campaigns = [
	{ name: 'Workout Tips', status: 'active', lastPost: 'Best Home Workout: Achieve Your Fitness Goals Without Leaving Home', lastRun: '2 days ago', postsTarget: '5/20', frequency: 'Every 2 days' },
	{ name: 'Fat Burn', status: 'draft', lastPost: 'How to Burn Fat Fast', lastRun: '4 days ago', postsTarget: '5/20', frequency: 'Weekly on Friday' },
	{ name: 'Healthy Diet', status: 'active', lastPost: 'Diet Plan for Weight Loss', lastRun: '2 days ago', postsTarget: '5/20', frequency: 'Once' },
	{ name: 'Best Lifestyle', status: 'draft', lastPost: 'How to Live a Healthy Life', lastRun: '1 days ago', postsTarget: '5/20', frequency: 'Every 4 days' },
	{ name: 'Home Workout', status: 'draft', lastPost: 'Home Workout - No Equipment', lastRun: '2 days ago', postsTarget: '5/20', frequency: 'Once' },
	{ name: 'Weight Loss', status: 'draft', lastPost: 'How to Burn Fat Fast', lastRun: '4 days ago', postsTarget: '5/20', frequency: 'Every 7 days' },
	{ name: 'Diet Plan', status: 'draft', lastPost: 'Diet Plan for Weight Loss', lastRun: '3 days ago', postsTarget: '5/20', frequency: 'Every Alternate Sunday' },
	{ name: 'Healthy Life', status: 'draft', lastPost: 'How to Live a Healthy Life', lastRun: '1 days ago', postsTarget: '5/20', frequency: 'Every 7 days' },
];

export default function Campaigns() {
	const defaultDrawerData = {
		title: '',
		type: 'new',
		status: 'publish',
		keywords: '',
		lastRun: '',
	};
	const [ configureData, setConfigureData ] = useState( defaultDrawerData );
	const [ openDrawer, setOpenDrawer ] = useState( false );

	return (
		<>
			<div className="sm:px-6 lg:px-8 py-8 px-4">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<h1 className="text-base font-semibold text-gray-900">{ __( 'Campaigns', 'wp-ai-blogger' ) }</h1>
						<p className="mt-2 text-sm text-gray-700">
							{ __( 'Create and manage your blog campaigns.', 'wp-ai-blogger' ) }
						</p>
					</div>
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<button
							type="button"
							className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer"
							onClick={ ( e ) => {
								e.preventDefault();
								setConfigureData( defaultDrawerData );
								setOpenDrawer( true );
							} }
						>
							{ __( 'Add New', 'wp-ai-blogger' ) }
						</button>
					</div>
				</div>

				<div className="mt-6 flow-root">
					<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="block py-2 align-middle sm:px-6 lg:px-8">
							<div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
								<table className="w-full divide-y divide-gray-300">
									<thead className="bg-gray-50 header-nav">
										<tr>
											<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
												{ __( 'Name', 'wp-ai-blogger' ) }
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{ __( 'Status', 'wp-ai-blogger' ) }
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{ __( 'Posts/Target', 'wp-ai-blogger' ) }
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{ __( 'Last Post', 'wp-ai-blogger' ) }
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{ __( 'Frequency', 'wp-ai-blogger' ) }
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{ __( 'Actions', 'wp-ai-blogger' ) }
											</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-gray-200 bg-white">
										{ campaigns.map( ( campaign ) => (
											<tr key={ campaign.name } className="even:bg-gray-50">
												<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
													{ campaign.name }
												</td>

												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
													<SwitchControl
														checked={ 'active' === campaign.status }
														onChange={ () => {} }
													/>
												</td>

												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{ campaign.postsTarget }
												</td>

												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													<a href="#" target="_blank" className="text-indigo-600 hover:text-indigo-900">
														<Tooltip text={ campaign.lastPost }
															delay={ 100 }
															className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
														>
															<span> { TrimWordsContent( campaign.lastPost ) } </span>
														</Tooltip>
													</a>
												</td>

												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{ campaign.frequency }
												</td>

												<td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 flex gap-x-4 items-center">

													<a href="#" className="text-gray-500 hover:text-indigo-900">
														<Tooltip text={ `${ __( 'Last run', 'wp-ai-blogger' ) }: ${ campaign.lastRun }` }
															delay={ 100 }
															className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
														>
															<Info className="w-4 h-4" />
														</Tooltip>
													</a>

													<a href="#" className="text-gray-500 hover:text-indigo-900" onClick={ ( e ) => {
														e.preventDefault();
														setConfigureData( {
															...configureData,
															type: 'edit',
															title: campaign.name,
															status: campaign.status,
															keywords: '',
															lastRun: campaign.last,
														} );
														setOpenDrawer( true );
													} }>
														<Tooltip text={ __( 'Configure', 'wp-ai-blogger' ) }
															delay={ 100 }
															className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
														>
															<Settings className="w-4 h-4" />
														</Tooltip>
													</a>

													<a href="#" className="text-gray-500 hover:text-indigo-900">
														<Tooltip text={ __( 'Run now', 'wp-ai-blogger' ) }
															delay={ 100 }
															className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
														>
															<RefreshCw className="w-4 h-4" />
														</Tooltip>
													</a>

													<a href="#" className="text-gray-500 hover:text-indigo-900">
														<Tooltip text={ __( 'Delete', 'wp-ai-blogger' ) }
															delay={ 100 }
															className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
														>
															<Trash2 className="w-4 h-4" />
														</Tooltip>
													</a>
												</td>
											</tr>
										) ) }
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ConfigureDrawer
				openDrawer={ openDrawer }
				setOpenDrawer={ setOpenDrawer }
				configureData={ configureData }
			/>
		</>
	);
}
