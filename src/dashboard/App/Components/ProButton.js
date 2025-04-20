import { __ } from '@wordpress/i18n';
import { aiClassNames } from '@Utils/aiClassNames';

const ProButton = ( {
	className,
	isLink = false,
	url = 'https://wpaiblogger.com/',
	children = __( 'Upgrade', 'wp-ai-blogger' ),
} ) => {
	const onUpgradePro = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		window.open( url, '_blank' );
	};

	const Tag = isLink ? 'a' : 'button';

	const linkProps = isLink && {
		role: 'button',
		href: url,
		target: '_blank',
		rel: 'noreferrer',
	};

	return (
		<Tag
			className={ aiClassNames(
				'block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer',
				className
			) }
			onClick={ onUpgradePro }
			{ ...linkProps }
		>
			{ children }
		</Tag>
	);
};

export default ProButton;
