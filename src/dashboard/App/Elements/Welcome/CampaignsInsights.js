import React, { useMemo, useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { MoveRight, Lock, TrendingUp, Eye, Calendar, BarChart3, ExternalLink, CalendarCheck, ChartPie } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

			<div className={ `${ getOnlyDetails ? 'text-base' : 'text-xl' } font-bold text-gray-900` } aria-label={ `${ metric }: ${ value }` }>
				{ value }
				{ trend && (
					<div className={ `flex items-center gap-1 text-xs ${ trend > 0 ? 'text-green-600' : 'text-red-600' }` }>
						<TrendingUp className="w-3 h-3" aria-hidden="true" />
						<span>{ Math.abs( trend ) }%</span>
					</div>
				) }
			</div>
		</div>

		<div className="space-y-1">
			{ description && (
				<p className="text-xs text-gray-500">{ description }</p>
			) }
		</div>
	</div>
) );

MetricCard.displayName = 'CampaignMetricCard';

// Enhanced campaign card component with better UX.
const CampaignCard = memo( ( { campaign, onViewDetails } ) => {
	const handleKeyDown = useCallback( ( e ) => {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			onViewDetails( campaign );
		}
	}, [ campaign, onViewDetails ] );

	const isPerformant = ( campaign?.postsVisit || 0 ) > 100;

	return (
		<div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-solid border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group">
			{ /* Performance indicator */ }
			{ isPerformant && (
				<div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
					{ __( 'High performing', 'wp-ai-blogger' ) }
				</div>
			) }

			<div className="p-6">
				{ /* Campaign header */ }
				<div className="mb-4">
					<h4 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors p-0 m-0">
						{ campaign?.title || __( 'Unnamed Campaign', 'wp-ai-blogger' ) }
					</h4>
				</div>

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
			<div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
				<button
					type="button"
					onClick={ () => onViewDetails( campaign ) }
					onKeyDown={ handleKeyDown }
					className="w-full flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-0 bg-transparent transition-all duration-200"
					aria-label={ __( 'View details for campaign', 'wp-ai-blogger' ) }
				>
					<span>{ __( 'View Campaign Details', 'wp-ai-blogger' ) }</span>
					<MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
				</button>
			</div>
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
		<p className="text-gray-500 max-w-md mx-auto">
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

	// Enhanced navigation handlers
	const handleNavigateToLicense = useCallback( ( event ) => {
		event.preventDefault();
		try {
			navigate( `?page=${ homeSlug }&path=settings&tab=license` );
		} catch ( error ) {
			console.error( 'Navigation error:', error );
			onError?.( error, { component: 'CampaignsInsights', action: 'navigate_to_license' } );
		}
	}, [ navigate, onError, homeSlug ] );

	const handleViewCampaignDetails = useCallback( ( campaign ) => {
		try {
			navigate( `?page=${ homeSlug }&path=campaigns&id=${ campaign.id }` );
		} catch ( error ) {
			console.error( 'Navigation error:', error );
			onError?.( error, { component: 'CampaignsInsights', action: 'view_campaign_details' } );
		}
	}, [ navigate, onError, homeSlug ] );

	// License check
	if ( licenseStatus !== 'licensed' ) {
		return <LicenseRequiredState onNavigateToLicense={ handleNavigateToLicense } />;
	}

	// Empty state
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
			{ /* Enhanced header with summary stats */ }
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 id="campaigns-insights-heading" className="text-xl font-bold text-gray-900 p-0 m-0">
							{ __( 'Overall Metrics', 'wp-ai-blogger' ) }
						</h2>
					</div>

					{ campaignsData.activeCampaigns > 0 && (
						<div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
							<TrendingUp className="w-4 h-4" aria-hidden="true" />
							<span>{ campaignsData.activeCampaigns } { __( 'active', 'wp-ai-blogger' ) }</span>
						</div>
					) }
				</div>

				{ /* Summary metrics */ }
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
					<MetricCard
						metric={ __( 'Total Posts', 'wp-ai-blogger' ) }
						value={ campaignsData.totalPosts.toLocaleString() }
						icon={ BarChart3 }
						className="bg-blue-50 border-blue-200"
					/>
					<MetricCard
						metric={ __( 'Total Visits', 'wp-ai-blogger' ) }
						value={ campaignsData.totalVisits.toLocaleString() }
						icon={ Eye }
						className="bg-green-50 border-green-200"
					/>
					<MetricCard
						metric={ __( 'Active Campaigns', 'wp-ai-blogger' ) }
						value={ `${ campaignsData.activeCampaigns }/${ campaignsData.totalCampaigns }` }
						icon={ CalendarCheck }
						className="bg-purple-50 border-purple-200"
					/>
					<MetricCard
						metric={ __( 'Analytics', 'wp-ai-blogger' ) }
						value={ `${ campaignsData.activeCampaigns }/${ campaignsData.totalCampaigns }` }
						icon={ ChartPie }
						className="bg-purple-50 border-purple-200"
					/>
				</div>
			</div>

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
							onViewDetails={ handleViewCampaignDetails }
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
