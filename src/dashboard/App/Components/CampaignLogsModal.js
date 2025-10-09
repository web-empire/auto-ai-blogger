import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
	ScrollText,
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	AlertCircle,
	Activity,
} from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';

const CampaignLogsModal = ( { isOpen, onClose, campaignId, campaignData } ) => {
	const [ logsData, setLogsData ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ open, setOpen ] = useState( isOpen );

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

	const getStatusIcon = ( status ) => {
		switch ( status ) {
			case 'success':
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case 'failed':
				return <XCircle className="w-4 h-4 text-red-500" />;
			case 'scheduled':
				return <Clock className="w-4 h-4 text-blue-500" />;
			default:
				return <AlertCircle className="w-4 h-4 text-gray-500" />;
		}
	};

	const getStatusBadge = ( status ) => {
		const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
		switch ( status ) {
			case 'success':
				return `${baseClasses} bg-green-100 text-green-800`;
			case 'failed':
				return `${baseClasses} bg-red-100 text-red-800`;
			case 'scheduled':
				return `${baseClasses} bg-blue-100 text-blue-800`;
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`;
		}
	};

	return (
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

									{/* Test Message for now */}
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
										<div className="flex items-start space-x-3">
											<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
											<div>
												<h4 className="text-sm font-medium text-blue-900 m-0">{ __( 'Test Message', 'wp-ai-blogger' ) }</h4>
												<p className="text-sm text-blue-700 mt-1 m-0">
													{ __( 'This is a test message for the logs modal. The logs functionality is currently being developed and will show detailed post creation history, scheduling information, and error details.', 'wp-ai-blogger' ) }
												</p>
											</div>
										</div>
									</div>

									{/* Logs List */}
									<div className="bg-white border border-gray-200 rounded-lg">
										<div className="px-4 py-3 border-b border-gray-200">
											<h4 className="text-base font-medium text-gray-900 m-0">{ __( 'Recent Activity', 'wp-ai-blogger' ) }</h4>
										</div>
										<div className="divide-y divide-gray-200">
											{ logsData?.logs?.length > 0 ? (
												logsData.logs.map( ( log, index ) => (
													<div key={ index } className="px-4 py-3 hover:bg-gray-50">
														<div className="flex items-start space-x-3">
															{ getStatusIcon( log.status ) }
															<div className="flex-1 min-w-0">
																<div className="flex items-center justify-between mb-1">
																	<p className="text-sm font-medium text-gray-900 m-0">{ log.action }</p>
																	<div className="flex items-center space-x-2">
																		<span className={ getStatusBadge( log.status ) }>
																			{ log.status }
																		</span>
																		<span className="text-xs text-gray-500">
																			{ log.timestamp }
																		</span>
																	</div>
																</div>
																{ log.message && (
																	<p className="text-sm text-gray-600 m-0">{ log.message }</p>
																) }
																{ log.post_id && (
																	<p className="text-xs text-gray-500 mt-1 m-0">
																		{ __( 'Post ID:', 'wp-ai-blogger' ) } { log.post_id }
																	</p>
																) }
															</div>
														</div>
													</div>
												) )
											) : (
												<div className="px-4 py-8 text-center">
													<ScrollText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
													<p className="text-gray-500 text-sm">
														{ __( 'No logs available yet. Logs will appear here once post creation begins.', 'wp-ai-blogger' ) }
													</p>
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
