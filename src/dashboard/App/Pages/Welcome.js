import React from 'react';
import { __ } from '@wordpress/i18n';
import { PostIdeas, CampaignsInsights } from '@Elements/Welcome';

export default function Welcome() {
	return (
		<>
			<CampaignsInsights />
			<PostIdeas />
		</>
	);
}
