import React, { useState, useMemo, useEffect, useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Settings, Trash2, Info, FolderPlus, RotateCw, List, ChartNoAxesColumn, CalendarArrowUp, ScrollText, ChevronDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
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
	const [ sortBy, setSortBy ] = useState( 'latest' ); // Default sort by latest
	const [ showSortDropdown, setShowSortDropdown ] = useState( false );
	const [ searchTerm, setSearchTerm ] = useState( '' ); // Search functionality
	const sortDropdownRef = useRef( null );

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( sortDropdownRef.current && ! sortDropdownRef.current.contains( event.target ) ) {
				setShowSortDropdown( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [] );

	// Sort campaigns based on selected criteria
	const sortedCampaigns = useMemo( () => {
		if ( ! campaigns ) return [];

		const campaignsArray = Object.values( campaigns );

		// First filter by search term
		const filteredCampaigns = campaignsArray.filter( campaign => {
			if ( ! searchTerm ) return true;

			const searchLower = searchTerm.toLowerCase();
			return (
				( campaign.name || '' ).toLowerCase().includes( searchLower ) ||
				( campaign.frequency || '' ).toLowerCase().includes( searchLower ) ||
				( campaign.last_post_title || '' ).toLowerCase().includes( searchLower )
			);
		} );

		// Then sort the filtered results
		return filteredCampaigns.sort( ( a, b ) => {
			switch ( sortBy ) {
				case 'active':
					// Active campaigns first (publish status)
					if ( a.status === 'publish' && b.status !== 'publish' ) return -1;
					if ( a.status !== 'publish' && b.status === 'publish' ) return 1;
					return 0;

				case 'inactive':
					// Inactive campaigns first (draft status)
					if ( a.status === 'draft' && b.status !== 'draft' ) return -1;
					if ( a.status !== 'draft' && b.status === 'draft' ) return 1;
					return 0;

				case 'name-asc':
					return ( a.name || '' ).localeCompare( b.name || '' );

				case 'name-desc':
					return ( b.name || '' ).localeCompare( a.name || '' );

				case 'start-date-asc':
					const startDateA = a.startDate ? new Date( a.startDate ) : new Date( a.created_at );
					const startDateB = b.startDate ? new Date( b.startDate ) : new Date( b.created_at );
					return startDateA - startDateB;

				case 'start-date-desc':
					const startDateDescA = a.startDate ? new Date( a.startDate ) : new Date( a.created_at );
					const startDateDescB = b.startDate ? new Date( b.startDate ) : new Date( b.created_at );
					return startDateDescB - startDateDescA;

				case 'end-date-asc':
					const endDateA = a.lastRun ? new Date( a.lastRun ) : new Date( 0 );
					const endDateB = b.lastRun ? new Date( b.lastRun ) : new Date( 0 );
					return endDateA - endDateB;

				case 'end-date-desc':
					const endDateDescA = a.lastRun ? new Date( a.lastRun ) : new Date( 0 );
					const endDateDescB = b.lastRun ? new Date( b.lastRun ) : new Date( 0 );
					return endDateDescB - endDateDescA;

				case 'latest':
				default:
					// Default: Latest campaigns first (by creation date)
					return new Date( b.created_at ) - new Date( a.created_at );
			}
		} );
	}, [ campaigns, sortBy, searchTerm ] );

	const sortOptions = [
		{ value: 'latest', label: __( 'Default', 'wp-ai-blogger' ) },
		{ value: 'active', label: __( 'Active First', 'wp-ai-blogger' ) },
		{ value: 'inactive', label: __( 'Inactive First', 'wp-ai-blogger' ) },
		{
			value: 'name-asc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Name', 'wp-ai-blogger' ) }
					<ArrowUp className="w-3 h-3" />
				</span>
			)
		},
		{
			value: 'name-desc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Name', 'wp-ai-blogger' ) }
					<ArrowDown className="w-3 h-3" />
				</span>
			)
		},
		{
			value: 'start-date-asc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Start Date', 'wp-ai-blogger' ) }
					<ArrowUp className="w-3 h-3" />
				</span>
			)
		},
		{
			value: 'start-date-desc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Start Date', 'wp-ai-blogger' ) }
					<ArrowDown className="w-3 h-3" />
				</span>
			)
		},
		{
			value: 'end-date-asc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Last Run', 'wp-ai-blogger' ) }
					<ArrowUp className="w-3 h-3" />
				</span>
			)
		},
		{
			value: 'end-date-desc',
			label: (
				<span className="flex items-center gap-2">
					{ __( 'Last Run', 'wp-ai-blogger' ) }
					<ArrowDown className="w-3 h-3" />
				</span>
			)
		},
	];

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
		e.stopPropagation();
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
		e.stopPropagation();

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
		e.stopPropagation();

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
		e.stopPropagation();

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
		e.stopPropagation();

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

					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
						{/* Sort Dropdown */}
						<div className="relative" ref={ sortDropdownRef }>
							<button
								type="button"
								onClick={ () => setShowSortDropdown( ! showSortDropdown ) }
								className="flex items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600 border-none cursor-pointer outline-none transition-all duration-200"
								style={{ height: '38px' }}
							>
								{ sortOptions.find( option => option.value === sortBy )?.label || __( 'Sort', 'wp-ai-blogger' ) }
								<ChevronDown className={ `w-4 h-4 transition-transform duration-200 ${ showSortDropdown ? 'rotate-180' : '' }` } />
							</button>

							{ showSortDropdown && (
								<div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="py-1">
										{ sortOptions.map( ( option ) => (
											<button
												key={ option.value }
												onClick={ () => {
													setSortBy( option.value );
													setShowSortDropdown( false );
												} }
												className={ `block w-full text-left px-4 py-2 text-sm transition-colors duration-200 border-none bg-transparent cursor-pointer ${
													sortBy === option.value
														? 'bg-indigo-50 text-indigo-700 font-medium'
														: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
												}` }
											>
												{ option.label }
											</button>
										) ) }
									</div>
								</div>
							) }
						</div>

						{/* Search Input */}
						<div className="relative min-w-[240px]">
							<div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: '12px' }}>
								<Search className="h-4 w-4 text-gray-400" />
							</div>
							<input
								type="text"
								value={ searchTerm }
								onChange={ ( e ) => setSearchTerm( e.target.value ) }
								placeholder={ __( 'Search campaigns...', 'wp-ai-blogger' ) }
								className="block w-full text-sm rounded-md bg-white placeholder-gray-400 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none transition-all duration-200"
								style={{
									height: '38px',
									paddingLeft: '40px',
									paddingRight: searchTerm ? '40px' : '12px'
								}}
							/>
							{ searchTerm && (
								<button
									type="button"
									onClick={ () => setSearchTerm( '' ) }
									className="absolute inset-y-0 right-0 flex items-center cursor-pointer border-none bg-transparent text-gray-400 hover:text-gray-600 transition-colors duration-200"
									style={{ paddingRight: '12px' }}
								>
									<X className="h-4 w-4" />
								</button>
							) }
						</div>

						<button
							type="button"
							className="flex items-center justify-center rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 border-none cursor-pointer outline-none transition-all duration-200"
							style={{ height: '38px' }}
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
														{ __( 'Results', 'wp-ai-blogger' ) }
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
												{ sortedCampaigns && sortedCampaigns.length > 0 ? (
													sortedCampaigns.map( ( campaign ) => (
														<tr key={ campaign.id } className="even:bg-gray-50">
															<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
																{ campaign.name }
															</td>

														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
															{(() => {
																// Use direct metadata fields instead of parsing
																const postsCreated = parseInt(campaign.postsCreated) || 0;
																const postsTarget = parseInt(campaign.postsTarget) || 0;
																const postsFailed = parseInt(campaign.postsFailed) || 0;

																// Calculate remaining posts that couldn't be generated
																const postsRemaining = Math.max(0, postsTarget - postsCreated);

																// Check if campaign is completed to show undelivered
																const isCompleted = campaign.status === 'draft' ||
																	(postsTarget > 0 && postsCreated >= postsTarget) ||
																	campaign.campaignCompleted === true;

																// Campaign should be disabled when:
																// 1. Success posts meet or exceed target, OR
																// 2. All attempts have been made AND undelivered posts are showing (meaning campaign is completed with failures), OR
																// 3. Campaign completion flag is set
																const isTargetMet = postsTarget > 0 && postsCreated >= postsTarget;
																const isAllAttemptsMadeWithFailures = postsTarget > 0 && postsRemaining > 0 && isCompleted && (postsCreated + postsRemaining) >= postsTarget;
																const isAllAttemptsCompleted = campaign.campaignCompleted === true;
																const shouldDisableSwitch = isTargetMet || isAllAttemptsMadeWithFailures || isAllAttemptsCompleted;
																const isUpdating = updatingStatus[ campaign.id ] || false;

																return (
																	<div className="relative">
																		<SwitchControl
																			checked={ 'publish' === campaign.status }
																			onChange={ () => toggleCampaignStatus( campaign.id, campaign.status ) }
																			disabled={ isUpdating || shouldDisableSwitch }
																			aria-label={ `${ __( 'Toggle campaign status for', 'wp-ai-blogger' ) } ${ campaign.name }` }
																		/>
																		{ shouldDisableSwitch && (
																			<Tooltip
																				text={__( 'Campaign completed.', 'wp-ai-blogger' )
																				}
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

														<td className="whitespace-nowrap px-3 py-4 text-sm">
															{(() => {
																// Use direct metadata fields for clean display
																const postsCreated = parseInt(campaign.postsCreated) || 0;
																const postsTarget = parseInt(campaign.postsTarget) || 0;
																const postsFailed = parseInt(campaign.postsFailed) || 0;

																// Calculate remaining posts that couldn't be generated
																// Remaining = Target - Successfully Created
																const postsRemaining = Math.max(0, postsTarget - postsCreated);

																// Check if campaign is completed (inactive, target met, or all attempts exhausted)
																const isCompleted = campaign.status === 'draft' ||
																	(postsTarget > 0 && postsCreated >= postsTarget) ||
																	campaign.campaignCompleted === true;

																return (
																	<div className="flex flex-col gap-1">
																		<div className="flex items-center gap-2">
																			<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
																				Success: { postsCreated }
																			</span>
																			{ postsRemaining > 0 && isCompleted && (
																				<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
																					Undelivered: { postsRemaining }
																				</span>
																			) }
																			<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																				Target: { postsTarget }
																			</span>
																		</div>
																	</div>
																);
															})()}
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
																	// Use direct metadata field to check if any posts have been created
																	const postsCreated = parseInt(campaign.postsCreated) || 0;

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

															{(() => {
																// Check if campaign is completed to enable/disable logs using direct metadata fields
																const postsCreated = parseInt(campaign.postsCreated) || 0;
																const postsTarget = parseInt(campaign.postsTarget) || 0;

																// Calculate remaining posts that couldn't be generated
																const postsRemaining = Math.max(0, postsTarget - postsCreated);

																// Campaign is completed if:
																// 1. Status is draft (inactive), OR
																// 2. Target is met (created >= target), OR
																// 3. All attempts completed (campaignCompleted flag is true), OR
																// 4. All attempts have been made AND undelivered posts are showing (meaning campaign is completed with failures)
																const isTargetMet = postsTarget > 0 && postsCreated >= postsTarget;
																const isAllAttemptsCompleted = campaign.campaignCompleted === true;
																const isCompletedBase = campaign.status === 'draft' || isTargetMet || isAllAttemptsCompleted;
																const isAllAttemptsMadeWithFailures = postsTarget > 0 && postsRemaining > 0 && isCompletedBase && (postsCreated + postsRemaining) >= postsTarget;
																const isCompleted = isCompletedBase || isAllAttemptsMadeWithFailures;

																const logsTooltipText = isCompleted
																	? __( 'View logs', 'wp-ai-blogger' )
																	: __( 'Logs available after campaign completion', 'wp-ai-blogger' );

																return (
																	<button
																		type="button"
																		className={ `focus:outline-none focus:ring-0 border-none bg-transparent p-0 m-0 ${
																			isCompleted
																				? 'text-gray-500 hover:text-indigo-900 cursor-pointer'
																				: 'text-gray-300 cursor-not-allowed'
																		}` }
																		data-campaign_id={ campaign.id }
																		onClick={ isCompleted ? ( e ) => {
																			e.preventDefault();
																			e.stopPropagation();
																			openCampaignLogs( e, campaign.id );
																		} : undefined }
																		disabled={ !isCompleted }
																	>
																		<Tooltip text={ logsTooltipText }
																			delay={ 100 }
																			className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
																		>
																			<ScrollText className="w-4 h-4" style={{ outline: 'none' }} tabIndex="-1" />
																		</Tooltip>
																	</button>
																);
															})()}

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
												) )
												) : (
													<tr>
														<td colSpan="6" className="py-12 text-center">
															<div className="flex flex-col items-center justify-center gap-y-3">
																<Search className="w-8 h-8 text-gray-400" />
																<h3 className="text-sm font-medium text-gray-900 m-0 p-0">
																	{ searchTerm
																		? __( 'No campaigns found', 'wp-ai-blogger' )
																		: __( 'No campaigns match your search', 'wp-ai-blogger' )
																	}
																</h3>
																<p className="text-sm text-gray-500 max-w-sm">
																	{ searchTerm
																		? sprintf( __( 'No campaigns match "%s".', 'wp-ai-blogger' ), searchTerm )
																		: __( 'Try different search terms or clear your search to see all campaigns.', 'wp-ai-blogger' )
																	}
																</p>
																{ searchTerm && (
																	<button
																		type="button"
																		onClick={ () => setSearchTerm( '' ) }
																		className="mt-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600 border-none cursor-pointer outline-none transition-all duration-200"
																	>
																		{ __( 'Clear search', 'wp-ai-blogger' ) }
																	</button>
																) }
															</div>
														</td>
													</tr>
												) }
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
