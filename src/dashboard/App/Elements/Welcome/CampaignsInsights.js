import React from 'react';
import { __ } from '@wordpress/i18n';
import { MoveRight } from 'lucide-react';

const stats = [
	{ id: 1, posts: '17', visits: '1.5k', lastRun: '2 days ago' },
	{ id: 2, posts: '58', visits: '5.4k', lastRun: '2 days ago' },
	{ id: 3, posts: '24', visits: '3.2k', lastRun: '2 days ago' },
	{ id: 4, posts: '72', visits: '5.2k', lastRun: '2 days ago' },
];

export default function CampaignsInsights() {
	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<h3 className="text-base font-semibold text-gray-900"> { __( 'Campaigns Insights', 'wp-ai-blogger' ) } </h3>

			<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{ stats.map( ( item ) => (
					<div
						key={ item.id }
						className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
					>
						<div className="campaigns-insight-wrap">
							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Posts', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ item.posts }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Visits', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ item.visits }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Last Run on', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ item.lastRun }</div>
							</div>
						</div>

						<div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
							<div className="text-sm">
								<a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-between w-full">
									<span> Campaign { item.id } </span>
									<MoveRight className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>
				) ) }
			</dl>
		</div>
	);
}
