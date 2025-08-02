import React, { memo, useMemo } from 'react';

const HEADING_PERCENT = 40;
const CONTENT_PERCENT = 60;

// Individual skeleton row component for better performance
const SkeletonRow = memo( ( { index } ) => (
	<tr
		className="animate-pulse even:bg-gray-50 hover:bg-blue-50/30 transition-colors duration-150"
		role="row"
		aria-label={ `Loading row ${ index + 1 }` }
	>
		<td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
			<div className="flex items-start gap-3">
				{ /* Icon placeholder */ }
				<div className="flex-shrink-0 mt-1">
					<div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
				</div>
				{ /* Content placeholder */ }
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-gray-300 rounded animate-pulse" style={ { width: `${ HEADING_PERCENT }%` } } />
					<div className="h-3 bg-gray-200 rounded animate-pulse" style={ { width: `${ CONTENT_PERCENT }%` } } />
					{ /* Category placeholder */ }
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
) );

SkeletonRow.displayName = 'SkeletonRow';

// Enhanced skeleton table component
const Skeleton = memo( ( { rows = 5 } ) => {
	// Memoize skeleton rows for performance
	const skeletonRows = useMemo( () =>
		Array.from( { length: rows }, ( _, index ) => (
			<SkeletonRow key={ `skeleton-${ index }` } index={ index } />
		) ),
	[ rows ]
	);

	// Return just the skeleton rows without table wrapper for inline use
	return (
		<>
			{ skeletonRows }
		</>
	);
} );

Skeleton.displayName = 'PostIdeasSkeleton';

export default Skeleton;
