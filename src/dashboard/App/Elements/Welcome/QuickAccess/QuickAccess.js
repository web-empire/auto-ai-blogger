import React from 'react';
import { __ } from '@wordpress/i18n';
import { Ticket, FileText, Users } from 'lucide-react';

export default function QuickAccess() {
	const quickAccessLinks = [
		{
			icon: <Ticket className="w-5 h-5" />,
			title: __( 'Open Support Ticket', 'wp-ai-blogger' ),
			url: 'https://wpaiblogger.com/support/'
		},
		{
			icon: <FileText className="w-5 h-5" />,
			title: __( 'Help Center', 'wp-ai-blogger' ),
			url: 'https://wpaiblogger.com/docs/'
		},
		{
			icon: <Users className="w-5 h-5" />,
			title: __( 'Join our Community on Facebook', 'wp-ai-blogger' ),
			url: 'https://www.facebook.com/groups/wpaiblogger'
		}
	];

	return (
		<div className="px-4 sm:px-6 lg:px-8 pt-2 pb-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-semibold text-gray-900 flex items-center gap-4 p-0 m-0">
						{ __( 'Quick Access', 'wp-ai-blogger' ) }
					</h2>
					<p className="mt-4 text-sm text-gray-700">
						{ __( 'Get help and connect with the community.', 'wp-ai-blogger' ) }
					</p>
				</div>
			</div>

			<div className="mt-6 flow-root">
				<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="block py-2 align-middle sm:px-6 lg:px-8">
						<div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
							<table className="w-full divide-y divide-gray-300">
								<tbody className="divide-y divide-gray-200 bg-white">
									{ quickAccessLinks.map( ( link, index ) => (
										<tr key={ index } className="hover:bg-gray-50 group">
											<td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
												<div className="flex items-center space-x-3">
													<div className="flex-shrink-0 flex items-center text-gray-600 group-hover:text-indigo-600 transition-colors">
														{ link.icon }
													</div>
													<div className="flex-1 min-w-0">
														<a
															href={ link.url }
															target="_blank"
															rel="noopener noreferrer"
															className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
														>
															{ link.title }
														</a>
													</div>
												</div>
											</td>
											<td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-6">
												<a
													href={ link.url }
													target="_blank"
													rel="noopener noreferrer"
													className="text-gray-400 hover:text-gray-600"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
													</svg>
												</a>
											</td>
										</tr>
									) ) }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
