import React from 'react';
import { __ } from '@wordpress/i18n';
import { Ticket, FileText, Users } from 'lucide-react';

export default function QuickAccess() {
	const quickAccessLinks = [
		{
			icon: <Ticket className="w-6 h-6" />,
			title: __( 'Open Support Ticket', 'wp-ai-blogger' ),
			description: __( 'Get help with any issues or questions', 'wp-ai-blogger' ),
			url: 'https://wpaiblogger.com/support/',
			color: 'text-blue-600 hover:text-blue-700',
			bgColor: 'bg-blue-50 hover:bg-blue-100'
		},
		{
			icon: <FileText className="w-6 h-6" />,
			title: __( 'Help Center', 'wp-ai-blogger' ),
			description: __( 'Browse documentation and tutorials', 'wp-ai-blogger' ),
			url: 'https://wpaiblogger.com/docs/',
			color: 'text-green-600 hover:text-green-700',
			bgColor: 'bg-green-50 hover:bg-green-100'
		},
		{
			icon: <Users className="w-6 h-6" />,
			title: __( 'Join our Community on Facebook', 'wp-ai-blogger' ),
			description: __( 'Connect with other users and share tips', 'wp-ai-blogger' ),
			url: 'https://www.facebook.com/groups/wpaiblogger',
			color: 'text-purple-600 hover:text-purple-700',
			bgColor: 'bg-purple-50 hover:bg-purple-100'
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
							<div className="bg-white divide-y divide-gray-200">
								{ quickAccessLinks.map( ( link, index ) => (
									<a
										key={ index }
										href={ link.url }
										target="_blank"
										rel="noopener noreferrer"
										className={ `block p-6 transition-colors duration-200 ${ link.bgColor }` }
									>
										<div className="flex items-start space-x-4">
											<div className={ `flex-shrink-0 ${ link.color }` }>
												{ link.icon }
											</div>
											<div className="flex-1 min-w-0">
												<h3 className={ `text-base font-semibold ${ link.color }` }>
													{ link.title }
												</h3>
												<p className="mt-1 text-sm text-gray-600">
													{ link.description }
												</p>
											</div>
											<div className={ `flex-shrink-0 ${ link.color }` }>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
											</div>
										</div>
									</a>
								) ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
