import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Settings, RotateCw, List, ChartNoAxesColumn, MoveRight, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@wordpress/components';
import { ConfigureDrawer } from '@Elements/Campaigns';
import CampaignAnalyticsModal from '@Components/CampaignAnalyticsModal';
import apiFetch from '@wordpress/api-fetch';

const campaigns = wpaib_localized_data.all_campaigns || {};

export default function CampaignsInsights() {
	const navigate = useNavigate();
	const licenseStatus = useSelector( ( state ) => state.licenseStatus ) || 'unlicensed';
	const defaultMetaDefaults = wpaib_localized_data.postmeta_defaults;

	const [ configureData, setConfigureData ] = useState( defaultMetaDefaults );
	const [ openDrawer, setOpenDrawer ] = useState( false );
	const [ openingConfigureDrawer, setOpeningConfigureDrawer ] = useState( false );
	const [ viewConfigureData, setViewConfigureData ] = useState( defaultMetaDefaults );
	const [ openViewDrawer, setOpenViewDrawer ] = useState( false );
	const [ openingViewDrawer, setOpeningViewDrawer ] = useState( false );
	const [ analyticsModal, setAnalyticsModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );

	const handlePersonaClick = ( event ) => {
		event.preventDefault(); // Prevent the default link behavior
		navigate( `?page=${ wpaib_localized_data.home_slug }&path=settings` ); // Navigate to the settings tab
	};

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

	const viewCampaignConfiguration = ( e ) => {
		e.preventDefault();
		setOpeningViewDrawer( true );

		const campaignId = e.currentTarget.getAttribute( 'data-campaign_id' );
		if ( ! campaignId ) {
			return;
		}

		fetchCampaignMetaData( campaignId )
			.then( ( data ) => {
				if ( data ) {
					setViewConfigureData(
						{
							...data,
							type: 'view',
						}
					);
					setOpenViewDrawer( true );
				}
			} )
			.catch( ( error ) => {
				console.error( error );
			} );

		setOpeningViewDrawer( false );
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

	if ( 'unlicensed' === licenseStatus ) {
		return (
			<div className="flex flex-col items-center justify-center gap-y-3 border border-dashed border-gray-300 rounded-md p-6 max-w-lg mx-auto mt-20">
				<Lock className="w-8 h-8 text-gray-400" />
				<h3 className="text-base font-semibold text-gray-900 m-0 p-0">
					{ __( 'License Required', 'wp-ai-blogger' ) }
				</h3>
				<p className="text-sm text-gray-500">
					{ __( 'Get Started by Activating Your License.', 'wp-ai-blogger' ) }
				</p>
				<button
					type="button"
					className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer m-2 flex gap-x-2 items-center"
					onClick={ handlePersonaClick }
				>
					{ __( 'Go to License Settings', 'wp-ai-blogger' ) }
					<MoveRight className="h-5 w-5" />
				</button>
			</div>
		);
	}

	if ( ! campaigns || Object.keys( campaigns ).length === 0 ) {
		return (
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				<h3 className="text-base font-semibold text-gray-900"> { __( 'Campaigns Insights', 'wp-ai-blogger' ) } </h3>
				<p className="mt-2 text-sm text-gray-500"> { __( 'No campaigns available at the moment.', 'wp-ai-blogger' ) } </p>
			</div>
		);
	}

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<h3 className="text-base font-semibold text-gray-900"> { __( 'Campaigns Insights', 'wp-ai-blogger' ) } </h3>

			<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{ Object.values( campaigns ).map( ( campaign ) => (
					<div
						key={ campaign.id }
						className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
					>
						<div className="campaigns-insight-wrap">
							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Posts', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.postsCreated }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Visits', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.postsVisit }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Last Run', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.lastRun }</div>
							</div>
						</div>

						<div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
							<div className="text-sm flex campaigns-center justify-between w-full">
								<a
									href="#"
									className="font-medium text-indigo-600 hover:text-indigo-700 wpaib-truncate"
									data-campaign_id={ campaign.id }
									onClick={ viewCampaignConfiguration }
								>
									<span>
										{ openingViewDrawer ? (
											<span className="flex items-center gap-1">
												<RotateCw className="w-3 h-3 animate-spin" />
												{ campaign.name }
											</span>
										) : (
											campaign.name
										) }
									</span>
								</a>
								<div className="flex items-center gap-x-3">
									<a href="#" className="text-gray-500 hover:text-indigo-900" data-campaign_id={ campaign.id } onClick={ ( e ) => {
										viewCampaignPosts( e, campaign.id );
									} }>
										<Tooltip text={ __( 'Posts List', 'wp-ai-blogger' ) }
											delay={ 100 }
											className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
										>
											<List className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
										</Tooltip>
									</a>

									<a href="#" data-campaign_id={ campaign.id } className="text-gray-500 hover:text-indigo-900" onClick={ configureCampaign }>
										<Tooltip text={ __( 'Configure', 'wp-ai-blogger' ) }
											delay={ 100 }
											className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
										>
											{
												openingConfigureDrawer ? (
													<RotateCw className="w-4 h-4 animate-spin text-indigo-600 hover:text-indigo-700" />
												) : (
													<Settings className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
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
											<ChartNoAxesColumn className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
										</Tooltip>
									</a>
								</div>
							</div>
						</div>
					</div>
				) ) }
			</dl>

			<ConfigureDrawer
				openDrawer={ openDrawer }
				setOpenDrawer={ setOpenDrawer }
				configureData={ configureData }
				mode="edit"
			/>

			<ConfigureDrawer
				openDrawer={ openViewDrawer }
				setOpenDrawer={ setOpenViewDrawer }
				configureData={ viewConfigureData }
				mode="view"
			/>

			<CampaignAnalyticsModal
				isOpen={ analyticsModal.isOpen }
				onClose={ () => setAnalyticsModal( { isOpen: false, campaignId: null, campaignData: null } ) }
				campaignId={ analyticsModal.campaignId }
				campaignData={ analyticsModal.campaignData }
			/>
		</div>
	);
}
