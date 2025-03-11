import { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';

export default function ConfigureDrawer( props ) {
	const { configureData, openDrawer, setOpenDrawer } = props;

	useEffect( () => {
		setOpen( openDrawer );
		setDrawerData( configureData );
	}, [ openDrawer ] );

	const [ open, setOpen ] = useState( openDrawer );
	const [ drawerData, setDrawerData ] = useState( configureData );
	const { type, title, status, keywords, lastRun } = drawerData;

	const closePopup = () => {
		setOpen( false );
		setOpenDrawer( false );
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
													type === 'edit'
														? __( 'Edit Campaign', 'wp-ai-blogger' )
														: __( 'New Campaign', 'wp-ai-blogger' )
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

									<div className="flex flex-1 flex-col justify-between">
										<div className="divide-y divide-gray-200 px-4 sm:px-6">
											<div className="space-y-6 pb-5 pt-6">
												<div>
													<label htmlFor="project-name" className="block text-sm/6 font-medium text-gray-900">
														{ __( 'Campaign Name', 'wp-ai-blogger' ) }
													</label>
													<div className="mt-2">
														<input
															id="project-name"
															name="project-name"
															defaultValue={ title }
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
															defaultValue={ keywords }
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

											<div className="pb-6 pt-4">
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
								<div className="flex shrink-0 justify-end px-4 py-4">
									<button
										type="button"
										onClick={ closePopup }
										className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
									>
										{ __( 'Cancel', 'wp-ai-blogger' ) }
									</button>

									<button
										type="submit"
										className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										{ __( 'Save', 'wp-ai-blogger' ) }
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
