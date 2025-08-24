import { forwardRef, useCallback, useState, useId } from 'react';
import { __ } from '@wordpress/i18n';

/**
 * DateTimeField component for campaign start date selection
 */
const DateTimeField = forwardRef( ( {
	id,
	name,
	value,
	defaultValue = '',
	onChange,
	onBlur,
	onFocus,
	disabled = false,
	required = false,
	readOnly = false,
	error = '',
	helperText = '',
	className = '',
	placeholder = '',
	'aria-label': ariaLabel,
	'aria-describedby': ariaDescribedBy,
	...props
}, ref ) => {
	const autoId = useId();
	const inputId = id || autoId;
	const [ isFocused, setIsFocused ] = useState( false );

	// Helper text ID for ARIA
	const helperTextId = helperText ? `${ inputId }-helper` : undefined;
	const errorTextId = error ? `${ inputId }-error` : undefined;

	// Build aria-describedby
	const describedBy = [
		ariaDescribedBy,
		helperTextId,
		errorTextId,
	].filter( Boolean ).join( ' ' ) || undefined;

	/**
	 * Format date string for datetime-local input
	 * Accepts various date formats and converts to YYYY-MM-DDTHH:mm format
	 */
	const formatDateTimeLocal = useCallback( ( dateValue ) => {
		if ( ! dateValue ) {
			return '';
		}

		try {
			const date = new Date( dateValue );
			if ( isNaN( date.getTime() ) ) {
				return '';
			}

			// Format to YYYY-MM-DDTHH:mm (required for datetime-local input)
			const year = date.getFullYear();
			const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
			const day = String( date.getDate() ).padStart( 2, '0' );
			const hours = String( date.getHours() ).padStart( 2, '0' );
			const minutes = String( date.getMinutes() ).padStart( 2, '0' );

			return `${ year }-${ month }-${ day }T${ hours }:${ minutes }`;
		} catch ( e ) {
			return '';
		}
	}, [] );

	/**
	 * Convert datetime-local value to ISO string for consistency
	 */
	const formatOutputDate = useCallback( ( dateTimeLocalValue ) => {
		if ( ! dateTimeLocalValue ) {
			return '';
		}

		try {
			const date = new Date( dateTimeLocalValue );
			if ( isNaN( date.getTime() ) ) {
				return '';
			}

			return date.toISOString();
		} catch ( e ) {
			return '';
		}
	}, [] );

	// Enhanced change handler
	const handleChange = useCallback( ( event ) => {
		const newValue = event.target.value;
		const formattedDate = formatOutputDate( newValue );

		// Create a custom event object with the formatted date
		const customEvent = {
			...event,
			target: {
				...event.target,
				value: formattedDate,
			},
		};

		onChange?.( customEvent );
	}, [ onChange, formatOutputDate ] );

	// Enhanced focus handlers
	const handleFocus = useCallback( ( event ) => {
		setIsFocused( true );
		onFocus?.( event );
	}, [ onFocus ] );

	const handleBlur = useCallback( ( event ) => {
		setIsFocused( false );
		onBlur?.( event );
	}, [ onBlur ] );

	// Get current value formatted for datetime-local input
	const formattedValue = formatDateTimeLocal( value || defaultValue );

	// State-based styles
	const getStateStyles = () => {
		if ( error ) {
			return 'outline-red-300 focus:outline-red-600 text-red-900';
		}
		return '';
	};

	// Combine classes following the same pattern as other inputs in ConfigureDrawer
	const inputClasses = `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 transition-colors duration-200 ${
		readOnly
			? 'bg-gray-50 outline-gray-200 cursor-default'
			: 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600'
	} ${
		disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
	} ${
		getStateStyles()
	} ${
		isFocused && ! readOnly ? 'ring-2 ring-indigo-500 ring-opacity-20' : ''
	}`;

	return (
		<div className={ `datetime-field-wrapper ${ className }` }>
			<input
				ref={ ref }
				id={ inputId }
				name={ name || inputId }
				type="datetime-local"
				value={ formattedValue }
				placeholder={ placeholder || __( 'Select date and time', 'wp-ai-blogger' ) }
				disabled={ disabled }
				required={ required }
				readOnly={ readOnly }
				className={ inputClasses }
				onChange={ handleChange }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				aria-label={ ariaLabel || __( 'Select campaign start date and time', 'wp-ai-blogger' ) }
				aria-describedby={ describedBy }
				aria-invalid={ Boolean( error ) }
				aria-required={ required }
				{ ...props }
			/>

			{ helperText && (
				<p
					id={ helperTextId }
					className="mt-1 text-sm text-gray-600"
				>
					{ helperText }
				</p>
			) }

			{ error && (
				<p
					id={ errorTextId }
					className="mt-1 text-sm text-red-600"
					role="alert"
					aria-live="polite"
				>
					{ error }
				</p>
			) }
		</div>
	);
} );

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;
