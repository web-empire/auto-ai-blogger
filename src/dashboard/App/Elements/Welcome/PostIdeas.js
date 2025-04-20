import React from 'react';
import { __ } from '@wordpress/i18n';
import { Plus, MoveRight } from 'lucide-react';
import { TrimWordsContent } from '@Utils/TrimWordsContent';

const postIdeas = [
	{ title: 'Best home workout routine', volume: '37m', position: '8', visits: '12,000' },
	{ title: 'Best yoga on home', volume: '10M', position: '23', visits: '27,000' },
	{ title: 'Tips to loose belly fats in 21 days', volume: '7m', position: '12', visits: '32,000' },
	{ title: 'Improve your core within 11 days', volume: '3m', position: '4', visits: '78,000' },
	{ title: 'Best diet plan for weight loss', volume: '2m', position: '9', visits: '45,000' },
];

export default function PostIdeas() {
	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<h1 className="text-base font-semibold text-gray-900"> { __( 'Blog Post Suggestions', 'wp-ai-blogger' ) } </h1>
					<p className="mt-2 text-sm text-gray-700">
						{ __( 'A list of some new blog post ideas that you can use to grow your blog.', 'wp-ai-blogger' ) }
					</p>
				</div>
				<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
					<button
						type="button"
						className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer"
					>
						{ __( 'Refresh', 'wp-ai-blogger' ) }
					</button>
				</div>
			</div>

			<div className="mt-6 flow-root">
				<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="block py-2 align-middle sm:px-6 lg:px-8">
						<div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
							<table className="w-full divide-y divide-gray-300">
								<thead className="bg-gray-50 header-nav">
									<tr>
										<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
											{ __( 'Title', 'wp-ai-blogger' ) }
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											{ __( 'Volume', 'wp-ai-blogger' ) }
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											{ __( 'Position', 'wp-ai-blogger' ) }
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											{ __( 'Visits', 'wp-ai-blogger' ) }
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											{ __( 'Write Post', 'wp-ai-blogger' ) }
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-200 bg-white">
									{ postIdeas.map( ( post ) => (
										<tr key={ post.title } className="even:bg-gray-50">
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
												{ TrimWordsContent( post.title ) }
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ post.volume }</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ post.position }</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ post.visits }</td>
											<td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
												<a href="#" className="text-indigo-600 hover:text-indigo-900 flex items-center gap-x-1">
													<Plus className="w-5 h-5" />
													{ __( 'Create', 'wp-ai-blogger' ) }
												</a>
											</td>
										</tr>
									) ) }
								</tbody>

								<tfoot className="bg-gray-50">
									<tr>
										<td colSpan="5" className="px-3 py-3.5 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-900">
											<a href={ autoblog_data.upgrade_link } className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center gap-x-1">
												{ __( 'Upgrade to pro to get more post ideas.', 'wp-ai-blogger' ) }
												<MoveRight className="w-5 h-5" />
											</a>
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
