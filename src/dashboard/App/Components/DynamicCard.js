import React, { memo } from 'react';
import { __ } from '@wordpress/i18n';
import { Shield, ExternalLink } from 'lucide-react';

/**
 * Reusable Dynamic Card component
 * Used for promotional content, informational cards, and call-to-action sections
 */
const DynamicCard = memo( ( {
	// Content props
	icon: Icon = Shield,
	heading,
	subHeading,
	additionalInfo,
	linkText,
	linkUrl,
	linkIcon: LinkIcon = ExternalLink,

	// Styling props
	size = 'medium', // 'small', 'medium', 'large'
	colorScheme = 'blue', // 'blue', 'indigo', 'green', 'purple', 'red'
	className = '',

	// Behavior props
	openInNewTab = true,
	onLinkClick,

	// Accessibility props
	ariaLabel,
} ) => {
	// Size configurations
	const sizeConfig = {
		small: {
			container: 'p-3',
			iconContainer: 'p-1.5',
			iconSize: 'w-4 h-4',
			heading: 'text-xs font-semibold',
			subHeading: 'text-xs',
			additionalInfo: 'text-xs',
			linkText: 'text-xs font-medium',
			linkIconSize: 'w-3 h-3',
			gap: 'gap-2',
			marginBottom: 'mb-2',
			headingMarginBottom: '!mb-1',
		},
		medium: {
			container: 'p-4',
			iconContainer: 'p-2',
			iconSize: 'w-5 h-5',
			heading: 'text-lg font-semibold text-gray-900',
			subHeading: 'text-xs',
			additionalInfo: 'text-xs',
			linkText: 'text-sm font-medium',
			linkIconSize: 'w-3 h-3',
			gap: 'gap-3',
			marginBottom: 'mb-3',
			headingMarginBottom: '!mb-6',
		},
		large: {
			container: 'p-6',
			iconContainer: 'p-3',
			iconSize: 'w-6 h-6',
			heading: 'text-2xl font-bold text-gray-900',
			subHeading: 'text-sm',
			additionalInfo: 'text-sm',
			linkText: 'text-base font-medium',
			linkIconSize: 'w-4 h-4',
			gap: 'gap-4',
			marginBottom: 'mb-4',
			headingMarginBottom: '!mb-9',
		},
	};

	// Color scheme configurations
	const colorConfig = {
		blue: {
			background: 'bg-gradient-to-r from-blue-50 to-indigo-50',
			border: 'border-blue-200',
			iconBg: 'bg-blue-100',
			iconColor: 'text-blue-600',
			linkColor: 'text-blue-600 hover:text-blue-700',
			focusRing: 'focus:ring-blue-500',
		},
		indigo: {
			background: 'bg-gradient-to-r from-indigo-50 to-purple-50',
			border: 'border-indigo-200',
			iconBg: 'bg-indigo-100',
			iconColor: 'text-indigo-600',
			linkColor: 'text-indigo-600 hover:text-indigo-700',
			focusRing: 'focus:ring-indigo-500',
		},
		green: {
			background: 'bg-gradient-to-r from-green-50 to-emerald-50',
			border: 'border-green-200',
			iconBg: 'bg-green-100',
			iconColor: 'text-green-600',
			linkColor: 'text-green-600 hover:text-green-700',
			focusRing: 'focus:ring-green-500',
		},
		purple: {
			background: 'bg-gradient-to-r from-purple-50 to-pink-50',
			border: 'border-purple-200',
			iconBg: 'bg-purple-100',
			iconColor: 'text-purple-600',
			linkColor: 'text-purple-600 hover:text-purple-700',
			focusRing: 'focus:ring-purple-500',
		},
		red: {
			background: 'bg-gradient-to-r from-red-50 to-pink-50',
			border: 'border-red-200',
			iconBg: 'bg-red-100',
			iconColor: 'text-red-600',
			linkColor: 'text-red-600 hover:text-red-700',
			focusRing: 'focus:ring-red-500',
		},
	};

	const currentSize = sizeConfig[ size ] || sizeConfig.medium;
	const currentColor = colorConfig[ colorScheme ] || colorConfig.blue;

	const handleLinkClick = ( e ) => {
		if ( onLinkClick ) {
			e.preventDefault();
			onLinkClick( e );
		}
	};

	// If no content provided, don't render anything
	if ( ! heading && ! subHeading && ! additionalInfo && ! linkText ) {
		return null;
	}

	return (
		<div className={ `
			mt-6 ${ currentSize.container } ${ currentColor.background }
			border ${ currentColor.border } rounded-xl ${ className }
		` }>
			{ /* Header section with icon and text */ }
			{ ( Icon || heading || subHeading ) && (
				<div className={ `flex items-center ${ currentSize.gap } ${ currentSize.marginBottom }` }>
					{ Icon && (
						<div className={ `${ currentSize.iconContainer } ${ currentColor.iconBg } rounded-lg` }>
							<Icon className={ `${ currentSize.iconSize } ${ currentColor.iconColor }` } aria-hidden="true" />
						</div>
					) }
					{ ( heading || subHeading ) && (
						<div>
							{ heading && (
								<h3 className={ `${ currentSize.heading } !mt-0 ${ subHeading ? currentSize.headingMarginBottom : '!mb-0' }` }>
									{ heading }
								</h3>
							) }
							{ subHeading && (
								<p className={ `${ currentSize.subHeading } text-gray-600` }>
									{ subHeading }
								</p>
							) }
						</div>
					) }
				</div>
			) }

			{ /* Additional info section */ }
			{ additionalInfo && (
				<div className={ `${ currentSize.additionalInfo } text-gray-600 ${ linkText ? currentSize.marginBottom : '' }` }>
					{ additionalInfo }
				</div>
			) }

			{ /* Link section */ }
			{ linkText && linkUrl && (
				<a
					href={ linkUrl }
					target={ openInNewTab ? '_blank' : undefined }
					rel={ openInNewTab ? 'noopener noreferrer' : undefined }
					onClick={ handleLinkClick }
					className={ `
						inline-flex items-center gap-2 ${ currentSize.linkText } ${ currentColor.linkColor }
						focus:outline-none focus:ring-2 ${ currentColor.focusRing }
						focus:ring-offset-2 rounded transition-colors duration-200
					` }
					aria-label={ ariaLabel || ( openInNewTab ? `${ linkText } - opens in new tab` : linkText ) }
				>
					{ linkText }
					{ LinkIcon && <LinkIcon className={ currentSize.linkIconSize } aria-hidden="true" /> }
				</a>
			) }
		</div>
	);
} );

DynamicCard.displayName = 'DynamicCard';

export default DynamicCard;
