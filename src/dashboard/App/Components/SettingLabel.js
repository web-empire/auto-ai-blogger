const SettingLabel = ( { forId, title } ) => {
	return (
		<label htmlFor={ forId } className="text-sm font-medium text-[#4b5563]">{ title }</label>
	);
};

export default SettingLabel;
