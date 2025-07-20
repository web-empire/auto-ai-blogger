import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Settings, Trash2, Info, FolderPlus, RotateCw, List, ChartNoAxesColumn } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import SwitchControl from '@Components/SwitchControl';
import { ConfigureDrawer } from '@Elements/Campaigns';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import CampaignAnalyticsModal from '@Components/CampaignAnalyticsModal';
import DeleteCampaignModal from '@Components/DeleteCampaignModal';
import apiFetch from '@wordpress/api-fetch';

export default function Campaigns() {
	const campaigns = wpaib_localized_data.all_campaigns;
	const defaultMetaDefaults = wpaib_localized_data.postmeta_defaults;

	const [ configureData, setConfigureData ] = useState( defaultMetaDefaults );
	const [ openDrawer, setOpenDrawer ] = useState( false );
	const [ openingConfigureDrawer, setOpeningConfigureDrawer ] = useState( false );
	const [ analyticsModal, setAnalyticsModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );
	const [ deleteModal, setDeleteModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );

	const fetchCampaignMetaData = async ( campaignId ) => {
		const formData = new window.FormData();

		formData.append( 'action', 'wpaib_get_campaign_metadata' );
		formData.append( 'security', wpaib_localized_data.admin_nonce );
		formData.append( 'campaign_id', campaignId );

		const response = await apiFetch( {
			url: wpaib_localized_data.ajax_url,
			method: 'POST',
			body: formData,
		} )
			.then( ( data ) => {
				if ( data.success ) {
					return data.data;
				}
			} )
			.catch( ( error ) => {
				console.error( error );
			} );

		return response;
	};

	const configureCampaign = ( e ) => {
		e.preventDefault();
		setOpeningConfigureDrawer( true );

		const campaignId = e.currentTarget.getAttribute( 'data-campaign_id' );
		if ( ! campaignId ) {
			return;
		}

		fetchCampaignMetaData( campaignId )
			.then( ( data ) => {
				if ( data ) {
					setConfigureData(
						{
							...data,
							type: 'edit',
						}
					);
					setOpenDrawer( true );
				}
			} )
			.catch( ( error ) => {
				console.error( error );
			} );

		setOpeningConfigureDrawer( false );
	};

	const openCampaignAnalytics = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data
		const campaignData = campaigns[ campaignId ];

		// Open analytics modal
		setAnalyticsModal( {
			isOpen: true,
			campaignId,
			campaignData,
		} );
	};

	const viewCampaignPosts = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data to determine the post type
		const campaignData = campaigns[ campaignId ];
		const postType = campaignData?.postType || 'post'; // Default to 'post' if not found

		// Redirect to All Posts page with campaign filter
		const adminUrl = wpaib_localized_data.admin_url || '/wp-admin/';
		let filterUrl;

		// For 'post' type, we don't need to specify post_type parameter
		if ( postType === 'post' ) {
			filterUrl = `${ adminUrl }edit.php?wp_aib_campaign_id=${ campaignId }`;
		} else {
			filterUrl = `${ adminUrl }edit.php?post_type=${ postType }&wp_aib_campaign_id=${ campaignId }`;
		}

		window.open( filterUrl, '_blank' );
	};

	const openDeleteModal = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data
		const campaignData = campaigns[ campaignId ];

		// Open delete modal
		setDeleteModal( {
			isOpen: true,
			campaignId,
			campaignData,
		} );
	};

	const handleCampaignDeleted = () => {
		// Refresh the page or update the campaigns list
		// For now, we'll refresh the page to update the campaigns list
		window.location.reload();
	};

	if ( ! campaigns || Object.keys( campaigns ).length === 0 ) {
		return (
			<>
				<div className="flex flex-col items-center justify-center gap-y-3 border border-dashed border-gray-300 rounded-md p-6 max-w-lg mx-auto mt-20">
					<FolderPlus className="w-8 h-8 text-gray-400" />
					<h3 className="text-base font-semibold text-gray-900 m-0 p-0">
						{ __( 'No Campaigns.', 'wp-ai-blogger' ) }
					</h3>
					<p className="text-sm text-gray-500">
						{ __( 'Get Started by Creating a New Campaign.', 'wp-ai-blogger' ) }
					</p>
					<button
						type="button"
						className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer m-2 flex gap-x-2 items-center"
						onClick={ ( e ) => {
							e.preventDefault();
							setConfigureData( defaultMetaDefaults );
							setOpenDrawer( true );
						} }
					>
						{ __( 'Add New', 'wp-ai-blogger' ) }
					</button>
				</div>

				<ConfigureDrawer
					openDrawer={ openDrawer }
					setOpenDrawer={ setOpenDrawer }
					configureData={ configureData }
				/>

				<CampaignAnalyticsModal
					isOpen={ analyticsModal.isOpen }
					onClose={ () => setAnalyticsModal( { isOpen: false, campaignId: null, campaignData: null } ) }
					campaignId={ analyticsModal.campaignId }
					campaignData={ analyticsModal.campaignData }
				/>

				<DeleteCampaignModal
					isOpen={ deleteModal.isOpen }
					onClose={ () => setDeleteModal( { isOpen: false, campaignId: null, campaignData: null } ) }
					campaignId={ deleteModal.campaignId }
					onDeleted={ handleCampaignDeleted }
				/>
			</>
		);
	}

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
								setConfigureData( defaultMetaDefaults );
								setOpenDrawer( true );
							} }
						>
							{ __( 'Add New', 'wp-ai-blogger' ) }
						</button>
					</div>
				</div>

				{
					campaigns && Object.keys( campaigns ).length > 0 ? (
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
														{ __( 'Latest Post', 'wp-ai-blogger' ) }
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
												{ campaigns && Object.values( campaigns ).map( ( campaign ) => (
													<tr key={ campaign.name } className="even:bg-gray-50">
														<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
															{ campaign.name }
														</td>

														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
															<SwitchControl
																checked={ 'publish' === campaign.status }
																onChange={ () => {} }
															/>
														</td>

														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
															{ campaign.postsTarget }
														</td>

														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
															{ campaign.last_post_title && campaign.last_post_title.length > 0 ? (
																<Tooltip text={ campaign.last_post_title }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<span> { TrimWordsContent( campaign.last_post_title ) } </span>
																</Tooltip>
															) : (
																<span className="text-gray-500">{ __( 'No post created yet.', 'wp-ai-blogger' ) }</span>
															) }
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

															<a href="#" className="text-gray-500 hover:text-indigo-900" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																viewCampaignPosts( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Posts List', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<List className="w-4 h-4" />
																</Tooltip>
															</a>

															<a href="#" data-campaign_id={ campaign.id } className="text-gray-500 hover:text-indigo-900" onClick={ configureCampaign }>
																<Tooltip text={ __( 'Configure', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	{
																		openingConfigureDrawer ? (
																			<RotateCw className="w-4 h-4 animate-spin" />
																		) : (
																			<Settings className="w-4 h-4" />
																		)
																	}
																</Tooltip>
															</a>

															<a href="#" className="text-gray-500 hover:text-indigo-900" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																openCampaignAnalytics( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Analytics', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<ChartNoAxesColumn className="w-4 h-4" />
																</Tooltip>
															</a>

															<a href="#" className="text-gray-500 hover:text-indigo-900" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																openDeleteModal( e, campaign.id );
															} }>
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
					) : null
				}
			</div>

			<ConfigureDrawer
				openDrawer={ openDrawer }
				setOpenDrawer={ setOpenDrawer }
				configureData={ configureData }
			/>

			<CampaignAnalyticsModal
				isOpen={ analyticsModal.isOpen }
				onClose={ () => setAnalyticsModal( { isOpen: false, campaignId: null, campaignData: null } ) }
				campaignId={ analyticsModal.campaignId }
				campaignData={ analyticsModal.campaignData }
			/>

			<DeleteCampaignModal
				isOpen={ deleteModal.isOpen }
				onClose={ () => setDeleteModal( { isOpen: false, campaignId: null, campaignData: null } ) }
				campaignId={ deleteModal.campaignId }
				onDeleted={ handleCampaignDeleted }
			/>
		</>
	);
}
