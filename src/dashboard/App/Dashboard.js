import React from 'react';
import MainNav from './MainNav';
import { Route, Routes } from 'react-router-dom';
import PagesRoute from './PagesRoute';
import SettingsSavedNotification from './SettingsSavedNotification';

const Dashboard = () => {
	return (
		<>
			<MainNav />
			<SettingsSavedNotification />
			<Routes>
				<Route path="*" element={ <PagesRoute /> } />
			</Routes>
		</>
	);
};

export default Dashboard;
