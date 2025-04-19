import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import BrandIcon from '@AppImages/crown.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { updateApiData } from '@Utils/ApiData';
import { useDispatch } from 'react-redux';

const NavigationBar = () => {
    const abortControllerRef = useRef({});
    const dispatch = useDispatch();

    const search = useLocation().search;
    const navigate = useNavigate();
    let step = new URLSearchParams(search).get('step');
    step = step ? step : 'welcome';

    const menus = [
        {
            name: __('Welcome', 'wp-ai-blogger'),
            id: 'welcome',
        },
        {
            name: __('Site Info', 'wp-ai-blogger'),
            id: 'persona-form',
        },
        {
            name: __('Subscribe', 'wp-ai-blogger'),
            id: 'optin',
        },
        {
            name: __('Done', 'wp-ai-blogger'),
            id: 'ready',
        },
    ];

    const handleClick = (e) => {
        e.preventDefault();

        dispatch({ type: 'UPDATE_USER_ONBOARDED', payload: true });
        updateApiData('userOnboarded', true, dispatch, abortControllerRef);
    };

    const handleStepRedirection = function (e) {
        e.preventDefault();

        if (e.target.id) {
            const stepToRedirect = e.target.id;
            navigate(`${autoblog_data.admin_app_url}&step=${stepToRedirect}`);
        }
    };

    return (
        <header className="wpaib-setup-header bg-white border-b-[1px] fixed top-[32px] left-[160px] right-0 z-[999999] border-solid border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <img
                                className="block lg:hidden h-6 w-auto"
                                src={BrandIcon}
                                alt="WP Ai Blogger"
                            />
                            <img
                                className="hidden lg:block h-6 w-auto"
                                src={BrandIcon}
                                alt="WP Ai Blogger"
                            />
                        </div>
                    </div>
                    <div className="hidden md:flex lg:space-x-8 space-x-4">
                        {menus.map((menu) => {
                            return (
                                <span
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 lg:text-base font-medium focus:outline-none focus:shadow-none text-sm cursor-pointer ${
                                        step === menu.id
                                            ? 'text-gray-800 wpaib-active-state-button'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                    id={menu.id}
                                    onClick={handleStepRedirection}
                                    key={menu.id}
                                >
                                    {menu.name}
                                </span>
                            );
                        })}
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <span
                            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            onClick={handleClick}
                            title={__('Exit setup wizard', 'wp-ai-blogger')}
                        >
                            <span className="sr-only">Exit Wizard</span>
                            <X className="h-5 w-5" />
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default NavigationBar;