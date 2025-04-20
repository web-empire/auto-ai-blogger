import Wizard from './Wizard';
import Dashboard from './Dashboard';
import AppLoader from '@Components/AppLoader';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

const Entry = () => {
	const dispatch = useDispatch();

	const initialStateSetFlag = useSelector( ( state ) => state.initialStateSetFlag );
	const userOnboarded = useSelector( ( state ) => state.userOnboarded );

	useEffect( () => {
		dispatch( {
			type: 'UPDATE_INITIAL_STATE_FLAG',
			payload: initialStateSetFlag,
		} );
	}, [ initialStateSetFlag ] );

	if ( ! initialStateSetFlag ) {
		return <AppLoader />;
	}

	if ( userOnboarded ) {
		return <Dashboard />;
	}

	return <Wizard />;
};

export default Entry;
