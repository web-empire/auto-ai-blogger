const SettingsContainer = ( { title, description, element } ) => {
	return (
		<>
			<div className="flex gap-x-2 flex-col mb-4">
				<h2 className="text-base/7 font-semibold text-gray-900 p-0 m-0"> { title } </h2>
				<p className="mt-1 text-sm/6 text-gray-500">
					{ description }
				</p>
			</div>

			<div className="p-6 shadow-sm bg-white border-solid border-[#e5e7eb] rounded-md flex flex-col gap-y-4">
				{ element }
			</div>
		</>
	);
};

export default SettingsContainer;
