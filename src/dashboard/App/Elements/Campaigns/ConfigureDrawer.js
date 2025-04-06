import React, { useRef, useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { updateCampaign } from '@Utils/ApiData';
import SwitchControl from '@Components/SwitchControl';

export default function ConfigureDrawer( props ) {
	const abortControllerRef = useRef( {} );
	const { configureData, openDrawer, setOpenDrawer } = props;

	const [ activeTab, setActiveTab ] = useState( 'campaign' );
	const [ handlingCampaign, setHandlingCampaign ] = useState( false );
	const [ open, setOpen ] = useState( openDrawer );
	const [ drawerData, setDrawerData ] = useState( configureData );

	useEffect( () => {
		setHandlingCampaign( false );
		setOpen( openDrawer );
	}, [ openDrawer ] );

	const closePopup = () => {
		setOpen( false );
		setOpenDrawer( false );
	};

	const handleCampaign = ( e ) => {
		e.preventDefault();
		setHandlingCampaign( true );
		updateCampaign( drawerData, drawerData.type !== 'new', abortControllerRef );
	};

	return (
		<Dialog open={ open } onClose={ closePopup } className="relative z-10 ai-blogger-container">
			<div className="fixed inset-0 bg-black opacity-75" />

			<div className="fixed inset-0 overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<DialogPanel
							transition
							className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
						>
							<form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
								<div className="h-0 flex-1 overflow-y-auto">
									<div className="bg-indigo-700 px-4 py-4 sm:px-6 mt-8">
										<div className="flex items-center justify-between">
											<h2 className="text-base font-semibold text-white m-0 p-0">
												{
													drawerData.type !== 'new'
														? __( 'New Campaign', 'wp-ai-blogger' )
														: __( 'Edit Campaign', 'wp-ai-blogger' )
												}
											</h2>
											<div className="ml-3 flex h-7 items-center">
												<button
													type="button"
													onClick={ closePopup }
													className="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white border-none"
												>
													<span className="absolute -inset-2.5" />
													<span className="sr-only">Close panel</span>
													<XMarkIcon aria-hidden="true" className="size-6" />
												</button>
											</div>
										</div>
									</div>

									<div className="bg-white px-4 sm:px-6 wpaib-campaign-nav">
										<nav className="justify-between flex" aria-label="Tabs">
											<a
												onClick={ () => setActiveTab( 'campaign' ) }
												className={ `w-full campaign-settings-tab text-left text-sm/6 cursor-pointer text-gray-500 whitespace-nowrap py-4 border-b-2 border-gray-300 bg-transparent ${ 'campaign' === activeTab ? 'font-medium border-indigo-500 text-indigo-600' : 'hover:text-gray-900 hover:border-gray-300 font-normal' }` }
											>
												{ __( 'General', 'wp-ai-blogger' ) }
											</a>
											<a
												onClick={ () => setActiveTab( 'filters' ) }
												className={ `w-full campaign-settings-tab text-center text-sm/6 cursor-pointer text-gray-500 whitespace-nowrap py-4 border-b-2 border-gray-300 bg-transparent ${ 'filters' === activeTab ? 'font-medium border-indigo-500 text-indigo-600' : 'hover:text-gray-900 hover:border-gray-300 font-normal' }` }
											>
												{ __( 'Filters', 'wp-ai-blogger' ) }
											</a>
											<a
												onClick={ () => setActiveTab( 'advanced' ) }
												className={ `w-full campaign-settings-tab text-right text-sm/6 cursor-pointer text-gray-500 whitespace-nowrap py-4 border-b-2 border-gray-300 bg-transparent ${ 'advanced' === activeTab ? 'font-medium border-indigo-500 text-indigo-600' : 'hover:text-gray-900 hover:border-gray-300 font-normal' }` }
											>
												{ __( 'Advanced', 'wp-ai-blogger' ) }
											</a>
										</nav>
									</div>

									{
										'campaign' === activeTab && (
											<div className="flex flex-1 flex-col justify-between">
												<div className="divide-y divide-gray-200 px-4 sm:px-6">
													<div className="space-y-6 pb-5 pt-6">
														<div>
															<label htmlFor="project-name" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Name', 'wp-ai-blogger' ) }
															</label>
															<div className="mt-2">
																<input
																	id="project-name"
																	name="project-name"
																	defaultValue={ drawerData.title }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, title: e.target.value } ) }
																	type="text"
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																/>
															</div>
														</div>

														<div>
															<label htmlFor="campaign-keywords" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Keywords', 'wp-ai-blogger' ) }
															</label>
															<div className="mt-2">
																<textarea
																	id="campaign-keywords"
																	name="campaign-keywords"
																	rows={ 3 }
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																	defaultValue={ drawerData.keywords }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, keywords: e.target.value } ) }
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="campaign-target" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Posts Target', 'wp-ai-blogger' ) }
																<QuestionMarkCircleIcon
																	aria-hidden="true"
																	title={ __( 'How many posts you expect from this campaign?', 'wp-ai-blogger' ) }
																	className="size-4 ml-1 text-gray-400 group-hover:text-gray-500"
																/>
															</label>
															<div className="mt-2">
																<input
																	id="campaign-target"
																	name="campaign-target"
																	defaultValue={ drawerData.postsTarget }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, postsTarget: e.target.value } ) }
																	type="number"
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="campaign-frequency" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Frequency', 'wp-ai-blogger' ) }
																<QuestionMarkCircleIcon
																	aria-hidden="true"
																	title={ __( '(run after every n days)', 'wp-ai-blogger' ) }
																	className="size-4 ml-1 text-gray-400 group-hover:text-gray-500"
																/>
															</label>

															<div className="mt-2">
																<input
																	id="campaign-frequency"
																	name="campaign-frequency"
																	defaultValue={ drawerData.frequency }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, frequency: e.target.value } ) }
																	type="number"
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="use-summary-as-excerpt" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Use Summary as Excerpt?', 'wp-ai-blogger' ) }
															</label>
															<div className="mt-2">
																<SwitchControl
																	checked={ drawerData.summaryAsExcerpt }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, summaryAsExcerpt: ! drawerData.summaryAsExcerpt } ) }
																	id="use-summary-as-excerpt"
																/>
															</div>
														</div>

														<fieldset>
															<legend className="text-sm/6 font-medium text-gray-900"> { __( 'Status', 'wp-ai-blogger' ) } </legend>

															<div className="mt-2 space-y-4">
																<div className="relative flex items-start">
																	<div className="absolute flex h-6 mt-1 items-center">
																		<input
																			defaultValue="public"
																			defaultChecked
																			id="privacy-public"
																			name="privacy"
																			type="radio"
																			aria-describedby="privacy-public-description"
																			className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
																			onChange={ ( e ) => setDrawerData( { ...drawerData, status: 'publish' } ) }
																		/>
																	</div>
																	<div className="pl-7 text-sm/6">
																		<label htmlFor="privacy-public" className="font-medium text-gray-900">
																			{ __( 'Publish', 'wp-ai-blogger' ) }
																		</label>
																		<p id="privacy-public-description" className="text-gray-500">
																			{ __( 'Campaign will be in action instantly.', 'wp-ai-blogger' ) }
																		</p>
																	</div>
																</div>

																<div>
																	<div className="relative flex items-start">
																		<div className="absolute flex h-6 items-center">
																			<input
																				defaultValue="private-to-project"
																				id="privacy-private-to-project"
																				name="privacy"
																				type="radio"
																				aria-describedby="privacy-private-to-project-description"
																				className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
																				onChange={ ( e ) => setDrawerData( { ...drawerData, status: 'draft' } ) }
																			/>
																		</div>
																		<div className="pl-7 text-sm/6">
																			<label htmlFor="privacy-private-to-project" className="font-medium text-gray-900">
																				{ __( 'Draft', 'wp-ai-blogger' ) }
																			</label>
																			<p id="privacy-private-to-project-description" className="text-gray-500">
																				{ __( 'Campaign will be in draft mode. Later status toggle can be modify.', 'wp-ai-blogger' ) }
																			</p>
																		</div>
																	</div>
																</div>
															</div>
														</fieldset>
													</div>
												</div>
											</div>
										)
									}

									{
										'filters' === activeTab && (
											<div className="flex flex-1 flex-col justify-between">
												<div className="divide-y divide-gray-200 px-4 sm:px-6">
													<div className="space-y-6 pb-5 pt-6">
														<div className="flex items-center justify-between post-filters-option">
															<label htmlFor="post-type" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Post Type', 'wp-ai-blogger' ) }
															</label>
															<div>
																<select className="wpaib-select-control" id="post-type" value={ drawerData.postType } onChange={ ( e ) => setDrawerData( { ...drawerData, postType: e.target.value } ) }>
																	<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																	{ autoblog_data.post_types.map( ( type ) => (
																		<option key={ type } value={ type }>
																			{ type.charAt( 0 ).toUpperCase() + type.slice( 1 ) } { /* Capitalize first letter */ }
																		</option>
																	) ) }
																</select>
															</div>
														</div>

														<div className="flex items-center justify-between post-filters-option">
															<label htmlFor="post-author" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Post Author', 'wp-ai-blogger' ) }
															</label>
															<div>
																<select className="wpaib-select-control" id="post-author" value={ drawerData.author } onChange={ ( e ) => setDrawerData( { ...drawerData, author: e.target.value } ) }>
																	<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																	{ Object.entries( autoblog_data.authors ).map( ( [ key, label ] ) => (
																		<option key={ key } value={ key }>
																			{ label }
																		</option>
																	) ) }
																</select>
															</div>
														</div>

														<div className="flex items-center justify-between post-filters-option">
															<label htmlFor="post-status" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Post Status', 'wp-ai-blogger' ) }
															</label>
															<div>
																<select className="wpaib-select-control" id="post-status" value={ drawerData.postStatus } onChange={ ( e ) => setDrawerData( { ...drawerData, postStatus: e.target.value } ) }>
																	<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																	{ Object.entries( autoblog_data.post_statuses ).map( ( [ key, label ] ) => (
																		<option key={ key } value={ key }>
																			{ label }
																		</option>
																	) ) }
																</select>
															</div>
														</div>

														<div className="flex items-center justify-between post-filters-option">
															<label htmlFor="post-category" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Post Category', 'wp-ai-blogger' ) }
															</label>
															<div>
																<select className="wpaib-select-control" id="post-category" value={ drawerData.category } onChange={ ( e ) => setDrawerData( { ...drawerData, category: e.target.value } ) }>
																	<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																	{ Object.entries( autoblog_data.categories ).map( ( [ key, label ] ) => (
																		<option key={ key } value={ key }>
																			{ label }
																		</option>
																	) ) }
																</select>
															</div>
														</div>

														<div className="flex items-center justify-between post-filters-option">
															<label htmlFor="post-tag" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Post Tag', 'wp-ai-blogger' ) }
															</label>
															<div>
																<select className="wpaib-select-control" id="post-tag" value={ drawerData.tag } onChange={ ( e ) => setDrawerData( { ...drawerData, tag: e.target.value } ) }>
																	<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																	{ Object.entries( autoblog_data.tags ).map( ( [ key, label ] ) => (
																		<option key={ key } value={ key }>
																			{ label }
																		</option>
																	) ) }
																</select>
															</div>
														</div>
													</div>
												</div>
											</div>
										)
									}

									{
										'advanced' === activeTab && (
											<div className="flex flex-1 flex-col justify-between">
												<div className="divide-y divide-gray-200 px-4 sm:px-6">
													<div className="space-y-6 pb-5 pt-6">
														<div className="flex items-center justify-between">
															<label htmlFor="minimum-title-words" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Minimum Title Words', 'wp-ai-blogger' ) }
															</label>

															<div className="mt-2">
																<input
																	id="minimum-title-words"
																	name="minimum-title-words"
																	defaultValue={ drawerData.minTitleWords }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, minTitleWords: e.target.value } ) }
																	type="number"
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="minimum-words" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Minimum Content Words', 'wp-ai-blogger' ) }
															</label>

															<div className="mt-2">
																<input
																	id="minimum-words"
																	name="minimum-words"
																	defaultValue={ drawerData.minWords }
																	onChange={ ( e ) => setDrawerData( { ...drawerData, minWords: e.target.value } ) }
																	type="number"
																	className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
																/>
															</div>
														</div>

														<div>
															<div className="mt-4 flex text-sm">
																<a href="#" className="group inline-flex items-center text-gray-500 hover:text-gray-900">
																	<QuestionMarkCircleIcon
																		aria-hidden="true"
																		className="size-5 text-gray-400 group-hover:text-gray-500"
																	/>
																	<span className="ml-2">
																		{ __( 'Learn more about how to configure your campaign.', 'wp-ai-blogger' ) }
																	</span>
																</a>
															</div>
														</div>
													</div>
												</div>
											</div>
										)
									}
								</div>

								<div className="flex shrink-0 justify-end px-4 py-4">
									<button
										type="button"
										onClick={ closePopup }
										className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
									>
										{ __( 'Cancel', 'wp-ai-blogger' ) }
									</button>

									<button
										onClick={ handleCampaign }
										disabled={ handlingCampaign }
										className={ `ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${ handlingCampaign ? 'cursor-not-allowed opacity-50' : '' }` }
									>
										{ drawerData.type !== 'new' ? __( 'Create', 'wp-ai-blogger' ) : __( 'Update', 'wp-ai-blogger' ) }
									</button>
								</div>
							</form>
						</DialogPanel>
					</div>
				</div>
			</div>
		</Dialog>
	);
}
