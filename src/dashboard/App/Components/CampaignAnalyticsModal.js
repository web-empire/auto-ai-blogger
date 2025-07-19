import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import {
	X,
	TrendingUp,
	Eye,
	Activity,
	Calendar,
	User,
	MessageSquare,
	Trophy,
	Crown,
	Zap,
	BarChart3,
	ArrowUpRight,
	Clock,
	CheckCircle,
} from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';

const CampaignAnalyticsModal = ( { isOpen, onClose, campaignId, campaignData } ) => {
	const [ analyticsData, setAnalyticsData ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( isOpen && campaignId ) {
			fetchAnalyticsData();
		}
	}, [ isOpen, campaignId ] );

	const fetchAnalyticsData = async () => {
		setLoading( true );
		setError( null );

		try {
			const formData = new FormData();
			formData.append( 'action', 'wpaib_get_campaign_analytics' );
			formData.append( 'security', wpaib_localized_data.admin_nonce );
			formData.append( 'campaign_id', campaignId );

			const response = await apiFetch( {
				url: wpaib_localized_data.ajax_url,
				method: 'POST',
				body: formData,
			} );

			if ( response.success ) {
				setAnalyticsData( response.data );
			} else {
				setError( response.data || __( 'Failed to fetch analytics data', 'wp-ai-blogger' ) );
			}
		} catch ( err ) {
			console.error( 'Analytics fetch error:', err );
			setError( __( 'Error fetching analytics data', 'wp-ai-blogger' ) );
		} finally {
			setLoading( false );
		}
	};

	const formatNumber = ( num ) => {
		if ( num >= 1000000 ) {
			return ( num / 1000000 ).toFixed( 1 ) + 'M';
		}
		if ( num >= 1000 ) {
			return ( num / 1000 ).toFixed( 1 ) + 'K';
		}
		return num?.toString() || '0';
	};

	const formatDate = ( timestamp ) => {
		if ( ! timestamp ) {
			return __( 'Never', 'wp-ai-blogger' );
		}
		const date = new Date( timestamp * 1000 );
		return date.toLocaleDateString();
	};

	const getHealthColor = ( health ) => {
		switch ( health ) {
			case 'excellent':
				return 'text-green-600 bg-green-100';
			case 'good':
				return 'text-blue-600 bg-blue-100';
			case 'warning':
				return 'text-yellow-600 bg-yellow-100';
			case 'poor':
				return 'text-red-600 bg-red-100';
			default:
				return 'text-gray-600 bg-gray-100';
		}
	};

	const onUpgradePro = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		window.open( wpaib_localized_data.pro_purchase_url, '_blank' );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
			<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={ onClose }></div>

				<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

				<div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
					{ /* Header */ }
					<div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-indigo-100 rounded-lg">
								<BarChart3 className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900 m-0">
									{ __( 'Campaign Analytics', 'wp-ai-blogger' ) }
								</h3>
								<p className="text-sm text-gray-500 m-0">
									{ campaignData?.name || __( 'Campaign', 'wp-ai-blogger' ) }
								</p>
							</div>
						</div>
						<button
							type="button"
							className="text-gray-400 hover:text-gray-500 focus:outline-none"
							onClick={ onClose }
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{ /* Content */ }
					{ loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
							<span className="ml-3 text-gray-600">{ __( 'Loading analytics…', 'wp-ai-blogger' ) }</span>
						</div>
					) : error ? (
						<div className="text-center py-12">
							<div className="text-red-500 mb-2">{ error }</div>
							<button
								onClick={ fetchAnalyticsData }
								className="text-indigo-600 hover:text-indigo-500 text-sm"
							>
								{ __( 'Try again', 'wp-ai-blogger' ) }
							</button>
						</div>
					) : (
						<div className="space-y-6">
							{ /* Top Stats */ }
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{ /* Published Posts & Views */ }
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-blue-600 m-0">{ __( 'Published Posts', 'wp-ai-blogger' ) }</p>
											<p className="text-3xl font-bold text-blue-900 m-0">{ analyticsData?.publishedPosts || campaignData?.postsCreated || 0 }</p>
											<div className="flex items-center mt-2">
												<Eye className="w-4 h-4 text-blue-500 mr-1" />
												<span className="text-sm text-blue-600">{ formatNumber( analyticsData?.totalViews || 0 ) } { __( 'views', 'wp-ai-blogger' ) }</span>
											</div>
										</div>
										<TrendingUp className="w-8 h-8 text-blue-500" />
									</div>
								</div>

								{ /* Success Rate */ }
								<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-green-600 m-0">{ __( 'Success Rate', 'wp-ai-blogger' ) }</p>
											<p className="text-3xl font-bold text-green-900 m-0">{ analyticsData?.successRate || '95' }%</p>
											<p className="text-sm text-green-600 mt-1 m-0">{ __( 'Generation success', 'wp-ai-blogger' ) }</p>
										</div>
										<CheckCircle className="w-8 h-8 text-green-500" />
									</div>
								</div>

								{ /* Comments */ }
								<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-purple-600 m-0">{ __( 'Total Comments', 'wp-ai-blogger' ) }</p>
											<p className="text-3xl font-bold text-purple-900 m-0">{ formatNumber( analyticsData?.totalComments || 0 ) }</p>
											<p className="text-sm text-purple-600 mt-1 m-0">{ __( 'Engagement', 'wp-ai-blogger' ) }</p>
										</div>
										<MessageSquare className="w-8 h-8 text-purple-500" />
									</div>
								</div>
							</div>

							{ /* Campaign Health */ }
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Activity className="w-5 h-5 text-gray-600 mr-2" />
									<h4 className="text-lg font-semibold text-gray-900 m-0">{ __( 'Campaign Health', 'wp-ai-blogger' ) }</h4>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<div className="text-center p-4 bg-gray-50 rounded-lg">
										<div className={ `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ getHealthColor( analyticsData?.health || 'good' ) }` }>
											{ analyticsData?.health || 'Good' }
										</div>
										<p className="text-xs text-gray-500 mt-2 m-0">{ __( 'Status', 'wp-ai-blogger' ) }</p>
									</div>

									<div className="text-center p-4 bg-gray-50 rounded-lg">
										<div className="flex items-center justify-center mb-1">
											<Clock className="w-4 h-4 text-gray-500 mr-1" />
											<span className="text-sm font-medium text-gray-900">{ formatDate( campaignData?.lastRun ) }</span>
										</div>
										<p className="text-xs text-gray-500 m-0">{ __( 'Last Run', 'wp-ai-blogger' ) }</p>
									</div>

									<div className="text-center p-4 bg-gray-50 rounded-lg">
										<div className="flex items-center justify-center mb-1">
											<Calendar className="w-4 h-4 text-gray-500 mr-1" />
											<span className="text-sm font-medium text-gray-900">{ analyticsData?.daysActive || 0 }</span>
										</div>
										<p className="text-xs text-gray-500 m-0">{ __( 'Days Active', 'wp-ai-blogger' ) }</p>
									</div>

									<div className="text-center p-4 bg-gray-50 rounded-lg">
										<div className="flex items-center justify-center mb-1">
											<User className="w-4 h-4 text-gray-500 mr-1" />
											<span className="text-sm font-medium text-gray-900">{ analyticsData?.authorName || __( 'Unknown', 'wp-ai-blogger' ) }</span>
										</div>
										<p className="text-xs text-gray-500 m-0">{ __( 'Author', 'wp-ai-blogger' ) }</p>
									</div>
								</div>
							</div>

							{ /* Top Performing Posts */ }
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center">
										<Trophy className="w-5 h-5 text-yellow-600 mr-2" />
										<h4 className="text-lg font-semibold text-gray-900 m-0">{ __( 'Top Performing Posts', 'wp-ai-blogger' ) }</h4>
									</div>
									<span className="text-sm text-gray-500">{ __( 'By views', 'wp-ai-blogger' ) }</span>
								</div>

								<div className="space-y-3">
									{ analyticsData?.topPosts?.length > 0 ? (
										analyticsData.topPosts.map( ( post, index ) => (
											<div key={ post.id } className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
												<div className="flex items-center space-x-3">
													<div className="flex-shrink-0">
														<span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
															{ index + 1 }
														</span>
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium text-gray-900 truncate m-0">{ post.title }</p>
														<p className="text-xs text-gray-500 m-0">{ formatDate( post.date ) }</p>
													</div>
												</div>
												<div className="flex items-center space-x-4">
													<div className="text-right">
														<p className="text-sm font-medium text-gray-900 m-0">{ formatNumber( post.views ) }</p>
														<p className="text-xs text-gray-500 m-0">{ __( 'views', 'wp-ai-blogger' ) }</p>
													</div>
													<ArrowUpRight className="w-4 h-4 text-gray-400" />
												</div>
											</div>
										) )
									) : (
										<div className="text-center py-8">
											<Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
											<p className="text-gray-500 text-sm">{ __( 'No posts data available yet', 'wp-ai-blogger' ) }</p>
										</div>
									) }
								</div>
							</div>

							{ /* Pro Upgrade CTA */ }
							<div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="p-3 bg-white bg-opacity-20 rounded-lg">
											<Crown className="w-8 h-8 text-white" />
										</div>
										<div>
											<h4 className="text-xl font-bold mb-1 m-0">{ __( 'Unlock Advanced Analytics', 'wp-ai-blogger' ) }</h4>
											<p className="text-indigo-100 text-sm m-0">
												{ __( 'Get detailed insights, A/B testing, conversion tracking, and AI-powered recommendations', 'wp-ai-blogger' ) }
											</p>
										</div>
									</div>
									<div className="text-right">
										<button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2" onClick={ onUpgradePro }>
											<Zap className="w-4 h-4" />
											<span>{ __( 'Upgrade to Pro', 'wp-ai-blogger' ) }</span>
										</button>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
									<div className="flex items-center space-x-2">
										<CheckCircle className="w-5 h-5 text-green-300" />
										<span className="text-sm">{ __( 'Advanced conversion tracking', 'wp-ai-blogger' ) }</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="w-5 h-5 text-green-300" />
										<span className="text-sm">{ __( 'A/B testing insights', 'wp-ai-blogger' ) }</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="w-5 h-5 text-green-300" />
										<span className="text-sm">{ __( 'AI performance recommendations', 'wp-ai-blogger' ) }</span>
									</div>
								</div>
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

export default CampaignAnalyticsModal;
