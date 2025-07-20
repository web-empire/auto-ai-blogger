import React, { useMemo, useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { MoveRight, Lock, TrendingUp, Eye, Calendar, BarChart3, ExternalLink, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Enhanced metric card component with animations and accessibility
const MetricCard = memo(({ metric, value, description, icon: Icon, trend, className = "" }) => (
	<div className={`bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md ${className}`}>
		<div className="flex items-center justify-between mb-2">
			<div className="flex items-center gap-2">
				<div className="p-2 bg-indigo-50 rounded-lg">
					<Icon className="w-4 h-4 text-indigo-600" aria-hidden="true" />
				</div>
				<span className="text-sm font-medium text-gray-600">{metric}</span>
			</div>
			{trend && (
				<div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
					<TrendingUp className="w-3 h-3" aria-hidden="true" />
					<span>{Math.abs(trend)}%</span>
				</div>
			)}
		</div>
		<div className="space-y-1">
			<div className="text-2xl font-bold text-gray-900" aria-label={`${metric}: ${value}`}>
				{value}
			</div>
			{description && (
				<p className="text-xs text-gray-500">{description}</p>
			)}
		</div>
	</div>
));

MetricCard.displayName = 'CampaignMetricCard';

// Enhanced campaign card component with better UX
const CampaignCard = memo(({ campaign, onViewDetails }) => {
	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onViewDetails(campaign);
		}
	}, [campaign, onViewDetails]);

	const statusColor = campaign?.status === 'active' ? 'text-green-600' : 'text-gray-500';
	const isPerformant = (campaign?.postsVisit || 0) > 100;

	return (
		<div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group">
			{/* Performance indicator */}
			{isPerformant && (
				<div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
					{__('High performing', 'wp-ai-blogger')}
				</div>
			)}

			<div className="p-6">
				{/* Campaign header */}
				<div className="mb-4">
					<h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
						{campaign?.name || __('Unnamed Campaign', 'wp-ai-blogger')}
					</h4>
					<span className={`text-sm font-medium ${statusColor}`}>
						{campaign?.status === 'active' ? __('Active', 'wp-ai-blogger') : __('Inactive', 'wp-ai-blogger')}
					</span>
				</div>

				{/* Metrics grid */}
				<div className="grid grid-cols-3 gap-4 mb-6">
					<MetricCard
						metric={__('Posts', 'wp-ai-blogger')}
						value={campaign?.postsCreated || '0'}
						icon={BarChart3}
						className="bg-blue-50 border-blue-200"
					/>
					<MetricCard
						metric={__('Visits', 'wp-ai-blogger')}
						value={campaign?.postsVisit || '0'}
						icon={Eye}
						trend={campaign?.visitTrend}
						className="bg-green-50 border-green-200"
					/>
					<MetricCard
						metric={__('Last Run', 'wp-ai-blogger')}
						value={campaign?.lastRun || __('Never', 'wp-ai-blogger')}
						icon={Calendar}
						className="bg-purple-50 border-purple-200"
					/>
				</div>
			</div>

			{/* Enhanced footer with action */}
			<div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
				<button
					type="button"
					onClick={() => onViewDetails(campaign)}
					onKeyDown={handleKeyDown}
					className="w-full flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-2 hover:bg-indigo-50 transition-all duration-200"
					aria-label={__(`View details for ${campaign.name}`, 'wp-ai-blogger')}
				>
					<span>{__('View Campaign Details', 'wp-ai-blogger')}</span>
					<MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
});

CampaignCard.displayName = 'CampaignInsightCard';

// Enhanced license required component
const LicenseRequiredState = memo(({ onNavigateToLicense }) => (
	<div className="flex flex-col items-center justify-center gap-6 border-2 border-dashed border-orange-300 rounded-xl p-8 max-w-lg mx-auto mt-12 bg-orange-50 hover:bg-orange-100 transition-colors">
		<div className="p-4 bg-orange-100 rounded-full">
			<Lock className="w-8 h-8 text-orange-600" aria-hidden="true" />
		</div>

		<div className="text-center space-y-2">
			<h3 className="text-xl font-semibold text-orange-900">
				{__('License Required', 'wp-ai-blogger')}
			</h3>
			<p className="text-orange-700 max-w-md">
				{__('Activate your license to access campaign insights and performance analytics.', 'wp-ai-blogger')}
			</p>
		</div>

		<button
			type="button"
			onClick={onNavigateToLicense}
			className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
			aria-label={__('Navigate to license settings', 'wp-ai-blogger')}
		>
			{__('Activate License', 'wp-ai-blogger')}
			<ExternalLink className="w-4 h-4" aria-hidden="true" />
		</button>
	</div>
));

LicenseRequiredState.displayName = 'CampaignsLicenseRequiredState';

// Enhanced empty state component
const EmptyState = memo(() => (
	<div className="text-center py-12">
		<div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
			<BarChart3 className="w-8 h-8 text-gray-400" aria-hidden="true" />
		</div>
		<h3 className="text-lg font-medium text-gray-900 mb-2">
			{__('No Campaign Data Available', 'wp-ai-blogger')}
		</h3>
		<p className="text-gray-500 max-w-md mx-auto">
			{__('Campaign insights will appear here once you create and run your first campaign.', 'wp-ai-blogger')}
		</p>
	</div>
));

EmptyState.displayName = 'CampaignsEmptyState';

// Main component with enhanced features
function CampaignsInsights({ onError }) {
	const navigate = useNavigate();
	const licenseStatus = useSelector((state) => state.licenseStatus) || 'unlicensed';

	// Memoized campaigns data with enhancements
	const campaignsData = useMemo(() => {
		const campaigns = (typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.all_campaigns) || {};

		if (!campaigns || typeof campaigns !== 'object') {
			return { campaigns: [], totalCampaigns: 0, activeCampaigns: 0, totalPosts: 0, totalVisits: 0 };
		}

		const campaignArray = Object.values(campaigns);
		const activeCampaigns = campaignArray.filter(c => c.status === 'active').length;
		const totalPosts = campaignArray.reduce((sum, c) => sum + (parseInt(c.postsCreated) || 0), 0);
		const totalVisits = campaignArray.reduce((sum, c) => sum + (parseInt(c.postsVisit) || 0), 0);

		return {
			campaigns: campaignArray,
			totalCampaigns: campaignArray.length,
			activeCampaigns,
			totalPosts,
			totalVisits
		};
	}, []);

	// Enhanced navigation handlers
	const handleNavigateToLicense = useCallback((event) => {
		event.preventDefault();
		try {
			navigate(`?page=${(typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.home_slug) || 'wp-ai-blogger'}&path=settings&tab=license`);
		} catch (error) {
			console.error('Navigation error:', error);
			onError?.(error, { component: 'CampaignsInsights', action: 'navigate_to_license' });
		}
	}, [navigate, onError]);

	const handleViewCampaignDetails = useCallback((campaign) => {
		try {
			navigate(`?page=${(typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.home_slug) || 'wp-ai-blogger'}&path=campaigns&id=${campaign.id}`);
		} catch (error) {
			console.error('Navigation error:', error);
			onError?.(error, { component: 'CampaignsInsights', action: 'view_campaign_details' });
		}
	}, [navigate, onError]);

	// License check
	if (licenseStatus === 'unlicensed') {
		return <LicenseRequiredState onNavigateToLicense={handleNavigateToLicense} />;
	}

	// Empty state
	if (!campaignsData.campaigns || campaignsData.campaigns.length === 0) {
		return (
			<section
				className="px-4 sm:px-6 lg:px-8 py-8"
				aria-labelledby="campaigns-insights-heading"
			>
				<div className="mb-6">
					<h2 id="campaigns-insights-heading" className="text-xl font-bold text-gray-900">
						{__('Campaigns Insights', 'wp-ai-blogger')}
					</h2>
					<p className="text-gray-600 mt-1">
						{__('Monitor your campaign performance and analytics.', 'wp-ai-blogger')}
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
			{/* Enhanced header with summary stats */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 id="campaigns-insights-heading" className="text-xl font-bold text-gray-900">
							{__('Campaigns Insights', 'wp-ai-blogger')}
						</h2>
						<p className="text-gray-600 mt-1">
							{__(`Overview of your ${campaignsData.totalCampaigns} campaigns`, 'wp-ai-blogger')}
						</p>
					</div>
					{campaignsData.activeCampaigns > 0 && (
						<div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
							<TrendingUp className="w-4 h-4" aria-hidden="true" />
							<span>{campaignsData.activeCampaigns} {__('active', 'wp-ai-blogger')}</span>
						</div>
					)}
				</div>

				{/* Summary metrics */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<MetricCard
						metric={__('Total Posts Created', 'wp-ai-blogger')}
						value={campaignsData.totalPosts.toLocaleString()}
						description={__('Across all campaigns', 'wp-ai-blogger')}
						icon={BarChart3}
						className="bg-blue-50 border-blue-200"
					/>
					<MetricCard
						metric={__('Total Visits', 'wp-ai-blogger')}
						value={campaignsData.totalVisits.toLocaleString()}
						description={__('Combined traffic', 'wp-ai-blogger')}
						icon={Eye}
						className="bg-green-50 border-green-200"
					/>
					<MetricCard
						metric={__('Active Campaigns', 'wp-ai-blogger')}
						value={`${campaignsData.activeCampaigns}/${campaignsData.totalCampaigns}`}
						description={__('Currently running', 'wp-ai-blogger')}
						icon={TrendingUp}
						className="bg-purple-50 border-purple-200"
					/>
				</div>
			</div>

			{/* Enhanced campaigns grid */}
			<div
				className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
				role="region"
				aria-label={__('Campaigns list', 'wp-ai-blogger')}
			>
				{campaignsData?.campaigns && Array.isArray(campaignsData.campaigns) && campaignsData.campaigns.length > 0 ? (
					campaignsData.campaigns.map((campaign, index) => (
						<CampaignCard
							key={campaign?.id || `campaign-${index}`}
							campaign={campaign}
							onViewDetails={handleViewCampaignDetails}
						/>
					))
				) : (
					<div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
						<BarChart3 className="w-12 h-12 mb-4 text-gray-300" />
						<p className="text-lg font-medium mb-2">
							{__('No campaigns found', 'wp-ai-blogger')}
						</p>
						<p className="text-sm">
							{__('Create your first campaign to start generating content automatically.', 'wp-ai-blogger')}
						</p>
					</div>
				)}
			</div>

			{/* Screen reader summary */}
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{__(`Showing ${campaignsData.campaigns.length} campaigns with ${campaignsData.totalPosts} total posts and ${campaignsData.totalVisits} total visits`, 'wp-ai-blogger')}
			</div>
		</section>
	);
}

// Add display name for debugging
CampaignsInsights.displayName = 'CampaignsInsights';

export default memo(CampaignsInsights);
