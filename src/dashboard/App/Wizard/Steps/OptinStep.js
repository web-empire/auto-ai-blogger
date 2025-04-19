import React, { useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';
import { useNavigate } from 'react-router-dom';

const OptinStep = () => {
    const abortControllerRef = useRef({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userName = useSelector((state) => state.userName);
    const userEmail = useSelector((state) => state.userEmail);
    const siteTitle = useSelector((state) => state.siteTitle);
    const siteFor = useSelector((state) => state.siteFor);
    const siteDescription = useSelector((state) => state.siteDescription);

    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);

    const [savingOptin, setSavingOptin] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setName(userName);
    }, [userName]);

    useEffect(() => {
        setEmail(userEmail);
    }, [userEmail]);

    useEffect(() => {
        dispatch({ type: 'UPDATE_ONBOARDING_TAB', payload: 'optin' });
    }, []);

    const updateName = function (e) {
        setName(e.target.value);
        dispatch({ type: 'UPDATE_USER_NAME', payload: e.target.value });
    };

    const updateEmail = function (e) {
        setEmail(e.target.value);
        dispatch({ type: 'UPDATE_USER_EMAIL', payload: e.target.value });
    };

    const handleStepRedirection = function (stepToRedirect) {
        navigate(`${autoblog_data.admin_app_url}&step=${stepToRedirect}`);
    };

    const submitOptinForm = async function (e) {
        e.preventDefault();

        setSavingOptin(true);
        setError('');

        if (!name) {
            setSavingOptin(false);
            setError(__('Please enter your First Name.', 'wp-ai-blogger'));
            return;
        }

        if (!email) {
            setSavingOptin(false);
            setError(__('Please enter your Email Address.', 'wp-ai-blogger'));
            return;
        }

        if (!siteTitle) {
            setSavingOptin(false);
            setError(__('Please enter your Site Title.', 'wp-ai-blogger'));
            handleStepRedirection('persona-form');
            return;
        }
        if (!siteFor) {
            setSavingOptin(false);
            setError(__('Please select the Site For.', 'wp-ai-blogger'));
            handleStepRedirection('persona-form');
            return;
        }
        if (!siteDescription) {
            setSavingOptin(false);
            setError(__('Please enter your Site Description.', 'wp-ai-blogger'));
            handleStepRedirection('persona-form');
            return;
        }

        // Update data
        await updateApiData('siteTitle', siteTitle, dispatch, abortControllerRef);
        await updateApiData('siteFor', siteFor, dispatch, abortControllerRef);
        await updateApiData('siteDescription', siteDescription, dispatch, abortControllerRef);
        await updateApiData('userName', name, dispatch, abortControllerRef);
        await updateApiData('userEmail', email, dispatch, abortControllerRef);

        // Update Redux state with the new data
        dispatch({ type: 'UPDATE_SITE_TITLE', payload: siteTitle });
        dispatch({ type: 'UPDATE_SITE_FOR', payload: siteFor });
        dispatch({ type: 'UPDATE_SITE_DESCRIPTION', payload: siteDescription });
        dispatch({ type: 'UPDATE_USER_NAME', payload: name });
        dispatch({ type: 'UPDATE_USER_EMAIL', payload: email });

        // Navigate to 'ready' after all updates are complete
        handleStepRedirection('ready');
    };

    return (
        <div className="wpaib-container">
            <div className="wpaib-row mt-12 max-w-5xl">
                <div className="bg-white rounded text-center mx-auto px-11">
                    <span className="text-sm font-medium text-primary-600 mb-10 text-center block tracking-[.24em] uppercase">
                        {__('Step 3 of 3', 'wp-ai-blogger')}
                    </span>

                    <h1 className="wpaib-step-heading mb-2 text-center">
                        {__('One last step.', 'wp-ai-blogger')}
                    </h1>

                    <h2 className="wpaib-step-heading mb-4 text-center">
                        {__('Let\'s setup email reports to grow your blog.', 'wp-ai-blogger')}
                    </h2>

                    <p className="mt-4 text-[#4B5563] text-base">
                        {__(
                            'Let WP AI Blogger take you on the next level. You also will receive emails about trending topics, marketing strategies from us to help your blog grow more.',
                            'wp-ai-blogger'
                        )}
                    </p>

                    <form action="#" className="max-w-sm mx-auto mt-10">
                        <div className="sm:flex flex-col gap-5 text-left">
                            <div className="w-full">
                                <label
                                    htmlFor="wpaib-user-name"
                                    className="text-slate-800 text-base font-semibold block"
                                >
                                    {__('First Name', 'wp-ai-blogger')}
                                </label>
                                <div className="relative block">
                                    <input
                                        id="wpaib-user-name"
                                        type="text"
                                        className={`!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none`}
                                        placeholder={__('Please enter your name', 'wp-ai-blogger')}
                                        defaultValue={name}
                                        onChange={updateName}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="wpaib-user-email"
                                    className="text-slate-800 text-base font-semibold block"
                                >
                                    {__('Email address', 'wp-ai-blogger')}
                                </label>
                                <div className="relative block">
                                    <input
                                        id="wpaib-user-email"
                                        type="email"
                                        className={`!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none`}
                                        placeholder={__('Enter Your Email', 'wp-ai-blogger')}
                                        defaultValue={email}
                                        onChange={updateEmail}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-500 mt-2">{error}</p>}

                        <div className="mt-[40px] grid justify-center">
                            <button
                                onClick={submitOptinForm}
                                className={`wpaib-wizard--button`}
                            >
                                {!savingOptin
                                    ? __('Save & Continue', 'wp-ai-blogger')
                                    : __('Saving…', 'wp-ai-blogger')}

                                {!savingOptin ? <ArrowRight className="w-5 h-5" /> : ''}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OptinStep;