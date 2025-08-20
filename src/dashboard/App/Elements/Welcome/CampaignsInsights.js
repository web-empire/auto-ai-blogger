import React, { useMemo, useCallback, memo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Lock, TrendingUp, Eye, Calendar, BarChart3, ExternalLink, ChartNoAxesColumn, RotateCw, Settings, List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import { ConfigureDrawer } from '@Elements/Campaigns';
import CampaignAnalyticsModal from '@Components/CampaignAnalyticsModal';
import { Tooltip } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

// Enhanced metric card component with animations and accessibility.
const MetricCard = memo( ( { metric, value, description, icon: Icon, trend, className = '', getOnlyDetails = false } ) => (
	<div className={ `${ getOnlyDetails ? '' : 'bg-white rounded-lg p-4 border border-solid border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-lg' } ${ className }` }>
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				{
					! getOnlyDetails && (
						<div className={ `${ getOnlyDetails ? '' : 'p-2 bg-indigo-50 rounded-lg' }` }>
							<Icon className="w-4 h-4 text-indigo-600 flex" aria-hidden="true" />
						</div>
					)
				}
				<span className="text-sm font-medium text-gray-600">{ metric }</span>
			</div>

			<div className={ `${ getOnlyDetails ? 'text-base' : 'text-xl' } font-medium text-gray-900` } aria-label={ `${ metric }: ${ value }` }>
				{ value }
				{ trend && (
					<div className={ `flex items-center gap-1 text-xs ${ trend > 0 ? 'text-green-600' : 'text-red-600' }` }>
						<TrendingUp className="w-3 h-3" aria-hidden="true" />
						<span>{ Math.abs( trend ) }%</span>
					</div>
				) }
			</div>
		</div>

		{ description && (
			<div className="space-y-1">
				<p className="text-xs text-gray-500">{ description }</p>
			</div>
		) }
	</div>
) );

MetricCard.displayName = 'CampaignMetricCard';

// Enhanced campaign card component with better UX.
const CampaignCard = memo( ( { campaign } ) => {
	const defaultMetaDefaults = wpaib_localized_data.postmeta_defaults;

	const campaigns = useSelector( ( state ) => state.allCampaigns ) || {};
	const isPerformant = ( campaign?.postsVisit || 0 ) > 100;
	const [ openingConfigureDrawer, setOpeningConfigureDrawer ] = useState( false );
	const [ analyticsModal, setAnalyticsModal ] = useState( { isOpen: false, campaignId: null, campaignData: null } );
	const [ viewConfigureData, setViewConfigureData ] = useState( defaultMetaDefaults );
	const [ openViewDrawer, setOpenViewDrawer ] = useState( false );
	const [ openDrawer, setOpenDrawer ] = useState( false );
	const [ configureData, setConfigureData ] = useState( defaultMetaDefaults );

	const viewCampaignConfiguration = ( e ) => {
		e.preventDefault();

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

	const viewCampaignPosts = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data to determine the post type
		const campaignData = campaigns[ campaignId ];
		const postType = campaignData?.postType || 'post'; // Default to 'post' if not found.

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

	const openCampaignAnalytics = ( e, campaignId ) => {
		e.preventDefault();

		// Get the campaign data.
		const campaignData = campaigns[ campaignId ];

		// Open analytics modal.
		setAnalyticsModal( {
			isOpen: true,
			campaignId,
			campaignData,
		} );
	};

	return (
		<div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-solid border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group">
			{ /* Performance indicator */ }
			{ isPerformant && (
				<div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
					{ __( 'High performing', 'wp-ai-blogger' ) }
				</div>
			) }

			<div className="p-4">
				{ /* Metrics grid */ }
				<div className="flex flex-col gap-2">
					<MetricCard
						metric={ __( 'Posts', 'wp-ai-blogger' ) }
						value={ campaign?.postsCreated || '0' }
						icon={ BarChart3 }
						getOnlyDetails={ true }
					/>
					<MetricCard
						metric={ __( 'Visits', 'wp-ai-blogger' ) }
						value={ campaign?.postsVisit || '0' }
						icon={ Eye }
						trend={ campaign?.visitTrend }
						getOnlyDetails={ true }
					/>
					<MetricCard
						metric={ __( 'Last Run', 'wp-ai-blogger' ) }
						value={ campaign?.lastRun || __( 'Never', 'wp-ai-blogger' ) }
						icon={ Calendar }
						getOnlyDetails={ true }
					/>
				</div>
			</div>

			{ /* Enhanced footer with action */ }
			<div className="bg-gray-50 p-4 border-t border-gray-100 w-full flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition-all duration-200" onClick={ viewCampaignConfiguration }>
				<TrimWordsContent
					content={ campaign?.title || __( 'Unnamed Campaign', 'wp-ai-blogger' ) }
					count={ 5 }
				/>

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
} );

CampaignCard.displayName = 'CampaignInsightCard';

// Enhanced license required component
const LicenseRequiredState = memo( ( { onNavigateToLicense } ) => (
	<div className="flex flex-col items-center justify-center gap-6 border-2 border-dashed border-orange-300 rounded-xl p-8 max-w-lg mx-auto mt-12 bg-orange-50 hover:bg-orange-100 transition-colors">
		<div className="p-4 bg-orange-100 rounded-full">
			<Lock className="w-8 h-8 text-orange-600" aria-hidden="true" />
		</div>

		<div className="text-center space-y-2">
			<h3 className="text-xl font-semibold text-orange-900">
				{ __( 'License Required', 'wp-ai-blogger' ) }
			</h3>
			<p className="text-orange-700 max-w-md">
				{ __( 'Activate your license to access campaign insights and performance analytics.', 'wp-ai-blogger' ) }
			</p>
		</div>

		<button
			type="button"
			onClick={ onNavigateToLicense }
			className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
			aria-label={ __( 'Navigate to license settings', 'wp-ai-blogger' ) }
		>
			{ __( 'Activate License', 'wp-ai-blogger' ) }
			<ExternalLink className="w-4 h-4" aria-hidden="true" />
		</button>
	</div>
) );

LicenseRequiredState.displayName = 'CampaignsLicenseRequiredState';

// Enhanced empty state component
const EmptyState = memo( () => (
	<div className="text-center py-12">
		<div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
			<BarChart3 className="w-8 h-8 text-gray-400" aria-hidden="true" />
		</div>
		<h3 className="text-lg font-medium text-gray-900 mb-2">
			{ __( 'No Campaign Data Available', 'wp-ai-blogger' ) }
		</h3>
		<p className="text-gray-500 max-w-md !m-auto">
			{ __( 'Campaign insights will appear here once you create and run your first campaign.', 'wp-ai-blogger' ) }
		</p>
	</div>
) );

EmptyState.displayName = 'CampaignsEmptyState';

// Main component with enhanced features
function CampaignsInsights( { onError } ) {
	const navigate = useNavigate();
	const licenseStatus = useSelector( ( state ) => state.license_status ) || 'unlicensed';
	const allCampaigns = useSelector( ( state ) => state.allCampaigns ) || {};
	const homeSlug = useSelector( ( state ) => state.homeSlug ) || 'wp-ai-blogger';

	// Memoized campaigns data with enhancements
	const campaignsData = useMemo( () => {
		const campaigns = allCampaigns;

		if ( ! campaigns || typeof campaigns !== 'object' ) {
			return { campaigns: [], totalCampaigns: 0, activeCampaigns: 0, totalPosts: 0, totalVisits: 0 };
		}

		const campaignArray = Object.values( campaigns );
		const activeCampaigns = campaignArray.filter( ( c ) => c.status === 'active' ).length;
		const totalPosts = campaignArray.reduce( ( sum, c ) => sum + ( parseInt( c.postsCreated ) || 0 ), 0 );
		const totalVisits = campaignArray.reduce( ( sum, c ) => sum + ( parseInt( c.postsVisit ) || 0 ), 0 );

		return {
			campaigns: campaignArray,
			totalCampaigns: campaignArray.length,
			activeCampaigns,
			totalPosts,
			totalVisits,
		};
	}, [ allCampaigns ] );

	// Enhanced navigation handlers.
	const handleNavigateToLicense = useCallback( ( event ) => {
		event.preventDefault();
		try {
			navigate( `?page=${ homeSlug }&path=settings&tab=license` );
		} catch ( error ) {
			console.error( 'Navigation error:', error );
			onError?.( error, { component: 'CampaignsInsights', action: 'navigate_to_license' } );
		}
	}, [ navigate, onError, homeSlug ] );

	// License check.
	if ( licenseStatus !== 'licensed' ) {
		return <LicenseRequiredState onNavigateToLicense={ handleNavigateToLicense } />;
	}

	// Empty state.
	if ( ! campaignsData.campaigns || campaignsData.campaigns.length === 0 ) {
		return (
			<section
				className="px-4 sm:px-6 lg:px-8 pb-8 pt-0"
				aria-labelledby="campaigns-insights-heading"
			>
				<div className="mb-6">
					<h2 id="campaigns-insights-heading" className="text-xl font-bold text-gray-900 p-0 m-0">
						{ __( 'Campaigns Insights', 'wp-ai-blogger' ) }
					</h2>
					<p className="text-gray-600 mt-1">
						{ __( 'Monitor your campaign performance and analytics.', 'wp-ai-blogger' ) }
					</p>
				</div>
				<EmptyState />
			</section>
		);
	}

	return (
		<section
			className="px-4 sm:px-6 lg:px-8 py-8"
			aria-labelledby="campaigns-insights-heading"
		>
			{ /* Enhanced campaigns grid */ }
			<h2 id="campaigns-insights-heading" className="text-xl font-bold text-gray-900 p-0 m-0">
				{ __( 'Campaigns Insights', 'wp-ai-blogger' ) }
			</h2>
			<div
				className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
				role="region"
				aria-label={ __( 'Campaigns list', 'wp-ai-blogger' ) }
			>
				{ campaignsData?.campaigns && Array.isArray( campaignsData.campaigns ) && campaignsData.campaigns.length > 0 ? (
					campaignsData.campaigns.map( ( campaign, index ) => (
						<CampaignCard
							key={ campaign?.id || `campaign-${ index }` }
							campaign={ campaign }
						/>
					) )
				) : (
					<div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
						<BarChart3 className="w-12 h-12 mb-4 text-gray-300" />
						<p className="text-lg font-medium mb-2">
							{ __( 'No campaigns found', 'wp-ai-blogger' ) }
						</p>
						<p className="text-sm">
							{ __( 'Create your first campaign to start generating content automatically.', 'wp-ai-blogger' ) }
						</p>
					</div>
				) }
			</div>
		</section>
	);
}

// Add display name for debugging
CampaignsInsights.displayName = 'CampaignsInsights';

export default memo( CampaignsInsights );
