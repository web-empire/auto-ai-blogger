import { Switch } from '@headlessui/react';
import { aiClassNames } from '@Utils/aiClassNames';

const SwitchControl = ( { checked, onChange, id = '' } ) => {
	return (
		<Switch
			id={ id }
			checked={ checked }
			onChange={ onChange }
			className={ aiClassNames(
				checked ? 'bg-indigo-600' : 'bg-slate-200',
				'group relative inline-flex h-4 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 border-none m-0 p-0'
			) }
		>
			<span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-white" />
			<span
				aria-hidden="true"
				className={ aiClassNames(
					checked ? 'bg-indigo-600' : 'bg-gray-200',
					'pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out'
				) }
			/>
			<span
				aria-hidden="true"
				className={ aiClassNames(
					checked ? 'translate-x-5' : 'translate-x-0',
					'toggle-bubble pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out'
				) }
			/>
		</Switch>
	);
};

export default SwitchControl;
