import React, { memo } from 'react';
import { __ } from '@wordpress/i18n';
import { Lock } from 'lucide-react';

// Individual blurred skeleton row component for created post ideas
const BlurredSkeletonRow = memo(({ index, showLockIcon }) => (
	<tr
		className="bg-gray-50/80 opacity-60 blur-[0.5px] relative overflow-hidden"
		role="row"
		aria-label={__(`Created post idea ${index + 1}`, 'wp-ai-blogger')}
	>
		{/* Overlay for additional blur effect */}
		<td className="py-4 pl-4 pr-3 text-sm sm:pl-6 relative">
			<div className="flex items-start gap-3">
				{/* Blurred content placeholder */}
				<div className="flex-1 space-y-2">
					<div
						className="h-4 bg-gray-400 rounded"
						style={{ width: `${Math.random() * 40 + 60}%` }}
					/>
					<div
						className="h-3 bg-gray-300 rounded"
						style={{ width: `${Math.random() * 30 + 40}%` }}
					/>
				</div>
			</div>

			{/* Lock icon overlay - only show on first blurred row */}
			{showLockIcon && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
						<Lock className="h-5 w-5 text-gray-600" />
					</div>
				</div>
			)}
		</td>

		<td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6 relative">
			<div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-gray-200">
				<div className="w-4 h-4 bg-gray-400 rounded" />
				<div className="w-16 h-4 bg-gray-400 rounded" />
			</div>
		</td>
	</tr>
));

BlurredSkeletonRow.displayName = 'BlurredSkeletonRow';

// Blurred skeleton component for created post ideas
const BlurredSkeleton = memo(({ rows = 1, className = '' }) => {
	if (rows === 0) return null;

	return (
		<>
			{Array.from({ length: rows }, (_, index) => (
				<BlurredSkeletonRow
					key={`blurred-skeleton-${index}`}
					index={index}
					showLockIcon={index === 0} // Only show lock icon on the first blurred row
				/>
			))}
		</>
	);
});

BlurredSkeleton.displayName = 'BlurredSkeleton';

export default BlurredSkeleton;
