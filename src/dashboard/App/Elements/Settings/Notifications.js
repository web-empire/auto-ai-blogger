import React, { useState, useCallback, memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { Mail, MessageCircle, Bell, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import SwitchControl from '@Components/SwitchControl';
import SettingsContainer from '@Components/SettingsContainer';
import InfoCard from '@Components/InfoCard';

// Enhanced notification type component.
const NotificationCard = memo( ( {
	icon,
	title,
	description,
	enabled,
	onToggle,
	inputValue,
	onInputChange,
	inputPlaceholder,
	inputType = 'text',
	helpText,
	validationPattern,
	disabled = false,
} ) => {
	const [ isValid, setIsValid ] = useState( true );
	const [ validationMessage, setValidationMessage ] = useState( '' );

	// Enhanced validation
	const validateInput = useCallback( ( value ) => {
		if ( ! enabled || ! value.trim() ) {
			setIsValid( true );
			setValidationMessage( '' );
			return true;
		}

		if ( validationPattern ) {
			const isValidPattern = validationPattern.test( value );
			setIsValid( isValidPattern );

			if ( ! isValidPattern ) {
				if ( inputType === 'email' ) {
					setValidationMessage( __( 'Please enter valid email address(es)', 'wp-ai-blogger' ) );
				} else if ( inputType === 'tel' ) {
					setValidationMessage( __( 'Please enter a valid phone number', 'wp-ai-blogger' ) );
				} else {
					setValidationMessage( __( 'Invalid format', 'wp-ai-blogger' ) );
				}
			} else {
				setValidationMessage( '' );
			}
			return isValidPattern;
		}

		setIsValid( true );
		setValidationMessage( '' );
		return true;
	}, [ enabled, validationPattern, inputType ] );

	const handleInputChange = useCallback( ( e ) => {
		const value = e.target.value;
		onInputChange( value );
		validateInput( value );
	}, [ onInputChange, validateInput ] );

	return (
		<div className={ `border rounded-lg transition-all duration-200 ${ enabled ? 'p-4 border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white' }` }>
			{ /* Header */ }
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-start gap-3">
					<div className={ `flex p-2 rounded-lg ${ enabled ? 'bg-indigo-100' : 'bg-gray-100' }` }>
						{ React.cloneElement( icon, {
							className: `flex w-5 h-5 ${ enabled ? 'text-indigo-600' : 'text-gray-400' }`,
						} ) }
					</div>

					<div className='flex flex-col gap-1'>
						<h3 className={ `text-lg font-semibold p-0 m-0 ${ enabled ? 'text-indigo-900' : 'text-gray-900' }` }>
							{ title }
						</h3>
						<p className={ `text-sm ${ enabled ? 'text-indigo-700' : 'text-gray-600' }` }>
							{ description }
						</p>
					</div>
				</div>

				<SwitchControl
					checked={ enabled }
					onChange={ onToggle }
					disabled={ disabled }
					aria-label={ __( 'Toggle', 'wp-ai-blogger' ) + ` ${ title }` }
				/>
			</div>

			{ /* Input field */ }
			{ enabled && (
				<div className="space-y-3">
					<div className="relative">
						<input
							type={ inputType }
							value={ inputValue }
							onChange={ handleInputChange }
							placeholder={ inputPlaceholder }
							disabled={ disabled }
							className={ `
								block w-full px-3 py-2 text-sm border rounded-lg
								bg-white text-gray-900 placeholder:text-gray-400
								focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
								transition-colors duration-200
								${ ! isValid ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300' }
								${ disabled ? 'bg-gray-50 cursor-not-allowed' : '' }
							` }
							aria-describedby={ `${ title.toLowerCase().replace( ' ', '-' ) }-help` }
							aria-invalid={ ! isValid }
						/>

						{ /* Validation indicator */ }
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							{ inputValue && (
								isValid ? (
									<CheckCircle2 className="w-4 h-4 text-green-500" />
								) : (
									<AlertCircle className="w-4 h-4 text-red-500" />
								)
							) }
						</div>
					</div>

					{ /* Help text and validation */ }
					<div className="space-y-1">
						{ validationMessage && (
							<p className="text-xs text-red-600 flex items-center gap-1">
								<AlertCircle className="w-3 h-3" />
								{ validationMessage }
							</p>
						) }
						{ helpText && (
							<p id={ `${ title.toLowerCase().replace( ' ', '-' ) }-help` } className="text-xs text-gray-500">
								{ helpText }
							</p>
						) }
					</div>
				</div>
			) }
		</div>
	);
} );

NotificationCard.displayName = 'NotificationCard';

// Enhanced notifications settings component
const Notifications = memo( () => {
	// Local state for notifications
	const [ notifications, setNotifications ] = useState( {
		email: {
			enabled: false,
			value: ( typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.admin_email ) || '',
		},
		whatsapp: {
			enabled: false,
			value: '',
		},
		sms: {
			enabled: false,
			value: '',
		},
	} );

	// Email validation pattern (supports multiple emails)
	const emailPattern = useMemo( () =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+(?:\s*,\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/,
	[]
	);

	// Phone validation pattern (international format)
	const phonePattern = useMemo( () =>
		/^\+?[1-9]\d{1,14}$/,
	[]
	);

	// Toggle handlers
	const toggleEmail = useCallback( () => {
		setNotifications( ( prev ) => ( {
			...prev,
			email: { ...prev.email, enabled: ! prev.email.enabled },
		} ) );
	}, [] );

	const toggleWhatsApp = useCallback( () => {
		setNotifications( ( prev ) => ( {
			...prev,
			whatsapp: { ...prev.whatsapp, enabled: ! prev.whatsapp.enabled },
		} ) );
	}, [] );

	const toggleSMS = useCallback( () => {
		setNotifications( ( prev ) => ( {
			...prev,
			sms: { ...prev.sms, enabled: ! prev.sms.enabled },
		} ) );
	}, [] );

	// Input change handlers
	const updateEmail = useCallback( ( value ) => {
		setNotifications( ( prev ) => ( {
			...prev,
			email: { ...prev.email, value },
		} ) );
	}, [] );

	const updateWhatsApp = useCallback( ( value ) => {
		setNotifications( ( prev ) => ( {
			...prev,
			whatsapp: { ...prev.whatsapp, value },
		} ) );
	}, [] );

	const updateSMS = useCallback( ( value ) => {
		setNotifications( ( prev ) => ( {
			...prev,
			sms: { ...prev.sms, value },
		} ) );
	}, [] );

	return (
		<div className="space-y-6">
			{ /* Settings container */ }
			<SettingsContainer
				element={
					<div className="space-y-6">
						{ /* Email notifications */ }
						<NotificationCard
							icon={ <Mail /> }
							title={ __( 'Email Notifications', 'wp-ai-blogger' ) }
							description={ __( 'Receive notifications via email.', 'wp-ai-blogger' ) }
							enabled={ notifications.email.enabled }
							onToggle={ toggleEmail }
							inputValue={ notifications.email.value }
							onInputChange={ updateEmail }
							inputPlaceholder={ __( 'admin@example.com, editor@example.com', 'wp-ai-blogger' ) }
							inputType="email"
							helpText={ __( 'Enter multiple email addresses separated by commas for team notifications.', 'wp-ai-blogger' ) }
							validationPattern={ emailPattern }
						/>

						{ /* WhatsApp notifications */ }
						<NotificationCard
							icon={ <MessageCircle /> }
							title={ __( 'WhatsApp Notifications', 'wp-ai-blogger' ) }
							description={ __( 'Receive instant notifications on WhatsApp.', 'wp-ai-blogger' ) }
							enabled={ notifications.whatsapp.enabled }
							onToggle={ toggleWhatsApp }
							inputValue={ notifications.whatsapp.value }
							onInputChange={ updateWhatsApp }
							inputPlaceholder={ __( '+1234567890', 'wp-ai-blogger' ) }
							inputType="tel"
							helpText={ __( 'Enter your WhatsApp number with country code (e.g., +1234567890).', 'wp-ai-blogger' ) }
							validationPattern={ phonePattern }
						/>

						{ /* SMS notifications */ }
						<NotificationCard
							icon={ <Phone /> }
							title={ __( 'SMS Notifications', 'wp-ai-blogger' ) }
							description={ __( 'Receive text message alerts.', 'wp-ai-blogger' ) }
							enabled={ notifications.sms.enabled }
							onToggle={ toggleSMS }
							inputValue={ notifications.sms.value }
							onInputChange={ updateSMS }
							inputPlaceholder={ __( '+1234567890', 'wp-ai-blogger' ) }
							inputType="tel"
							helpText={ __( 'SMS notifications for critical alerts and publishing confirmations.', 'wp-ai-blogger' ) }
							validationPattern={ phonePattern }
						/>

						{ /* Information box */ }
						<InfoCard
							icon={ Bell }
							title={ __( 'Notification Types', 'wp-ai-blogger' ) }
							items={ [
								__( 'New content generated and ready for review.', 'wp-ai-blogger' ),
								__( 'Auto-scheduled posts about to be published.', 'wp-ai-blogger' ),
								__( 'Content generation errors or issues.', 'wp-ai-blogger' ),
								__( 'Campaign completion and performance summaries.', 'wp-ai-blogger' ),
							] }
							colorScheme="blue"
							className="mt-6"
							ariaLabel={ __( 'Types of notifications you can receive', 'wp-ai-blogger' ) }
						/>
					</div>
				}
				className="bg-white shadow-sm rounded-lg border border-gray-200"
			/>
		</div>
	);
} );

Notifications.displayName = 'NotificationSettings';

export default Notifications;
