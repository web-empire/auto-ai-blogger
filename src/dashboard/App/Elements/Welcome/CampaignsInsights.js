import React from 'react';
import { __ } from '@wordpress/i18n';
import { MoveRight, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const campaigns = wpaib_localized_data.all_campaigns || {};

export default function CampaignsInsights() {
	const navigate = useNavigate();
	const licenseStatus = useSelector( ( state ) => state.licenseStatus ) || 'unlicensed';

	const handlePersonaClick = ( event ) => {
		event.preventDefault(); // Prevent the default link behavior
		navigate( `?page=${ wpaib_localized_data.home_slug }&path=settings` ); // Navigate to the settings tab
	};

	if ( 'unlicensed' === licenseStatus ) {
		return (
			<div className="flex flex-col items-center justify-center gap-y-3 border border-dashed border-gray-300 rounded-md p-6 max-w-lg mx-auto mt-20">
				<Lock className="w-8 h-8 text-gray-400" />
				<h3 className="text-base font-semibold text-gray-900 m-0 p-0">
					{ __( 'License Required', 'wp-ai-blogger' ) }
				</h3>
				<p className="text-sm text-gray-500">
					{ __( 'Get Started by Activating Your License.', 'wp-ai-blogger' ) }
				</p>
				<button
					type="button"
					className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer m-2 flex gap-x-2 items-center"
					onClick={ handlePersonaClick }
				>
					{ __( 'Go to License Settings', 'wp-ai-blogger' ) }
					<MoveRight className="h-5 w-5" />
				</button>
			</div>
		);
	}

	if ( ! campaigns || Object.keys( campaigns ).length === 0 ) {
		return (
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				<h3 className="text-base font-semibold text-gray-900"> { __( 'Campaigns Insights', 'wp-ai-blogger' ) } </h3>
				<p className="mt-2 text-sm text-gray-500"> { __( 'No campaigns available at the moment.', 'wp-ai-blogger' ) } </p>
			</div>
		);
	}

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<h3 className="text-base font-semibold text-gray-900"> { __( 'Campaigns Insights', 'wp-ai-blogger' ) } </h3>

			<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{ Object.values( campaigns ).map( ( campaign ) => (
					<div
						key={ campaign.id }
						className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
					>
						<div className="campaigns-insight-wrap">
							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Posts', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.postsCreated }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Total Visits', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.postsVisit }</div>
							</div>

							<div className="insight-inner-wrap">
								<div className="m-0 p-0 truncate text-sm font-medium text-gray-500">{ __( 'Last Run on', 'wp-ai-blogger' ) }</div>
								<div className="text-base font-semibold text-gray-900 m-0 p-0">{ campaign.lastRun }</div>
							</div>
						</div>

						<div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
							<div className="text-sm">
								<a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 flex campaigns-center justify-between w-full">
									<span> { campaign.name } </span>
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
