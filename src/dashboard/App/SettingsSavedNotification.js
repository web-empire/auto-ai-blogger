import { Fragment, useEffect } from 'react';
import { CheckCircleIcon, XIcon } from 'lucide-react';
import { Transition } from '@headlessui/react';

import { useSelector, useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';

export default function SettingsSavedNotification() {
	const dispatch = useDispatch();

	const settingsSavedNotification = useSelector( ( state ) => state.settingsSavedNotification );

	useEffect( () => {
		if ( '' !== settingsSavedNotification ) {
			setTimeout( () => {
				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: '',
				} );
			}, 2000 );
		}
	}, [ settingsSavedNotification ] );

	if ( ! settingsSavedNotification ) {
		return;
	}

	return (
		<div
			aria-live="assertive"
			className="fixed flex px-3 py-6 pointer-events-none sm:py-6 sm:items-start top-[15px] right-0 w-full z-[1000001]"
		>
			<div className="w-full flex flex-col items-center space-y-4 sm:items-end">
				<Transition
					show={ '' === settingsSavedNotification ? false : true }
					as={ Fragment }
					enter="transform ease-out duration-300 transition"
					enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
					enterTo="translate-y-0 opacity-100 sm:translate-x-0"
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
						<div className="p-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<CheckCircleIcon className="h-6 w-6 text-green-400" />
								</div>
								<div className="ml-3 w-0 flex-1 pt-0.5">
									<p className="text-sm font-medium text-gray-900 m-0 p-0">{ settingsSavedNotification }</p>
								</div>
								<div className="ml-4 flex-shrink-0 flex">
									<button
										className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none border-none"
										onClick={ () => {
											dispatch( {
												type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
												payload: '',
											} );
										} }
									>
										<span className="sr-only">{ __( 'Close ', 'wp-ai-blogger' ) }</span>
										<XIcon className="h-5 w-5" />
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
