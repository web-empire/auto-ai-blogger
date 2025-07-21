import { Fragment, useEffect, useCallback, useMemo } from 'react';
import { CheckCircleIcon, XIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';

/**
 * Enhanced notification types with different icons and styles
 */
const NotificationTypes = {
	success: {
		icon: CheckCircleIcon,
		iconColor: 'text-green-400',
		bgColor: 'bg-green-50',
		borderColor: 'border-green-200',
	},
	error: {
		icon: AlertCircleIcon,
		iconColor: 'text-red-400',
		bgColor: 'bg-red-50',
		borderColor: 'border-red-200',
	},
	warning: {
		icon: AlertCircleIcon,
		iconColor: 'text-yellow-400',
		bgColor: 'bg-yellow-50',
		borderColor: 'border-yellow-200',
	},
	info: {
		icon: InfoIcon,
		iconColor: 'text-blue-400',
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200',
	},
};

/**
 * Enhanced Settings Saved Notification component with better UX and accessibility
 */
export default function SettingsSavedNotification() {
	const dispatch = useDispatch();

	// Enhanced selector to handle different notification types
	const notification = useSelector( ( state ) => {
		const settingsNotification = state.settingsSavedNotification;

		// Debug logging
		if (settingsNotification) {
			console.log('SettingsSavedNotification received:', settingsNotification);
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
		if ( ! notification?.type ) return NotificationTypes.success;
		return NotificationTypes[ notification.type ] || NotificationTypes.success;
	}, [ notification?.type ] );

	// Early return if no notification
	if ( ! notification?.message ) {
		return null;
	}

	const { icon: IconComponent, iconColor, bgColor, borderColor } = notificationStyle;

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
					enter="transform ease-out duration-300 transition"
					enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
					enterTo="translate-y-0 opacity-100 sm:translate-x-0"
					leave="transition ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div
						className={ `max-w-sm w-full ${ bgColor } shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${ borderColor }` }
						role="alert"
					>
						<div className="p-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<IconComponent
										className={ `h-6 w-6 ${ iconColor }` }
										aria-hidden="true"
									/>
								</div>
								<div className="ml-3 w-0 flex-1 pt-0.5">
									<p
										className="text-sm font-medium text-gray-900 m-0 p-0 leading-5"
										id="notification-message"
									>
										{ notification.message }
									</p>
								</div>
								<div className="ml-4 flex-shrink-0 flex">
									<button
										type="button"
										className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-none p-1 transition-colors duration-200"
										onClick={ dismissNotification }
										aria-label={ __( 'Close notification', 'wp-ai-blogger' ) }
										aria-describedby="notification-message"
									>
										<span className="sr-only">
											{ __( 'Close notification', 'wp-ai-blogger' ) }
										</span>
										<XIcon
											className="h-5 w-5"
											aria-hidden="true"
										/>
									</button>
								</div>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</div>
	);
}
