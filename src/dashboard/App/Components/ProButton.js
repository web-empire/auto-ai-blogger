import { __ } from '@wordpress/i18n';
import { forwardRef, useCallback, useMemo } from 'react';
import { aiClassNames } from '@Utils/aiClassNames';
import { useSelector } from 'react-redux';

/**
 * Enhanced ProButton component with better accessibility and customization
 */
const ProButton = forwardRef( ( {
	className = '',
	variant = 'primary',
	size = 'default',
	isLink = false,
	url = '',
	disabled = false,
	loading = false,
	icon = null,
	children = __( 'Upgrade to Pro', 'wp-ai-blogger' ),
	onClick,
	'aria-label': ariaLabel,
	iconPosition = 'right',
	...props
}, ref ) => {
	// Get pro purchase URL from Redux store
	const proPurchaseUrl = useSelector( ( state ) => state.proPurchaseUrl ) || 'https://wpaiblogger.com/';

	// Determine the URL to use
	const proUrl = useMemo( () => {
		return url || proPurchaseUrl;
	}, [ url, proPurchaseUrl ] );

	// Enhanced click handler with error handling
	const handleUpgrade = useCallback( ( event ) => {
		if ( disabled || loading ) {
			event.preventDefault();
			return;
		}

		// Call custom onClick if provided
		if ( onClick ) {
			onClick( event );

			// If the custom onClick prevented the default, don't open URL
			if ( event.defaultPrevented ) {
				return;
			}
		}

		// Only open URL if it's provided and not empty
		if ( proUrl && proUrl.trim() !== '' ) {
			// For links, let the browser handle the navigation
			if ( isLink ) {
				return; // Let the default link behavior handle this
			}

			// For buttons, prevent default and handle navigation via JavaScript
			event.preventDefault();
			event.stopPropagation();

			try {
				// Open in new tab with security attributes
				const newWindow = window.open( proUrl, '_blank', 'noopener,noreferrer' );

				// Fallback if popup blocked
				if ( ! newWindow ) {
					window.location.href = proUrl;
				}
			} catch ( error ) {
				console.error( 'Failed to open upgrade URL:', error );
				// Fallback to direct navigation
				window.location.href = proUrl;
			}
		}
	}, [ disabled, loading, onClick, proUrl, isLink ] );

	// Variant styles
	const variants = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
		secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:outline-slate-500',
		outline: 'border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 focus-visible:outline-indigo-600',
		ghost: 'text-indigo-600 bg-transparent hover:bg-indigo-50 focus-visible:outline-indigo-600',
		danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
	};

	// Size styles
	const sizes = {
		small: 'px-2 py-1 text-xs',
		default: 'px-3 py-2 text-sm',
		large: 'px-4 py-3 text-base',
		xl: 'px-6 py-4 text-lg',
	};

	// Base classes.
	const baseClasses = 'flex items-center gap-2 justify-center rounded-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 border-none cursor-pointer transition-all duration-200 select-none';

	// Disabled classes
	const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

	// Loading classes
	const loadingClasses = loading ? 'cursor-wait' : '';

	// Determine element tag
	const Tag = isLink ? 'a' : 'button';

	// Filter out link-specific props when rendering as button
	const { href, target, rel, ...buttonSafeProps } = props;

	// Props for link or button
	const elementProps = isLink ? {
		href: proUrl,
		target: '_blank',
		rel: 'noopener noreferrer',
		role: 'button',
	} : {
		type: 'button',
		disabled: disabled || loading,
	};

	// Enhanced children with loading state
	const buttonContent = useMemo( () => {
		if ( loading ) {
			return (
				<>
					<svg
						className="animate-spin -ml-1 mr-2 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					{ __( 'Loading…', 'wp-ai-blogger' ) }
				</>
			);
		}

		return (
			<>
				{ ( icon && 'left' === iconPosition ) && (
					<span className="flex" aria-hidden="true">
						{ icon }
					</span>
				) }
				{ children }
				{ ( icon && 'right' === iconPosition ) && (
					<span className="flex" aria-hidden="true">
						{ icon }
					</span>
				) }
			</>
		);
	}, [ loading, icon, children ] );

	return (
		<Tag
			ref={ ref }
			className={ aiClassNames(
				baseClasses,
				variants[ variant ] || variants.primary,
				sizes[ size ] || sizes.default,
				disabledClasses,
				loadingClasses,
				className
			) }
			onClick={ handleUpgrade }
			aria-label={ ariaLabel || ( typeof children === 'string' ? children : __( 'Upgrade to Pro', 'wp-ai-blogger' ) ) }
			aria-disabled={ disabled || loading }
			{ ...elementProps }
			{ ...( isLink ? props : buttonSafeProps ) }
		>
			{ buttonContent }
		</Tag>
	);
} );

ProButton.displayName = 'ProButton';

export default ProButton;
