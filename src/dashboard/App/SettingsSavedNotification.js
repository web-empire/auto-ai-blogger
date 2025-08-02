import { Fragment, useEffect, useCallback, useMemo } from 'react';
import { CheckCircleIcon, XIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';

/**
 * Enhanced notification types with modern gradient designs and animations
 */
const NotificationTypes = {
	success: {
		icon: CheckCircleIcon,
		iconColor: 'text-emerald-500',
		bgGradient: 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50',
		borderColor: 'border-emerald-200',
		shadowColor: 'shadow-emerald-100/50',
		accentColor: 'bg-emerald-500',
		iconBg: 'bg-emerald-100',
	},
	error: {
		icon: AlertCircleIcon,
		iconColor: 'text-red-500',
		bgGradient: 'bg-gradient-to-r from-red-50 via-pink-50 to-red-50',
		borderColor: 'border-red-200',
		shadowColor: 'shadow-red-100/50',
		accentColor: 'bg-red-500',
		iconBg: 'bg-red-100',
	},
	warning: {
		icon: AlertCircleIcon,
		iconColor: 'text-amber-500',
		bgGradient: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50',
		borderColor: 'border-amber-200',
		shadowColor: 'shadow-amber-100/50',
		accentColor: 'bg-amber-500',
		iconBg: 'bg-amber-100',
	},
	info: {
		icon: InfoIcon,
		iconColor: 'text-blue-500',
		bgGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50',
		borderColor: 'border-blue-200',
		shadowColor: 'shadow-blue-100/50',
		accentColor: 'bg-blue-500',
		iconBg: 'bg-blue-100',
	},
};

/**
 * Enhanced Settings Saved Notification component with premium styling and animations
 */
export default function SettingsSavedNotification() {
	const dispatch = useDispatch();

	// Enhanced selector to handle different notification types
	const notification = useSelector( ( state ) => {
		const settingsNotification = state.settingsSavedNotification;

		// Debug logging
		if ( settingsNotification ) {
			console.log( 'SettingsSavedNotification received:', settingsNotification );
		}

		// Support both string and object notifications
		if ( typeof settingsNotification === 'string' ) {
			return {
				message: settingsNotification,
				type: 'success',
				duration: 3000,
			};
		}

		if ( settingsNotification && typeof settingsNotification === 'object' ) {
			return {
				message: settingsNotification.message || '',
				type: settingsNotification.type || 'success',
				duration: settingsNotification.duration || 3000,
			};
		}

		return null;
	} );

	// Memoized dismiss action
	const dismissNotification = useCallback( () => {
		dispatch( {
			type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
			payload: '',
		} );
	}, [ dispatch ] );

	// Auto-dismiss effect with proper cleanup
	useEffect( () => {
		if ( notification?.message ) {
			const timer = setTimeout( () => {
				dismissNotification();
			}, notification.duration );

			return () => clearTimeout( timer );
		}
	}, [ notification, dismissNotification ] );

	// Memoized notification styles
	const notificationStyle = useMemo( () => {
		if ( ! notification?.type ) {
			return NotificationTypes.success;
		}
		return NotificationTypes[ notification.type ] || NotificationTypes.success;
	}, [ notification?.type ] );

	// Early return if no notification
	if ( ! notification?.message ) {
		return null;
	}

	const { icon: IconComponent, iconColor, bgGradient, borderColor, shadowColor, accentColor, iconBg } = notificationStyle;

	return (
		<div
			aria-live="assertive"
			aria-atomic="true"
			className="fixed flex px-3 py-6 pointer-events-none sm:py-6 sm:items-start top-[15px] right-0 w-full z-[1000001]"
			role="region"
			aria-label="Notifications"
		>
			<div className="w-full flex flex-col items-center space-y-4 sm:items-end">
				<Transition
					show={ Boolean( notification.message ) }
					as={ Fragment }
					enter="transform ease-out duration-500 transition-all"
					enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2 scale-95"
					enterTo="translate-y-0 opacity-100 sm:translate-x-0 scale-100"
					leave="transition ease-in duration-300"
					leaveFrom="opacity-100 scale-100"
					leaveTo="opacity-0 scale-95"
				>
					<div
						className={ `
							max-w-sm w-full ${ bgGradient }
							shadow-xl ${ shadowColor }
							rounded-2xl pointer-events-auto
							ring-1 ring-black/5
							overflow-hidden
							border ${ borderColor }
							notification-container notification-card
							transform transition-all duration-300
							relative
						` }
						role="alert"
					>
						{ /* Animated progress bar with CSS animation */ }
						<div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/30 overflow-hidden">
							<div
								className={ `h-full ${ accentColor } transform origin-left notification-progress` }
								style={ { '--duration': `${ notification.duration }ms` } }
							/>
						</div>

						{ /* Main content */ }
						<div className="p-5 pt-6">
							<div className="flex items-start gap-4">
								{ /* Enhanced icon with background and subtle animation */ }
								<div className={ `
									flex-shrink-0 w-10 h-10 ${ iconBg } rounded-full
									flex items-center justify-center
									ring-2 ring-white shadow-sm
									transform transition-all duration-500
									animate-pulse
								` }>
									<IconComponent
										className={ `h-5 w-5 ${ iconColor } drop-shadow-sm` }
										aria-hidden="true"
									/>
								</div>

								{ /* Message content with better typography */ }
								<div className="flex-1 pt-1">
									<p
										className="text-sm font-semibold text-gray-900 m-0 p-0 leading-6 tracking-wide"
										id="notification-message"
									>
										{ notification.message }
									</p>
								</div>

								{ /* Enhanced close button with better UX */ }
								<div className="flex-shrink-0">
									<button
										type="button"
										className="
											bg-white/80 backdrop-blur-sm rounded-full
											inline-flex text-gray-400 hover:text-gray-600
											focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
											border-none p-2 transition-all duration-200
											hover:bg-white hover:shadow-lg
											transform hover:scale-110 hover:rotate-90
											group
										"
										onClick={ dismissNotification }
										aria-label={ __( 'Close notification', 'wp-ai-blogger' ) }
										aria-describedby="notification-message"
									>
										<span className="sr-only">
											{ __( 'Close notification', 'wp-ai-blogger' ) }
										</span>
										<XIcon
											className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
											aria-hidden="true"
										/>
									</button>
								</div>
							</div>
						</div>

						{ /* Add CSS for progress bar animation */ }
						<style>{ `
							.notification-progress {
								animation: shrinkWidth var(--duration) linear forwards;
							}
						` }</style>
					</div>
				</Transition>
			</div>
		</div>
	);
}
