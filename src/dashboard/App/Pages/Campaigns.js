import React, { useState, useCallback, useMemo, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { RefreshCw, Settings, Trash2, Info, FolderPlus, RotateCw, AlertCircle, Plus, X } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import SwitchControl from '@Components/SwitchControl';
import { ConfigureDrawer } from '@Elements/Campaigns';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from 'react-redux';

// Enhanced action button component with loading states
const ActionButton = memo(({
	onClick,
	icon: Icon,
	tooltip,
	isLoading,
	loadingIcon: LoadingIcon = RotateCw,
	className = "text-gray-500 hover:text-indigo-900",
	ariaLabel,
	disabled = false
}) => {
	const handleClick = useCallback((e) => {
		e.preventDefault();
		if (!disabled && !isLoading && onClick) {
			onClick(e);
		}
	}, [onClick, disabled, isLoading]);

	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(e);
		}
	}, [handleClick]);

	return (
		<button
			type="button"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			disabled={disabled || isLoading}
			className={`${className} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded p-1 transition-all duration-200`}
			aria-label={ariaLabel || tooltip}
		>
			<Tooltip
				text={tooltip}
				delay={100}
				className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
			>
				{isLoading ? (
					<LoadingIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
				) : (
					<Icon className="w-4 h-4" aria-hidden="true" />
				)}
			</Tooltip>
		</button>
	);
});

ActionButton.displayName = 'CampaignActionButton';

// Enhanced campaign row component
const CampaignRow = memo(({
	campaign,
	onConfigure,
	onRun,
	onToggleStatus,
	onDelete,
	openingConfigureDrawer
}) => {
	const [isRunning, setIsRunning] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleRun = useCallback(async (e) => {
		setIsRunning(true);
		try {
			await onRun(e, campaign.id);
		} finally {
			setIsRunning(false);
		}
	}, [onRun, campaign.id]);

	const handleDelete = useCallback(async (e) => {
		if (window.confirm(__('Are you sure you want to delete this campaign?', 'wp-ai-blogger'))) {
			setIsDeleting(true);
			try {
				await onDelete(e, campaign.id);
			} finally {
				setIsDeleting(false);
			}
		}
	}, [onDelete, campaign.id]);

	const handleConfigure = useCallback((e) => {
		e.currentTarget.setAttribute('data-campaign_id', campaign.id);
		onConfigure(e);
	}, [onConfigure, campaign.id]);

	const statusText = campaign.status === 'publish' ?
		__('Active', 'wp-ai-blogger') :
		__('Inactive', 'wp-ai-blogger');

	return (
		<tr
			className="even:bg-gray-50 hover:bg-blue-50 transition-colors duration-150"
			role="row"
		>
			<td
				className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-6"
				role="gridcell"
			>
				<div className="flex items-center gap-2">
					<span>{campaign.name}</span>
					{campaign.isNew && (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							{__('New', 'wp-ai-blogger')}
						</span>
					)}
				</div>
			</td>

			<td className="whitespace-nowrap px-3 py-4 text-sm" role="gridcell">
				<div className="flex items-center gap-2">
					<SwitchControl
						checked={campaign.status === 'publish'}
						onChange={() => onToggleStatus(campaign.id, campaign.status)}
						aria-label={__(`Campaign status: ${statusText}`, 'wp-ai-blogger')}
					/>
					<span className="text-gray-600 text-xs">{statusText}</span>
				</div>
			</td>

			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" role="gridcell">
				<div className="flex flex-col">
					<span className="font-medium">{campaign.postsTarget}</span>
					<span className="text-xs text-gray-400">
						{__('target posts', 'wp-ai-blogger')}
					</span>
				</div>
			</td>

			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" role="gridcell">
				{campaign.last_post_title && campaign.last_post_title.length > 0 ? (
					<Tooltip
						text={campaign.last_post_title}
						delay={100}
						className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md max-w-xs"
					>
						<span className="cursor-help border-b border-dotted border-gray-400">
							{TrimWordsContent(campaign.last_post_title)}
						</span>
					</Tooltip>
				) : (
					<span className="text-gray-400 italic">
						{__('No post created yet.', 'wp-ai-blogger')}
					</span>
				)}
			</td>

			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" role="gridcell">
				<div className="flex items-center gap-1">
					<span>{campaign.frequency}</span>
					{campaign.nextRun && (
						<Tooltip
							text={__(`Next run: ${campaign.nextRun}`, 'wp-ai-blogger')}
							delay={100}
							className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md"
						>
							<Info className="w-3 h-3 text-gray-400 cursor-help" />
						</Tooltip>
					)}
				</div>
			</td>

			<td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6" role="gridcell">
				<div className="flex gap-2 items-center justify-end">
					<ActionButton
						onClick={() => {}} // Info action
						icon={Info}
						tooltip={__(`Last run: ${campaign.lastRun}`, 'wp-ai-blogger')}
						ariaLabel={__(`Campaign information for ${campaign.name}`, 'wp-ai-blogger')}
					/>

					<ActionButton
						onClick={handleConfigure}
						icon={Settings}
						tooltip={__('Configure campaign', 'wp-ai-blogger')}
						isLoading={openingConfigureDrawer}
						ariaLabel={__(`Configure ${campaign.name}`, 'wp-ai-blogger')}
					/>

					<ActionButton
						onClick={handleRun}
						icon={RefreshCw}
						tooltip={__('Run campaign now', 'wp-ai-blogger')}
						isLoading={isRunning}
						ariaLabel={__(`Run ${campaign.name} now`, 'wp-ai-blogger')}
						disabled={campaign.status !== 'publish'}
					/>

					<ActionButton
						onClick={handleDelete}
						icon={Trash2}
						tooltip={__('Delete campaign', 'wp-ai-blogger')}
						isLoading={isDeleting}
						className="text-red-500 hover:text-red-700"
						ariaLabel={__(`Delete ${campaign.name}`, 'wp-ai-blogger')}
					/>
				</div>
			</td>
		</tr>
	);
});

CampaignRow.displayName = 'CampaignRow';

// Enhanced empty state component
const EmptyState = memo(({ onCreateCampaign }) => (
	<div className="flex flex-col items-center justify-center gap-y-4 border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-lg mx-auto mt-20 bg-gray-50 hover:bg-gray-100 transition-colors">
		<div className="p-4 bg-indigo-100 rounded-full">
			<FolderPlus className="w-8 h-8 text-indigo-600" aria-hidden="true" />
		</div>

		<div className="text-center space-y-2">
			<h3 className="text-lg font-semibold text-gray-900 m-0">
				{__('No Campaigns Yet', 'wp-ai-blogger')}
			</h3>
			<p className="text-sm text-gray-600 max-w-md">
				{__('Create your first campaign to start generating automated blog content with AI.', 'wp-ai-blogger')}
			</p>
		</div>

		<button
			type="button"
			onClick={onCreateCampaign}
			className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
			aria-label={__('Create your first campaign', 'wp-ai-blogger')}
		>
			<Plus className="w-4 h-4" aria-hidden="true" />
			{__('Create Campaign', 'wp-ai-blogger')}
		</button>
	</div>
));

EmptyState.displayName = 'CampaignsEmptyState';

export default function Campaigns() {
	const dispatch = useDispatch();
	const campaigns = wpaib_localized_data.all_campaigns;
	const defaultMetaDefaults = wpaib_localized_data.postmeta_defaults;

	const [configureData, setConfigureData] = useState(defaultMetaDefaults);
	const [openDrawer, setOpenDrawer] = useState(false);
	const [openingConfigureDrawer, setOpeningConfigureDrawer] = useState(false);
	const [loadingStates, setLoadingStates] = useState({});
	const [error, setError] = useState(null);

	// Memoized campaign data with enhancements
	const campaignData = useMemo(() => {
		if (!campaigns || typeof campaigns !== 'object') return [];

		return Object.values(campaigns).map(campaign => ({
			...campaign,
			isNew: campaign.created_date &&
				new Date(campaign.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			nextRun: campaign.next_scheduled_run || null
		}));
	}, [campaigns]);

	// Enhanced API call with better error handling
	const fetchCampaignMetaData = useCallback(async (campaignId) => {
		try {
			const formData = new FormData();
			formData.append('action', 'wpaib_get_campaign_metadata');
			formData.append('security', wpaib_localized_data.admin_nonce);
			formData.append('campaign_id', campaignId);

			const response = await apiFetch({
				url: wpaib_localized_data.ajax_url,
				method: 'POST',
				body: formData,
				timeout: 30000
			});

			if (response.success) {
				return response.data;
			} else {
				throw new Error(response.data?.message || __('Failed to fetch campaign data', 'wp-ai-blogger'));
			}
		} catch (error) {
			console.error('Campaign fetch error:', error);
			setError(__('Failed to load campaign configuration', 'wp-ai-blogger'));
			throw error;
		}
	}, []);

	// Enhanced configure handler
	const configureCampaign = useCallback(async (e) => {
		e.preventDefault();
		setError(null);
		setOpeningConfigureDrawer(true);

		const campaignId = e.currentTarget.getAttribute('data-campaign_id');
		if (!campaignId) {
			setOpeningConfigureDrawer(false);
			return;
		}

		try {
			const data = await fetchCampaignMetaData(campaignId);
			if (data) {
				setConfigureData({
					...data,
					type: 'edit',
				});
				setOpenDrawer(true);
			}
		} catch (error) {
			// Error already handled in fetchCampaignMetaData
		} finally {
			setOpeningConfigureDrawer(false);
		}
	}, [fetchCampaignMetaData]);

	// Enhanced run campaign handler
	const runCampaign = useCallback(async (e, campaignId) => {
		e.preventDefault();
		setError(null);

		try {
			const formData = new FormData();
			formData.append('action', 'wpaib_run_campaign');
			formData.append('security', wpaib_localized_data.admin_nonce);
			formData.append('campaign_id', campaignId);

			const data = await apiFetch({
				url: wpaib_localized_data.ajax_url,
				method: 'POST',
				body: formData,
				timeout: 60000
			});

			const message = data?.data?.message ||
				(data.success ?
					__('Campaign run successfully.', 'wp-ai-blogger') :
					__('Campaign run failed.', 'wp-ai-blogger')
				);

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: message,
			});

		} catch (error) {
			console.error('Campaign run error:', error);
			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __('Failed to run campaign. Please try again.', 'wp-ai-blogger'),
			});
		}
	}, [dispatch]);

	// Enhanced status toggle handler
	const toggleCampaignStatus = useCallback(async (campaignId, currentStatus) => {
		setLoadingStates(prev => ({ ...prev, [campaignId]: true }));

		try {
			// API call to toggle status would go here
			const newStatus = currentStatus === 'publish' ? 'draft' : 'publish';

			// Simulated API call
			await new Promise(resolve => setTimeout(resolve, 1000));

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __(`Campaign ${newStatus === 'publish' ? 'activated' : 'deactivated'}.`, 'wp-ai-blogger'),
			});
		} catch (error) {
			console.error('Status toggle error:', error);
			setError(__('Failed to update campaign status', 'wp-ai-blogger'));
		} finally {
			setLoadingStates(prev => ({ ...prev, [campaignId]: false }));
		}
	}, [dispatch]);

	// Enhanced delete handler
	const deleteCampaign = useCallback(async (e, campaignId) => {
		e.preventDefault();

		try {
			// API call to delete campaign would go here
			await new Promise(resolve => setTimeout(resolve, 500));

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __('Campaign deleted successfully.', 'wp-ai-blogger'),
			});
		} catch (error) {
			console.error('Delete error:', error);
			setError(__('Failed to delete campaign', 'wp-ai-blogger'));
		}
	}, [dispatch]);

	// Enhanced create campaign handler
	const handleCreateCampaign = useCallback((e) => {
		e.preventDefault();
		setError(null);
		setConfigureData({ ...defaultMetaDefaults, type: 'create' });
		setOpenDrawer(true);
	}, [defaultMetaDefaults]);

	// Error display component
	if (error) {
		return (
			<div
				className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg m-4"
				role="alert"
				aria-describedby="error-message"
			>
				<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
				<div className="flex-1">
					<h3 className="text-sm font-medium text-red-800">
						{__('Campaign Error', 'wp-ai-blogger')}
					</h3>
					<p id="error-message" className="text-sm text-red-700 mt-1">
						{error}
					</p>
				</div>
				<button
					onClick={() => setError(null)}
					className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded p-1"
					aria-label={__('Dismiss error', 'wp-ai-blogger')}
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		);
	}

	// Render empty state
	if (!campaignData || campaignData.length === 0) {
		return (
			<main
				className="campaigns-page"
				role="main"
				aria-labelledby="campaigns-heading"
			>
				<div className="sr-only" aria-live="polite" aria-atomic="true">
					{__('Campaigns page loaded with no campaigns', 'wp-ai-blogger')}
				</div>

				<EmptyState onCreateCampaign={handleCreateCampaign} />

				<ConfigureDrawer
					openDrawer={openDrawer}
					setOpenDrawer={setOpenDrawer}
					configureData={configureData}
				/>
			</main>
		);
	}

	// Render campaigns table
	return (
		<main
			className="campaigns-page"
			role="main"
			aria-labelledby="campaigns-heading"
		>
			<div className="sm:px-6 lg:px-8 py-8 px-4">
				{/* Enhanced header */}
				<div className="sm:flex sm:items-center sm:justify-between">
					<div className="sm:flex-auto">
						<h1 id="campaigns-heading" className="text-xl font-bold text-gray-900">
							{__('Campaigns', 'wp-ai-blogger')}
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							{__(`Manage your ${campaignData.length} blog campaigns and their automation settings.`, 'wp-ai-blogger')}
						</p>
					</div>
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<button
							type="button"
							onClick={handleCreateCampaign}
							className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
							aria-label={__('Create a new campaign', 'wp-ai-blogger')}
						>
							<Plus className="w-4 h-4" aria-hidden="true" />
							{__('Add New', 'wp-ai-blogger')}
						</button>
					</div>
				</div>

				{/* Enhanced campaigns table */}
				<div className="mt-8 flow-root">
					<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<div className="overflow-hidden shadow-lg ring-1 ring-black/5 sm:rounded-lg">
								<table
									className="w-full divide-y divide-gray-300"
									role="table"
									aria-label={__('Campaigns table', 'wp-ai-blogger')}
									aria-describedby="table-description"
								>
									<caption className="sr-only" id="table-description">
										{__(`Table showing ${campaignData.length} campaigns with their status, targets, and actions`, 'wp-ai-blogger')}
									</caption>

									<thead className="bg-gray-50" role="rowgroup">
										<tr role="row">
											<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
												{__('Name', 'wp-ai-blogger')}
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{__('Status', 'wp-ai-blogger')}
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{__('Posts/Target', 'wp-ai-blogger')}
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{__('Latest Post', 'wp-ai-blogger')}
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												{__('Frequency', 'wp-ai-blogger')}
											</th>
											<th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
												{__('Actions', 'wp-ai-blogger')}
											</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-gray-200 bg-white" role="rowgroup">
										{campaignData.map((campaign) => (
											<CampaignRow
												key={campaign.id || campaign.name}
												campaign={campaign}
												onConfigure={configureCampaign}
												onRun={runCampaign}
												onToggleStatus={toggleCampaignStatus}
												onDelete={deleteCampaign}
												openingConfigureDrawer={openingConfigureDrawer}
											/>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ConfigureDrawer
				openDrawer={openDrawer}
				setOpenDrawer={setOpenDrawer}
				configureData={configureData}
			/>
		</main>
	);
}
