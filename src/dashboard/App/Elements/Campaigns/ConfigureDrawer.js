import React, { useRef, useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { updateCampaign } from '@Utils/ApiData';
import SwitchControl from '@Components/SwitchControl';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SettingInput from '@Components/SettingInput';
import { Tooltip } from '@wordpress/components';
import { TriangleAlert } from 'lucide-react';

export default function ConfigureDrawer( props ) {
	const abortControllerRef = useRef( {} );
	const { configureData, openDrawer, setOpenDrawer, mode = 'edit' } = props;

	const [ activeTab, setActiveTab ] = useState( 'campaign' );
	const [ handlingCampaign, setHandlingCampaign ] = useState( false );
	const [ open, setOpen ] = useState( openDrawer );
	const [ drawerData, setDrawerData ] = useState( {} );
	const postTypes = wpaib_localized_data?.post_types || {};
	const authors = wpaib_localized_data?.authors || [];
	const postStatuses = wpaib_localized_data?.post_statuses || {};
	const categories = wpaib_localized_data?.categories || {};
	const tags = wpaib_localized_data?.tags || {};
	const isViewMode = mode === 'view';

	useEffect( () => {
		setDrawerData( configureData );
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
		updateCampaign( drawerData, drawerData.type === 'new', abortControllerRef );
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
													isViewMode
														? __( 'Campaign Configuration', 'wp-ai-blogger' )
														: ( drawerData.type === 'new' )
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
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, title: e.target.value } ) }
																	type="text"
																	readOnly={ isViewMode }
																	className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
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
																	className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																	defaultValue={ drawerData.keywords }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, keywords: e.target.value } ) }
																	readOnly={ isViewMode }
																/>
															</div>
														</div>

														<div className="grid grid-cols-1 gap-2">
															<div className="flex items-center justify-between">
																<label htmlFor="campaign-target" className="flex items-center text-sm/6 font-medium text-gray-900">
																	{ __( 'Posts Target', 'wp-ai-blogger' ) }
																	<Tooltip
																		text={ __( 'How many posts you expect from this campaign?', 'wp-ai-blogger' ) }
																		delay={ 100 }
																		className="z-[99999] bg-black text-white shadow-md p-2 rounded-md"
																	>
																		<QuestionMarkCircleIcon
																			aria-hidden="true"
																			className="size-4 ml-1 text-gray-400 group-hover:text-gray-500"
																		/>
																	</Tooltip>
																</label>
																<div className="mt-2 flex items-center gap-1">
																	<input
																		id="campaign-target"
																		name="campaign-target"
																		defaultValue={ drawerData.postsTarget }
																		onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, postsTarget: e.target.value } ) }
																		type="number"
																		readOnly={ isViewMode }
																		disabled={ drawerData.type === 'edit' }
																		className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																	/>
																</div>
															</div>
															{ drawerData.type === 'new' && (
																<div className="text-xs text-gray-500 text-right">
																	{ __( 'Once set, campaign targets are unchangeable.', 'wp-ai-blogger' ) }
																</div>
															) }
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="campaign-repeat-after" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Repeat After', 'wp-ai-blogger' ) }
																<Tooltip
																	text={ __( 'Set how often the campaign should run automatically.', 'wp-ai-blogger' ) }
																	delay={ 100 }
																	className="z-[99999] bg-black text-white shadow-md p-2 rounded-md"
																>
																	<QuestionMarkCircleIcon
																		aria-hidden="true"
																		className="size-4 ml-1 text-gray-400 group-hover:text-gray-500"
																	/>
																</Tooltip>
															</label>

															<div className="mt-2 flex gap-2">
																<input
																	id="campaign-repeat-after"
																	name="campaign-repeat-after"
																	defaultValue={ drawerData.repeatInterval || 1 }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, repeatInterval: parseInt( e.target.value ) || 1 } ) }
																	type="number"
																	min="1"
																	max="365"
																	readOnly={ isViewMode }
																	className={ `block w-20 rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																/>
																<select
																	className={ `min-w-[100px] ${ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }` }
																	value={ drawerData.repeatUnit || 'day' }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, repeatUnit: e.target.value } ) }
																	disabled={ isViewMode }
																>
																	<option value="day">{ __( 'Day(s)', 'wp-ai-blogger' ) }</option>
																	<option value="week">{ __( 'Week(s)', 'wp-ai-blogger' ) }</option>
																	<option value="month">{ __( 'Month(s)', 'wp-ai-blogger' ) }</option>
																	<option value="year">{ __( 'Year(s)', 'wp-ai-blogger' ) }</option>
																</select>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="use-summary-as-excerpt" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Use Summary as Excerpt?', 'wp-ai-blogger' ) }
															</label>
															<div className="mt-2">
																<SwitchControl
																	checked={ drawerData.summaryAsExcerpt }
																	onChange={ () => ! isViewMode && setDrawerData( { ...drawerData, summaryAsExcerpt: ! drawerData.summaryAsExcerpt } ) }
																	id="use-summary-as-excerpt"
																	disabled={ isViewMode }
																/>
															</div>
														</div>

														<fieldset>
															<legend className="text-sm/6 font-medium text-gray-900"> { __( 'Campaign Status', 'wp-ai-blogger' ) } </legend>

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
																			onChange={ () => ! isViewMode && setDrawerData( { ...drawerData, status: 'publish' } ) }
																			disabled={ isViewMode }
																		/>
																	</div>
																	<div className="pl-7 text-sm/6">
																		<label htmlFor="privacy-public" className="font-medium text-gray-900">
																			{ __( 'On', 'wp-ai-blogger' ) }
																			{ ' ' }
																			<span id="privacy-public-description" className="text-gray-500 text-normal">
																				{ __( 'The campaign will be activated immediately and start running.', 'wp-ai-blogger' ) }
																			</span>
																		</label>
																	</div>
																</div>

																<div>
																	<div className="relative flex items-start">
																		<div className="absolute flex h-6 mt-1 items-center">
																			<input
																				defaultValue="private-to-project"
																				id="privacy-private-to-project"
																				name="privacy"
																				type="radio"
																				aria-describedby="privacy-private-to-project-description"
																				className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
																				onChange={ () => ! isViewMode && setDrawerData( { ...drawerData, status: 'draft' } ) }
																				disabled={ isViewMode }
																			/>
																		</div>
																		<div className="pl-7 text-sm/6">
																			<label htmlFor="privacy-private-to-project" className="font-medium text-gray-900">
																				{ __( 'Off', 'wp-ai-blogger' ) }
																				{ ' ' }
																				<span id="privacy-private-to-project-description" className="text-gray-500 text-normal">
																					{ __( 'The campaign setup will be saved, but it won\'t run until you switch it ON.', 'wp-ai-blogger' ) }
																				</span>
																			</label>
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
																<select
																	className={ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }
																	id="post-type"
																	value={ drawerData.postType }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, postType: e.target.value } ) }
																	disabled={ isViewMode }
																>
																	{ Object.entries( postTypes ).map( ( [ type, label ] ) => (
																		<option key={ type } value={ type }>
																			{ label }
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
																<select
																	className={ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }
																	id="post-author"
																	value={ drawerData.author }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, author: e.target.value } ) }
																	disabled={ isViewMode }
																>
																	{ authors.map( ( author ) => (
																		<option key={ author.id } value={ author.id }>
																			{ author.name }
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
																<select
																	className={ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }
																	id="post-status"
																	value={ drawerData.postStatus }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, postStatus: e.target.value } ) }
																	disabled={ isViewMode }
																>
																	{ Object.entries( postStatuses ).map( ( [ key, label ] ) => (
																		<option key={ key } value={ key }>
																			{ label }
																		</option>
																	) ) }
																</select>
															</div>
														</div>

														{
															'post' === drawerData.postType && (
																<>
																	<div className="flex items-center justify-between post-filters-option">
																		<label htmlFor="post-category" className="block text-sm/6 font-medium text-gray-900">
																			{ __( 'Post Category', 'wp-ai-blogger' ) }
																		</label>
																		<div>
																			<select
																				className={ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }
																				id="post-category"
																				value={ drawerData.category || '' }
																				onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, category: e.target.value } ) }
																				disabled={ isViewMode }
																			>
																				<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																				{ categories.map( ( category ) => (
																					<option key={ category.id } value={ category.id }>
																						{ category.name }
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
																			<select
																				className={ isViewMode ? 'wpaib-select-control-readonly' : 'wpaib-select-control' }
																				id="post-tag"
																				value={ drawerData.tag || '' }
																				onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, tag: e.target.value } ) }
																				disabled={ isViewMode }
																			>
																				<option value=""> { __( '-- Select --', 'wp-ai-blogger' ) } </option>
																				{ tags.map( ( tag ) => (
																					<option key={ tag.id } value={ tag.id }>
																						{ tag.name }
																					</option>
																				) ) }
																			</select>
																		</div>
																	</div>
																</>
															)
														}
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
															<label htmlFor="maximum-title-words" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Maximum Title Words', 'wp-ai-blogger' ) }
															</label>

															<div className="mt-2">
																<input
																	id="maximum-title-words"
																	name="maximum-title-words"
																	defaultValue={ drawerData.maxTitleWords }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, maxTitleWords: e.target.value } ) }
																	type="number"
																	readOnly={ isViewMode }
																	className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="maximum-words" className="flex items-center text-sm/6 font-medium text-gray-900">
																{ __( 'Maximum Content Words', 'wp-ai-blogger' ) }
															</label>

															<div className="mt-2">
																<input
																	id="maximum-words"
																	name="maximum-words"
																	defaultValue={ drawerData.maxWords }
																	onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, maxWords: e.target.value } ) }
																	type="number"
																	readOnly={ isViewMode }
																	className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																/>
															</div>
														</div>

														<div className="flex items-center justify-between">
															<label htmlFor="override-site-persona" className="block text-sm/6 font-medium text-gray-900">
																{ __( 'Override Site Persona for this Campaign?', 'wp-ai-blogger' ) }
															</label>
															<div className="mt-2">
																<SwitchControl
																	checked={ drawerData.overrideSitePersona }
																	onChange={ () => ! isViewMode && setDrawerData( { ...drawerData, overrideSitePersona: ! drawerData.overrideSitePersona } ) }
																	id="override-site-persona"
																	disabled={ isViewMode }
																/>
															</div>
														</div>

														{
															drawerData.overrideSitePersona && (
																<>
																	<SettingField>
																		<SettingLabel forId="name-of-the-blog" title={ __( 'Campaign Title:', 'wp-ai-blogger' ) } />
																		<SettingInput
																			id="name-of-the-blog"
																			defaultValue={ drawerData.overrideSiteTitle }
																			onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, overrideSiteTitle: e.target.value } ) }
																			readOnly={ isViewMode }
																		/>
																	</SettingField>

																	<SettingField>
																		<SettingLabel forId="blog-for" title={ __( 'Campaign For:', 'wp-ai-blogger' ) } />
																		<SettingInput
																			id="blog-for"
																			defaultValue={ drawerData.overrideSiteFor }
																			onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, overrideSiteFor: e.target.value } ) }
																			readOnly={ isViewMode }
																		/>
																	</SettingField>

																	<SettingField>
																		<SettingLabel forId="more-about-blog" title={ __( 'Campaign Description:', 'wp-ai-blogger' ) } />
																		<textarea
																			id="more-about-blog"
																			className={ `block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 sm:text-sm/6 ${ isViewMode ? 'bg-gray-50 outline-gray-200' : 'bg-white outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600' }` }
																			value={ drawerData.overrideSiteDescription }
																			onChange={ ( e ) => ! isViewMode && setDrawerData( { ...drawerData, overrideSiteDescription: e.target.value } ) }
																			readOnly={ isViewMode }
																		/>
																	</SettingField>
																</>
															)
														}

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
										{ isViewMode ? __( 'Close', 'wp-ai-blogger' ) : __( 'Cancel', 'wp-ai-blogger' ) }
									</button>

									{ ! isViewMode && (
										<button
											onClick={ handleCampaign }
											disabled={ handlingCampaign }
											className={ `ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${ handlingCampaign ? 'cursor-not-allowed opacity-50' : '' }` }
										>
											{ ( drawerData.type === 'new' ) ? __( 'Create', 'wp-ai-blogger' ) : __( 'Update', 'wp-ai-blogger' ) }
										</button>
									) }
								</div>
							</form>
						</DialogPanel>
					</div>
				</div>
			</div>
		</Dialog>
	);
}
