import React, { memo, useMemo, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { Features } from '../Elements/FreeVsPro/Features';
import ProButton from '@Components/ProButton';
import { Sprout, Check, X, Star, Zap } from 'lucide-react';

// Enhanced status icon component with better accessibility
const StatusIcon = memo( ( { value, label } ) => {
	const iconConfig = useMemo( () => {
		switch ( value ) {
			case 'yes':
				return {
					icon: <Check className="w-5 h-5 text-green-600" aria-hidden="true" />,
					className: 'text-green-600 bg-green-50 border-green-200',
					label: __( 'Available', 'wp-ai-blogger' ),
				};
			case 'no':
				return {
					icon: <X className="w-5 h-5 text-red-500" aria-hidden="true" />,
					className: 'text-red-500 bg-red-50 border-red-200',
					label: __( 'Not available', 'wp-ai-blogger' ),
				};
			default:
				return {
					icon: <span className="text-sm font-medium">{ value }</span>,
					className: 'text-gray-600 bg-gray-50 border-gray-200',
					label: typeof value === 'string' ? value : __( 'Custom', 'wp-ai-blogger' ),
				};
		}
	}, [ value ] );

	return (
		<div
			className={ `inline-flex items-center justify-center w-8 h-8 rounded-full border-2 ${ iconConfig.className }` }
			aria-label={ `${ label }: ${ iconConfig.label }` }
			title={ iconConfig.label }
		>
			{ iconConfig.icon }
		</div>
	);
} );

StatusIcon.displayName = 'StatusIcon';

// Enhanced feature row component with better structure
const FeatureRow = memo( ( { feature, index } ) => {
	const isEvenRow = index % 2 === 0;

	return (
		<tr
			className={ `${ isEvenRow ? 'bg-white' : 'bg-gray-50' } hover:bg-blue-50 transition-colors duration-150` }
			role="row"
		>
			<td
				className="py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-8"
				role="rowheader"
			>
				<div className="flex items-center gap-2">
					<span>{ feature.name }</span>
					{ feature.isPremium && (
						<Star className="w-4 h-4 text-yellow-500" aria-label={ __( 'Premium feature', 'wp-ai-blogger' ) } />
					) }
				</div>
			</td>
			<td className="px-3 py-4 text-center" role="gridcell">
				<StatusIcon value={ feature.free } label={ `${ feature.name } - ${ __( 'Free version', 'wp-ai-blogger' ) }` } />
			</td>
			<td className="px-3 py-4 text-center" role="gridcell">
				<StatusIcon value={ feature.pro } label={ `${ feature.name } - ${ __( 'Pro version', 'wp-ai-blogger' ) }` } />
			</td>
		</tr>
	);
} );

FeatureRow.displayName = 'FeatureRow';

// Enhanced CTA section component
const CallToActionSection = memo( () => {
	const handleUpgradeClick = useCallback( ( e ) => {
		// Add analytics tracking if needed
		console.log( 'Pro upgrade button clicked' );
	}, [] );

	return (
		<section
			className="mt-8 py-12 px-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-xl shadow-lg"
			aria-labelledby="cta-heading"
		>
			<div className="flex flex-col items-center text-center">
				{ /* Enhanced icon with animation */ }
				<div className="relative mb-6">
					<div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
					<div className="relative bg-green-500 p-4 rounded-full">
						<Sprout className="w-8 h-8 text-white" aria-hidden="true" />
					</div>
				</div>

				{ /* Enhanced heading with better typography */ }
				<h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4 max-w-2xl">
					{ __( 'Start Growing with AI Blogger Pro', 'wp-ai-blogger' ) }
				</h2>

				{ /* Enhanced description with benefits */ }
				<div className="max-w-2xl space-y-3 mb-8">
					<p className="text-lg text-gray-700">
						{ __( 'Unlock all the features and take your blog to the next level with AI Blogger Pro.', 'wp-ai-blogger' ) }
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
						<span className="flex items-center gap-1">
							<Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
							{ __( 'Advanced AI Features', 'wp-ai-blogger' ) }
						</span>
						<span className="flex items-center gap-1">
							<Check className="w-4 h-4 text-green-500" aria-hidden="true" />
							{ __( 'Priority Support', 'wp-ai-blogger' ) }
						</span>
						<span className="flex items-center gap-1">
							<Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
							{ __( 'Premium Templates', 'wp-ai-blogger' ) }
						</span>
					</div>
				</div>

				{ /* Enhanced CTA button */ }
				<div onClick={ handleUpgradeClick }>
					<ProButton variant="large" />
				</div>

				{ /* Additional trust signals */ }
				<p className="mt-4 text-xs text-gray-500">
					{ __( '30-day money-back guarantee • Cancel anytime • Instant activation', 'wp-ai-blogger' ) }
				</p>
			</div>
		</section>
	);
} );

CallToActionSection.displayName = 'CallToActionSection';

const FreeVsPro = () => {
	// Memoize features to prevent unnecessary re-renders
	const memoizedFeatures = useMemo( () => Features || [], [] );

	// Calculate feature statistics
	const featureStats = useMemo( () => {
		const totalFeatures = memoizedFeatures.length;
		const freeFeatures = memoizedFeatures.filter( ( f ) => f.free === 'yes' ).length;
		const proFeatures = memoizedFeatures.filter( ( f ) => f.pro === 'yes' ).length;

		return { totalFeatures, freeFeatures, proFeatures };
	}, [ memoizedFeatures ] );

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			{ /* Enhanced header with statistics */ }
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
				<div className="flex-1">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						{ __( 'Free vs Pro', 'wp-ai-blogger' ) }
					</h1>
					<p className="text-gray-600">
						{ __( `Compare ${ featureStats.totalFeatures } features across our plans`, 'wp-ai-blogger' ) }
					</p>
					<div className="flex gap-4 mt-2 text-sm text-gray-500">
						<span>{ __( `Free: ${ featureStats.freeFeatures } features`, 'wp-ai-blogger' ) }</span>
						<span>{ __( `Pro: ${ featureStats.proFeatures } features`, 'wp-ai-blogger' ) }</span>
					</div>
				</div>
				<div className="flex-shrink-0">
					<ProButton />
				</div>
			</div>

			{ /* Enhanced comparison table with better accessibility */ }
			<div className="mt-6 flex flex-col">
				<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
						<div className="overflow-hidden shadow-lg ring-1 ring-black/5 sm:rounded-xl">
							<table
								className="w-full divide-y divide-gray-300"
								role="table"
								aria-label={ __( 'Feature comparison between Free and Pro plans', 'wp-ai-blogger' ) }
								aria-describedby="table-description"
							>
								<caption className="sr-only" id="table-description">
									{ __( 'Detailed comparison of features available in Free and Pro versions of AI Blogger', 'wp-ai-blogger' ) }
								</caption>

								<thead className="bg-gradient-to-r from-gray-50 to-gray-100" role="rowgroup">
									<tr role="row">
										<th
											scope="col"
											className="py-4 pl-4 pr-3 text-left text-base font-semibold text-gray-900 sm:pl-8"
											role="columnheader"
										>
											{ __( 'Features', 'wp-ai-blogger' ) }
										</th>
										<th
											scope="col"
											className="px-3 py-4 text-center text-base font-semibold text-gray-900"
											role="columnheader"
										>
											<div className="flex flex-col items-center gap-1">
												<span>{ __( 'Free', 'wp-ai-blogger' ) }</span>
												<span className="text-xs font-normal text-gray-600">
													{ __( '$0/month', 'wp-ai-blogger' ) }
												</span>
											</div>
										</th>
										<th
											scope="col"
											className="px-3 py-4 text-center text-base font-semibold text-gray-900"
											role="columnheader"
										>
											<div className="flex flex-col items-center gap-1">
												<span className="flex items-center gap-1">
													{ __( 'Pro', 'wp-ai-blogger' ) }
													<Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
												</span>
												<span className="text-xs font-normal text-gray-600">
													{ __( 'Starting at $9/month', 'wp-ai-blogger' ) }
												</span>
											</div>
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-200 bg-white" role="rowgroup">
									{ memoizedFeatures.map( ( feature, index ) => (
										<FeatureRow key={ `feature-${ index }` } feature={ feature } index={ index } />
									) ) }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{ /* Enhanced call-to-action section */ }
			<CallToActionSection />
		</div>
	);
};

// Add display name for debugging
FreeVsPro.displayName = 'FreeVsPro';

export default memo( FreeVsPro );
