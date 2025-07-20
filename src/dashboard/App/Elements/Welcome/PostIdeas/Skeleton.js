import React, { memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';

// Individual skeleton row component for better performance
const SkeletonRow = memo(({ index }) => (
	<tr
		className="animate-pulse even:bg-gray-50 hover:bg-blue-50/30 transition-colors duration-150"
		role="row"
		aria-label={__(`Loading row ${index + 1}`, 'wp-ai-blogger')}
	>
		<td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
			<div className="flex items-start gap-3">
				{/* Icon placeholder */}
				<div className="flex-shrink-0 mt-1">
					<div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
				</div>
				{/* Content placeholder */}
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
					<div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 40}%` }} />
					{/* Category placeholder */}
					<div className="mt-2">
						<div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
					</div>
				</div>
			</div>
		</td>

		<td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
			<div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-100 animate-pulse">
				<div className="w-4 h-4 bg-gray-300 rounded" />
				<div className="w-20 h-4 bg-gray-300 rounded" />
			</div>
		</td>
	</tr>
));

SkeletonRow.displayName = 'SkeletonRow';

// Enhanced skeleton table component
const Skeleton = memo(({ rows = 5, className = '' }) => {
	// Memoize skeleton rows for performance
	const skeletonRows = useMemo(() =>
		Array.from({ length: rows }, (_, index) => (
			<SkeletonRow key={`skeleton-${index}`} index={index} />
		)),
		[rows]
	);

	return (
		<div
			className={`flow-root ${className}`}
			role="status"
			aria-live="polite"
			aria-label={__('Loading post ideas...', 'wp-ai-blogger')}
		>
			<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div className="overflow-hidden shadow-lg ring-1 ring-black/5 sm:rounded-xl">
						<table
							className="w-full divide-y divide-gray-300"
							role="table"
							aria-label={__('Loading post ideas table', 'wp-ai-blogger')}
						>
							<caption className="sr-only">
								{__('Loading table content, please wait...', 'wp-ai-blogger')}
							</caption>

							<thead className="bg-gradient-to-r from-gray-50 to-gray-100" role="rowgroup">
								<tr role="row">
									<th
										scope="col"
										className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
									>
										{__('Post Idea', 'wp-ai-blogger')}
									</th>
									<th
										scope="col"
										className="px-3 py-4 text-center text-sm font-semibold text-gray-900"
									>
										{__('Action', 'wp-ai-blogger')}
									</th>
								</tr>
							</thead>

							<tbody
								className="divide-y divide-gray-200 bg-white"
								role="rowgroup"
							>
								{skeletonRows}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Loading indicator for screen readers */}
			<div className="sr-only" aria-live="polite">
				{__('Loading content, please wait...', 'wp-ai-blogger')}
			</div>
		</div>
	);
});

Skeleton.displayName = 'PostIdeasSkeleton';

export default Skeleton;
