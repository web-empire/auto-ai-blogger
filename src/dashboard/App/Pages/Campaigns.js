import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Settings, Trash2, Info, FolderPlus, RotateCw, List, ChartNoAxesColumn, CalendarArrowUp, ScrollText } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import SwitchControl from '@Components/SwitchControl';
import { ConfigureDrawer } from '@Elements/Campaigns';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import CampaignAnalyticsModal from '@Components/CampaignAnalyticsModal';
import CampaignLogsModal from '@Components/CampaignLogsModal';
import CampaignDeleteModal from '@Components/CampaignDeleteModal';
import apiFetch from '@wordpress/api-fetch';

export default function Campaigns() {
	const initialCampaigns = wpaib_localized_data.all_campaigns;
	const defaultMetaDefaults = wpaib_localized_data.postmeta_defaults;
	const isTestingMode = wpaib_localized_data.campaign_testing_mode || false;

	const [ campaigns, setCampaigns ] = useState( initialCampaigns ); // Make campaigns stateful
	const [ configureData, setConfigureData ] = useState( defaultMetaDefaults );
	const [ openDrawer, setOpenDrawer ] = useState( false );
	const [ openingConfigureDrawer, setOpeningConfigureDrawer ] = useState( false );
	const [ analyticsModal, setAnalyticsModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );
	const [ logsModal, setLogsModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );
	const [ deleteModal, setDeleteModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );
	const [ updatingStatus, setUpdatingStatus ] = useState( {} ); // Track which campaigns are being updated

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
					return data.data.data;
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

	const openCampaignLogs = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data
		const campaignData = campaigns[ campaignId ];

		// Open logs modal
		setLogsModal( {
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

	const toggleCampaignStatus = async ( campaignId, currentStatus ) => {
		// Prevent multiple simultaneous requests
		if ( updatingStatus[ campaignId ] ) {
			return;
		}

		setUpdatingStatus( prev => ({ ...prev, [ campaignId ]: true }) );

		try {
			const newStatus = currentStatus === 'publish' ? 'draft' : 'publish';

			// Get current campaign data
			const campaignData = campaigns[ campaignId ];

			// Prepare the update data with the new status
			const updateData = {
				...campaignData,
				id: campaignId,
				status: newStatus,
				type: 'edit'
			};

			const formData = new window.FormData();
			formData.append( 'action', 'wpaib_update_campaign' );
			formData.append( 'security', wpaib_localized_data.admin_nonce );
			formData.append( 'value', JSON.stringify( updateData ) );

			const response = await apiFetch( {
				url: wpaib_localized_data.ajax_url,
				method: 'POST',
				body: formData,
			} );

			if ( response.success ) {
				// Update the local campaigns state without page refresh
				setCampaigns( prevCampaigns => ({
					...prevCampaigns,
					[ campaignId ]: {
						...prevCampaigns[ campaignId ],
						status: newStatus
					}
				}) );
			} else {
				console.error( 'Failed to update campaign status:', response );
				// Optionally show an error message to the user
			}
		} catch ( error ) {
			console.error( 'Error updating campaign status:', error );
		} finally {
			setUpdatingStatus( prev => ({ ...prev, [ campaignId ]: false }) );
		}
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

				<CampaignLogsModal
					isOpen={ logsModal.isOpen }
					onClose={ () => setLogsModal( { isOpen: false, campaignId: null, campaignData: null } ) }
					campaignId={ logsModal.campaignId }
					campaignData={ logsModal.campaignData }
				/>

				<CampaignDeleteModal
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
			{ isTestingMode && (
				<div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-md mx-4 mt-4 mb-2">
					<div className="flex items-center gap-2">
						<Info className="w-5 h-5" />
						<div>
							<h4 className="font-semibold text-sm m-0">{ __( '🧪 Campaign Testing Mode Active', 'wp-ai-blogger' ) }</h4>
							<p className="text-xs mt-1 mb-0">
								{ __( 'Intervals are accelerated for testing: Daily = 1min, Weekly = 2min. Remember to disable testing mode in production!', 'wp-ai-blogger' ) }
							</p>
						</div>
					</div>
				</div>
			) }

			<div className="sm:px-6 lg:px-8 py-8 px-4">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<h2 id="free-vs-pro-heading" className="text-xl font-bold text-gray-900 p-0 m-0">
							{ __( 'Manage Campaigns', 'wp-ai-blogger' ) }
						</h2>
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
														{ __( 'Created (Scheduled)/Target', 'wp-ai-blogger' ) }
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
															{(() => {
																// Parse posts from postsTarget string
																// Formats: "created / target" or "created (scheduled) / target"
																const postsTargetParts = campaign.postsTarget ? campaign.postsTarget.toString().split(' / ') : ['0', '0'];
																const leftPart = postsTargetParts[0] || '0';
																const postsTarget = parseInt(postsTargetParts[1]) || 0;

																// Check if there's a scheduled count in parentheses
																let postsCreated = 0;
																let postsScheduled = 0;

																if (leftPart.includes('(')) {
																	// Format: "created (scheduled)"
																	const createdMatch = leftPart.match(/^(\d+)\s*\((\d+)\)$/);
																	if (createdMatch) {
																		postsCreated = parseInt(createdMatch[1]) || 0;
																		postsScheduled = parseInt(createdMatch[2]) || 0;
																	}
																} else {
																	// Format: "created" (no scheduled count shown)
																	postsCreated = parseInt(leftPart) || 0;
																	postsScheduled = postsCreated; // Assume same if not shown separately
																}

																const isTargetMet = postsTarget > 0 && postsScheduled >= postsTarget;
																const isUpdating = updatingStatus[ campaign.id ] || false;

																return (
																	<div className="relative">
																		<SwitchControl
																			checked={ 'publish' === campaign.status }
																			onChange={ () => toggleCampaignStatus( campaign.id, campaign.status ) }
																			disabled={ isUpdating || isTargetMet }
																			aria-label={ `${ __( 'Toggle campaign status for', 'wp-ai-blogger' ) } ${ campaign.name }` }
																		/>
																		{ isTargetMet && (
																			<Tooltip
																				text={ __( 'Campaign completed - All posts have been scheduled.', 'wp-ai-blogger' ) }
																				delay={ 100 }
																				className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																			>
																				<div className="absolute inset-0 cursor-help"></div>
																			</Tooltip>
																		) }
																	</div>
																);
															})()}
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
																	<TrimWordsContent content={ campaign.last_post_title } count={ 5 } />
																</Tooltip>
															) : (
																<span className="text-gray-500">{ __( 'No post created yet.', 'wp-ai-blogger' ) }</span>
															) }
														</td>

														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
															{ campaign.frequency }
														</td>

														<td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 flex gap-x-4 items-center">
															<button type="button" className={ `focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer ${
																campaign.startDate && campaign.startDate.trim() !== ''
																	? 'text-gray-500 hover:text-indigo-900'
																	: 'text-amber-500 hover:text-amber-600'
															}` }>
																<Tooltip text={ `${ __( 'Start Date', 'wp-ai-blogger' ) }: ${
																	campaign.startDate && campaign.startDate.trim() !== ''
																		? new Date( campaign.startDate ).toLocaleString()
																		: __( 'Not configured - Click Configure to set start date. Currently using creation date', 'wp-ai-blogger' ) + ': ' + new Date( campaign.created_at ).toLocaleString()
																}` }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<CalendarArrowUp className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>

															<button type="button" className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer">
																<Tooltip text={ (() => {
																	// Parse posts from postsTarget string to check if any posts have been created
																	const postsTargetParts = campaign.postsTarget ? campaign.postsTarget.toString().split(' / ') : ['0', '0'];
																	const leftPart = postsTargetParts[0] || '0';

																	let postsCreated = 0;
																	if (leftPart.includes('(')) {
																		// Format: "created (scheduled)"
																		const createdMatch = leftPart.match(/^(\d+)\s*\((\d+)\)$/);
																		if (createdMatch) {
																			postsCreated = parseInt(createdMatch[1]) || 0;
																		}
																	} else {
																		// Format: "created" (no scheduled count shown)
																		postsCreated = parseInt(leftPart) || 0;
																	}

																	// Show appropriate message based on posts created
																	if (postsCreated === 0) {
																		return __( 'Not yet started - No posts created', 'wp-ai-blogger' );
																	} else {
																		return `${ __( 'Last Post Run', 'wp-ai-blogger' ) }: ${ campaign.lastRun }`;
																	}
																})() }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<Info className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>

															<button type="button" className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																viewCampaignPosts( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Posts List', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<List className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>

															<button type="button" data-campaign_id={ campaign.id } className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer" onClick={ configureCampaign }>
																<Tooltip text={ __( 'Configure', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	{
																		openingConfigureDrawer ? (
																			<RotateCw className="w-4 h-4 animate-spin" style={{ outline: 'none' }} tabIndex="-1" />
																		) : (
																			<Settings className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																		)
																	}
																</Tooltip>
															</button>

															<button type="button" className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																openCampaignAnalytics( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Analytics', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<ChartNoAxesColumn className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>

															<button type="button" className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																openCampaignLogs( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Logs', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<ScrollText className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>

															<button type="button" className="text-gray-500 hover:text-indigo-900 focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 cursor-pointer" data-campaign_id={ campaign.id } onClick={ ( e ) => {
																openDeleteModal( e, campaign.id );
															} }>
																<Tooltip text={ __( 'Delete', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																>
																	<Trash2 className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																</Tooltip>
															</button>
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

			<CampaignLogsModal
				isOpen={ logsModal.isOpen }
				onClose={ () => setLogsModal( { isOpen: false, campaignId: null, campaignData: null } ) }
				campaignId={ logsModal.campaignId }
				campaignData={ logsModal.campaignData }
			/>

			<CampaignDeleteModal
				isOpen={ deleteModal.isOpen }
				onClose={ () => setDeleteModal( { isOpen: false, campaignId: null, campaignData: null } ) }
				campaignId={ deleteModal.campaignId }
				onDeleted={ handleCampaignDeleted }
			/>
		</>
	);
}
