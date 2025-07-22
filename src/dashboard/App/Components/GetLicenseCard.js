import React, { memo } from 'react';
import { __ } from '@wordpress/i18n';
import { Shield, ExternalLink } from 'lucide-react';

/**
 * Reusable Get License Card component
 * Used in both License settings and LicenseStep wizard
 */
const GetLicenseCard = memo(({ upgradeLink }) => (
	<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
		<div className="flex items-center gap-3 mb-3">
			<div className="p-2 bg-blue-100 rounded-lg">
				<Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
			</div>
			<div>
				<h3 className="text-sm font-semibold text-gray-900">
					{__('No License Key?', 'wp-ai-blogger')}
				</h3>
				<p className="text-xs text-gray-600">
					{__('Get started with free credits today', 'wp-ai-blogger')}
				</p>
			</div>
		</div>
		<a
			href={upgradeLink}
			target="_blank"
			rel="noopener noreferrer"
			className="
				inline-flex items-center gap-2 text-sm font-medium text-blue-600
				hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
				focus:ring-offset-2 rounded transition-colors duration-200
			"
			aria-label={__('Get free credits - opens in new tab', 'wp-ai-blogger')}
		>
			{__('Get Free Credits', 'wp-ai-blogger')}
			<ExternalLink className="w-3 h-3" aria-hidden="true" />
		</a>
	</div>
));

GetLicenseCard.displayName = 'GetLicenseCard';

export default GetLicenseCard;
