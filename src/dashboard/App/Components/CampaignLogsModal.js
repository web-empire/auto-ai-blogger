import React, { useState, useEffect } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
	ScrollText,
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	AlertCircle,
	AlertTriangle,
	Activity,
	Info,
	BarChart3,
	Target,
	ChevronDown,
	ChevronRight,
} from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';

const CampaignLogsModal = ( { isOpen, onClose, campaignId, campaignData } ) => {
	const [ logsData, setLogsData ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ open, setOpen ] = useState( isOpen );
	const [ expandedLogs, setExpandedLogs ] = useState( new Set() );

	useEffect( () => {
		setOpen( isOpen );
		if ( isOpen && campaignId ) {
			fetchLogsData();
		}
	}, [ isOpen, campaignId ] );

	const closeModal = () => {
		setOpen( false );
		onClose();
	};

	const toggleLogExpansion = ( logId ) => {
		const newExpanded = new Set( expandedLogs );
		if ( newExpanded.has( logId ) ) {
			newExpanded.delete( logId );
		} else {
			newExpanded.add( logId );
		}
		setExpandedLogs( newExpanded );
	};

	const fetchLogsData = async () => {
		setLoading( true );
		setError( null );

		try {
			const formData = new FormData();
			formData.append( 'action', 'wpaib_get_campaign_logs' );
			formData.append( 'security', wpaib_localized_data.admin_nonce );
			formData.append( 'campaign_id', campaignId );

			const response = await apiFetch( {
				url: wpaib_localized_data.ajax_url,
				method: 'POST',
				body: formData,
			} );

			if ( response?.success ) {
				setLogsData( response.data );
			} else {
				setError( response?.data?.message || __( 'Failed to fetch logs data', 'wp-ai-blogger' ) );
			}
		} catch ( err ) {
			console.error( 'Error fetching logs:', err );
			setError( __( 'An error occurred while fetching logs data', 'wp-ai-blogger' ) );
		} finally {
			setLoading( false );
		}
	};

	const formatTimestamp = ( timestamp ) => {
		if ( ! timestamp ) return '';

		try {
			const date = new Date( timestamp );
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor( diffMs / 60000 );
			const diffHours = Math.floor( diffMs / 3600000 );
			const diffDays = Math.floor( diffMs / 86400000 );

			if ( diffMins < 1 ) {
				return __( 'Just now', 'wp-ai-blogger' );
			} else if ( diffMins < 60 ) {
				return sprintf( __( '%d minutes ago', 'wp-ai-blogger' ), diffMins );
			} else if ( diffHours < 24 ) {
				return sprintf( __( '%d hours ago', 'wp-ai-blogger' ), diffHours );
			} else if ( diffDays < 7 ) {
				return sprintf( __( '%d days ago', 'wp-ai-blogger' ), diffDays );
			} else {
				return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
			}
		} catch ( e ) {
			return timestamp;
		}
	};

	const getStatusIcon = ( status ) => {
		switch ( status?.toLowerCase() ) {
			case 'success':
			case 'completed':
			case 'published':
				return <CheckCircle className="w-4 h-4 text-green-600" />;
			case 'error':
			case 'failed':
			case 'failure':
				return <XCircle className="w-4 h-4 text-red-600" />;
			case 'warning':
			case 'partial':
				return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
			case 'scheduled':
			case 'pending':
				return <Clock className="w-4 h-4 text-blue-600" />;
			case 'running':
			case 'processing':
				return <Activity className="w-4 h-4 text-indigo-600 animate-spin" />;
			case 'info':
			default:
				return <Info className="w-4 h-4 text-gray-600" />;
		}
	};

	const getStatusBadge = ( status ) => {
		const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
		switch ( status?.toLowerCase() ) {
			case 'success':
			case 'completed':
			case 'published':
				return `${baseClasses} bg-green-100 text-green-800`;
			case 'error':
			case 'failed':
			case 'failure':
				return `${baseClasses} bg-red-100 text-red-800`;
			case 'warning':
			case 'partial':
				return `${baseClasses} bg-yellow-100 text-yellow-800`;
			case 'scheduled':
			case 'pending':
				return `${baseClasses} bg-blue-100 text-blue-800`;
			case 'running':
			case 'processing':
				return `${baseClasses} bg-indigo-100 text-indigo-800`;
			case 'info':
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`;
		}
	};	return (
		<Dialog open={ open } onClose={ closeModal } className="relative z-999999">
			<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
			<div className="fixed inset-0 z-999999 w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
						{/* Header */}
						<div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<ScrollText className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 m-0">
										{ __( 'Campaign Logs', 'wp-ai-blogger' ) }
									</h3>
									<p className="text-sm text-gray-600 m-0">
										{ campaignData?.name && `${campaignData.name} - ` }{ __( 'Post creation history and scheduling logs', 'wp-ai-blogger' ) }
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={ closeModal }
								className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 p-2"
							>
								<XMarkIcon className="h-6 w-6" />
							</button>
						</div>

						{/* Content */}
						<div className="px-6 py-4">
							{ loading ? (
								<div className="flex items-center justify-center py-8">
									<Activity className="w-6 h-6 text-gray-400 animate-spin mr-2" />
									<span className="text-gray-600">{ __( 'Loading logs...', 'wp-ai-blogger' ) }</span>
								</div>
							) : error ? (
								<div className="text-center py-8">
									<XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
									<p className="text-red-600">{ error }</p>
									<button
										onClick={ fetchLogsData }
										className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
									>
										{ __( 'Try Again', 'wp-ai-blogger' ) }
									</button>
								</div>
							) : (
								<div className="space-y-4">
									{/* Summary Stats */}
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
											<div className="flex items-center">
												<Clock className="w-5 h-5 text-blue-600 mr-2" />
												<div>
													<p className="text-sm text-blue-600 m-0">{ __( 'Scheduled', 'wp-ai-blogger' ) }</p>
													<p className="text-lg font-semibold text-blue-900 m-0">
														{ (() => {
															// Parse postsScheduled from campaign data
															if (campaignData?.postsScheduled !== undefined) {
																return campaignData.postsScheduled;
															}
															// Fallback: try to parse from postsTarget display
															const postsTargetParts = campaignData?.postsTarget ? campaignData.postsTarget.toString().split(' / ') : ['0', '0'];
															const leftPart = postsTargetParts[0] || '0';
															if (leftPart.includes('(')) {
																const match = leftPart.match(/\((\d+)\)/);
																return match ? parseInt(match[1]) || 0 : 0;
															}
															return parseInt(leftPart) || 0;
														})() }
													</p>
												</div>
											</div>
										</div>
										<div className="bg-green-50 border border-green-200 rounded-lg p-4">
											<div className="flex items-center">
												<CheckCircle className="w-5 h-5 text-green-600 mr-2" />
												<div>
													<p className="text-sm text-green-600 m-0">{ __( 'Successful', 'wp-ai-blogger' ) }</p>
													<p className="text-lg font-semibold text-green-900 m-0">
														{ (() => {
															// Parse postsCreated from campaign data
															if (campaignData?.postsCreated !== undefined) {
																return campaignData.postsCreated;
															}
															// Fallback: try to parse from postsTarget display
															const postsTargetParts = campaignData?.postsTarget ? campaignData.postsTarget.toString().split(' / ') : ['0', '0'];
															const leftPart = postsTargetParts[0] || '0';
															if (leftPart.includes('(')) {
																const match = leftPart.match(/^(\d+)/);
																return match ? parseInt(match[1]) || 0 : 0;
															}
															return parseInt(leftPart) || 0;
														})() }
													</p>
												</div>
											</div>
										</div>
										<div className="bg-red-50 border border-red-200 rounded-lg p-4">
											<div className="flex items-center">
												<XCircle className="w-5 h-5 text-red-600 mr-2" />
												<div>
													<p className="text-sm text-red-600 m-0">{ __( 'Failed', 'wp-ai-blogger' ) }</p>
													<p className="text-lg font-semibold text-red-900 m-0">
														{ campaignData?.postsFailed || 0 }
													</p>
												</div>
											</div>
										</div>
										<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
											<div className="flex items-center">
												<Activity className="w-5 h-5 text-gray-600 mr-2" />
												<div>
													<p className="text-sm text-gray-600 m-0">{ __( 'Target', 'wp-ai-blogger' ) }</p>
													<p className="text-lg font-semibold text-gray-900 m-0">
														{ (() => {
															// Parse target from postsTarget display
															const postsTargetParts = campaignData?.postsTarget ? campaignData.postsTarget.toString().split(' / ') : ['0', '0'];
															return parseInt(postsTargetParts[1]) || 0;
														})() }
													</p>
												</div>
											</div>
										</div>
									</div>

									{/* Campaign Info Bar */}
									<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
											<div>
												<span className="font-medium text-gray-700">{ __( 'Campaign Status:', 'wp-ai-blogger' ) }</span>
												<span className={ (() => {
													// Check if campaign is explicitly marked as completed
													if (campaignData?.campaignCompleted) {
														return 'ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
													}

													// Parse campaign numbers
													const postsCreated = campaignData?.postsCreated || 0;
													const postsScheduled = (() => {
														if (campaignData?.postsScheduled !== undefined) {
															return campaignData.postsScheduled;
														}
														// Fallback: parse from postsTarget display
														const postsTargetParts = campaignData?.postsTarget ? campaignData.postsTarget.toString().split(' / ') : ['0', '0'];
														const leftPart = postsTargetParts[0] || '0';
														if (leftPart.includes('(')) {
															const match = leftPart.match(/\((\d+)\)/);
															return match ? parseInt(match[1]) || 0 : 0;
														}
														return parseInt(leftPart) || 0;
													})();
													const postsTarget = (() => {
														if (campaignData?.postsTarget !== undefined) {
															const targetStr = campaignData.postsTarget.toString();
															// Handle "created (scheduled) / target" format
															const targetMatch = targetStr.match(/\/\s*(\d+)$/);
															return targetMatch ? parseInt(targetMatch[1]) : parseInt(targetStr) || 0;
														}
														return 0;
													})();

													// Check if completed (scheduled >= target OR created >= target)
													if (postsTarget > 0 && (postsScheduled >= postsTarget || postsCreated >= postsTarget)) {
														return 'ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
													} else if (campaignData?.status === 'publish') {
														return 'ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
													} else {
														return 'ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
													}
												})() }>
													{ (() => {
														// Check if campaign is explicitly marked as completed
														if (campaignData?.campaignCompleted) {
															return __( 'Completed', 'wp-ai-blogger' );
														}

														// Parse campaign numbers
														const postsCreated = campaignData?.postsCreated || 0;
														const postsScheduled = (() => {
															if (campaignData?.postsScheduled !== undefined) {
																return campaignData.postsScheduled;
															}
															// Fallback: parse from postsTarget display
															const postsTargetParts = campaignData?.postsTarget ? campaignData.postsTarget.toString().split(' / ') : ['0', '0'];
															const leftPart = postsTargetParts[0] || '0';
															if (leftPart.includes('(')) {
																const match = leftPart.match(/\((\d+)\)/);
																return match ? parseInt(match[1]) || 0 : 0;
															}
															return parseInt(leftPart) || 0;
														})();
														const postsTarget = (() => {
															if (campaignData?.postsTarget !== undefined) {
																const targetStr = campaignData.postsTarget.toString();
																// Handle "created (scheduled) / target" format
																const targetMatch = targetStr.match(/\/\s*(\d+)$/);
																return targetMatch ? parseInt(targetMatch[1]) : parseInt(targetStr) || 0;
															}
															return 0;
														})();

														// Check if completed (scheduled >= target OR created >= target)
														if (postsTarget > 0 && (postsScheduled >= postsTarget || postsCreated >= postsTarget)) {
															return __( 'Completed', 'wp-ai-blogger' );
														} else if (campaignData?.status === 'publish') {
															return __( 'Active', 'wp-ai-blogger' );
														} else {
															return __( 'Inactive', 'wp-ai-blogger' );
														}
													})() }
												</span>
											</div>
											<div>
												<span className="font-medium text-gray-700">{ __( 'Last Run:', 'wp-ai-blogger' ) }</span>
												<span className="ml-2 text-gray-600">{ campaignData?.lastRun || __( 'Never', 'wp-ai-blogger' ) }</span>
											</div>
											<div>
												<span className="font-medium text-gray-700">{ __( 'Frequency:', 'wp-ai-blogger' ) }</span>
												<span className="ml-2 text-gray-600">{ campaignData?.frequency || __( 'Not set', 'wp-ai-blogger' ) }</span>
											</div>
										</div>
									</div>

									{/* Activity Timeline */}
									<div className="bg-white border border-gray-200 rounded-lg">
										<div className="px-4 py-3 border-b border-gray-200">
											<div className="flex items-center justify-between">
												<h4 className="text-base font-medium text-gray-900 m-0">{ __( 'Activity Timeline', 'wp-ai-blogger' ) }</h4>
												<button
													onClick={ fetchLogsData }
													className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
													disabled={ loading }
												>
													<Activity className={ `w-3 h-3 ${ loading ? 'animate-spin' : '' }` } />
													{ __( 'Refresh', 'wp-ai-blogger' ) }
												</button>
											</div>
										</div>
										<div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
											{ logsData?.logs?.length > 0 ? (
												logsData.logs.map( ( log, index ) => {
													const logId = log.id || index;
													const isExpanded = expandedLogs.has( logId );
													const hasSteps = log.steps && log.steps.length > 0;

													return (
														<div key={ logId } className="px-4 py-3 hover:bg-gray-50 transition-colors">
															<div className="flex items-start space-x-3">
																<div className="flex-shrink-0 mt-0.5">
																	{ getStatusIcon( log.status ) }
																</div>
																<div className="flex-1 min-w-0">
																	{/* Main log header */}
																	<div className="flex items-center justify-between">
																		<div className="flex-1">
																			<div className="flex items-center space-x-2">
																				<h4 className="text-sm font-medium text-gray-900 m-0">
																					{ log.title || log.action || __( 'Campaign Activity', 'wp-ai-blogger' ) }
																				</h4>
																				<span className={ getStatusBadge( log.status ) }>
																					{ log.status?.charAt(0).toUpperCase() + log.status?.slice(1) || 'Unknown' }
																				</span>
																			</div>
																			{ log.message && (
																				<p className="text-xs text-gray-600 mt-1 m-0">{ log.message }</p>
																			) }
																		</div>
																		<div className="flex items-center space-x-2">
																			<span className="text-xs text-gray-500">
																				{ formatTimestamp( log.timestamp ) }
																			</span>
																			{ hasSteps && (
																				<button
																					onClick={ () => toggleLogExpansion( logId ) }
																					className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
																					aria-label={ isExpanded ? __( 'Hide details', 'wp-ai-blogger' ) : __( 'Show details', 'wp-ai-blogger' ) }
																				>
																					{ isExpanded ? (
																						<ChevronDown className="w-4 h-4" />
																					) : (
																						<ChevronRight className="w-4 h-4" />
																					) }
																				</button>
																			) }
																		</div>
																	</div>

																	{/* Post details - always visible */}
																	{ ( log.post_id || log.post_title ) && (
																		<div className="flex items-center gap-2 text-xs mt-2">
																			{ log.post_id && (
																				<span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
																					<span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
																					{ __( 'ID:', 'wp-ai-blogger' ) } { log.post_id }
																				</span>
																			) }
																			{ log.post_title && (
																				<span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-full">
																					<ScrollText className="w-3 h-3 mr-1" />
																					{ log.post_title.length > 40 ? log.post_title.substring(0, 40) + '...' : log.post_title }
																				</span>
																			) }
																		</div>
																	) }

																	{/* Error details - always visible if present */}
																	{ log.error_details && (
																		<div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
																			<p className="text-xs text-red-800 m-0 font-medium">{ __( 'Error Details:', 'wp-ai-blogger' ) }</p>
																			<p className="text-xs text-red-700 mt-1 m-0">{ log.error_details }</p>
																		</div>
																	) }

																	{/* Collapsible Steps/Process details */}
																	{ hasSteps && isExpanded && (
																		<div className="mt-3 border border-gray-200 rounded-md p-3 bg-gray-50">
																			<p className="text-xs font-medium text-gray-700 mb-2 m-0">{ __( 'Process Steps:', 'wp-ai-blogger' ) }</p>
																			<div className="space-y-2">
																				{ log.steps.map( ( step, stepIndex ) => (
																					<div key={ stepIndex } className="flex items-center justify-between">
																						<div className="flex items-center space-x-2">
																							{ getStatusIcon( step.status ) }
																							<span className="text-xs text-gray-600">{ step.description }</span>
																						</div>
																						{ step.duration && (
																							<span className="text-xs text-gray-500 font-mono">
																								{ step.duration }ms
																							</span>
																						) }
																					</div>
																				) ) }
																			</div>
																		</div>
																	) }
																</div>
															</div>
														</div>
													);
												} )
											) : (
												<div className="px-4 py-12 text-center">
													<div className="flex flex-col items-center">
														<ScrollText className="w-12 h-12 text-gray-300 mb-4" />
														<h5 className="text-sm font-medium text-gray-900 mb-1">{ __( 'No Activity Yet', 'wp-ai-blogger' ) }</h5>
														<p className="text-xs text-gray-500 max-w-sm">
															{ __( 'Post creation logs will appear here once your campaign starts generating content. Make sure your campaign is active and properly configured.', 'wp-ai-blogger' ) }
														</p>
														{ campaignData?.status !== 'publish' && (
															<div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
																{ __( 'Campaign is currently inactive. Activate it to start generating logs.', 'wp-ai-blogger' ) }
															</div>
														) }
													</div>
												</div>
											) }
										</div>
									</div>
								</div>
							) }
						</div>

						{/* Footer */}
						<div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
							<div className="flex items-center justify-between">
								<p className="text-xs text-gray-500 m-0">
									{ __( 'Logs are automatically generated during post creation and scheduling.', 'wp-ai-blogger' ) }
								</p>
								<button
									type="button"
									onClick={ closeModal }
									className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
								>
									{ __( 'Close', 'wp-ai-blogger' ) }
								</button>
							</div>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
};

export default CampaignLogsModal;
