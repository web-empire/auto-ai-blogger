import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { Plus, MoveRight, RotateCw } from 'lucide-react';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
import BlurredSkeleton from './BlurredSkeleton';
import apiFetch from '@wordpress/api-fetch';
import ProButton from '@Components/ProButton';

const UPDATE_POST_IDEAS = 'UPDATE_POST_IDEAS';

export default function PostIdeas() {
	const dispatch = useDispatch();
	const abortControllerRef = useRef( {} );
	const hasFetchedRef = useRef( false );
	const navigate = useNavigate();

	// Fetch data from Redux store using selectors - defaults handled by menu.php
	const siteTitle = useSelector( ( state ) => state.siteTitle );
	const siteFor = useSelector( ( state ) => state.siteFor );
	const siteDescription = useSelector( ( state ) => state.siteDescription );
	const temperature = useSelector( ( state ) => state.temperature );
	const harassment = useSelector( ( state ) => state.harassment );
	const hate = useSelector( ( state ) => state.hate );
	const sexuallyExplicit = useSelector( ( state ) => state.sexuallyExplicit );
	const dangerousContent = useSelector( ( state ) => state.dangerousContent );
	const license = useSelector( ( state ) => state.license );
	const postIdeasFromRedux = useSelector( ( state ) => state.postIdeas );
	const tokenTotal = useSelector( ( state ) => state.tokenTotal );
	const tokenRemaining = useSelector( ( state ) => state.tokenRemaining );
	const licenseStatus = useSelector( ( state ) => state.license_status );
	const proAvailable = useSelector( ( state ) => state.proAvailable );
	const homeSlug = useSelector( ( state ) => state.homeSlug );
	const adminNonce = useSelector( ( state ) => state.adminNonce );
	const ajaxUrl = useSelector( ( state ) => state.ajaxUrl );
	const editPostLink = useSelector( ( state ) => state.editPostLink );

	const [ postIdeas, setPostIdeas ] = useState( postIdeasFromRedux );
	const [ postIdeasArr, setPostIdeasArr ] = useState( [] );
	const [ loading, setLoading ] = useState( true ); // Always start with loading true
	const [ error, setError ] = useState( null );
	const [ isApiError, setIsApiError ] = useState( false );
	const [ creatingPosts, setCreatingPosts ] = useState( new Set() ); // Track which posts are being created

	const licenseEnabled = licenseStatus === 'licensed';

	// Constants
	const TOTAL_ROWS = 5;

	// Calculate available and created counts
	const availableIdeasCount = postIdeasArr.length;
	const createdIdeasCount = Math.max( 0, TOTAL_ROWS - availableIdeasCount );

	const fetchPostIdeas = useCallback( async () => {
		setLoading( true );
		setError( null );
		setIsApiError( false );

		if ( ! siteTitle || ! siteFor || ! siteDescription ) {
			setError( 'Missing required fields' );
			setIsApiError( false ); // Not an API error
			setLoading( false );
			return;
		}

		// Check if license is available - license is always a string
		if ( ! license || typeof license !== 'string' || license.trim() === '' ) {
			setError( 'License key is not available. Please check your license configuration.' );
			setIsApiError( false ); // Not an API error - configuration issue
			setLoading( false );
			return;
		}

		const requestBody = {
			site_title: siteTitle,
			site_purpose: siteFor,
			site_description: siteDescription,
			temperature,
			harassment,
			hate,
			sexually_explicit: sexuallyExplicit,
			dangerous_content: dangerousContent,
			license: license.trim(),
		};

		try {
			const response = await fetch( 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-post-ideas', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( requestBody ),
			} );

			if ( ! response.ok ) {
				const errorData = await response.json();
				console.error( 'API Error:', errorData );
				const errorMessage = errorData.message || 'Failed to fetch post ideas.';
				setError( errorMessage );
				setIsApiError( true ); // This is an API error
				setLoading( false );
				return;
			}

			const data = await response.json();

			if ( data && data.post_ideas && Array.isArray( data.post_ideas ) ) {
				// Convert array to string for consistent storage
				const postIdeasString = data.post_ideas.filter( idea => idea && typeof idea === 'string' && idea.trim() ).join( '\n' );

				// Store as string in Redux and DB
				dispatch( {
					type: UPDATE_POST_IDEAS,
					payload: postIdeasString,
				} );
				await updateApiData( 'postIdeas', postIdeasString, dispatch, abortControllerRef );
				setPostIdeas( postIdeasString );

				// Handle token data if present
				if ( data.token_data ) {
					// Update Redux store with token data
					dispatch({
						type: 'UPDATE_TOKEN_TOTAL',
						payload: data.token_data.total,
					});
					dispatch({
						type: 'UPDATE_TOKEN_REMAINING',
						payload: data.token_data.remaining,
					});

					// Update API data in database
					await updateApiData( 'tokenTotal', data.token_data.total, dispatch, abortControllerRef );
					await updateApiData( 'tokenRemaining', data.token_data.remaining, dispatch, abortControllerRef );
				}

				setLoading( false );
			} else {
				console.error( 'API Error: Invalid response from API' );
				setError( 'Invalid response from API.' );
				setIsApiError( true ); // This is an API error
				setLoading( false );
			}
		} catch ( err ) {
			console.error( 'API Error:', err );
			setError( err.message );
			setIsApiError( true ); // This is an API error
			setLoading( false );
		}
	}, [
		siteTitle,
		siteFor,
		siteDescription,
		temperature,
		harassment,
		hate,
		sexuallyExplicit,
		dangerousContent,
		license,
		dispatch
	] );

	useEffect( () => {
		// If license is not enabled, don't do anything
		if ( ! licenseEnabled ) {
			setLoading( false );
			return;
		}

		// If we already have post ideas from Redux/DB, use them and don't fetch
		if ( postIdeasFromRedux && typeof postIdeasFromRedux === 'string' && postIdeasFromRedux.trim() !== '' ) {
			setPostIdeas( postIdeasFromRedux );
			setLoading( false );
			return;
		}

		// Only fetch if we don't have post ideas and haven't already tried to fetch
		if ( ! hasFetchedRef.current ) {
			hasFetchedRef.current = true;
			// Keep loading true while we fetch
			setLoading( true );
			fetchPostIdeas();
		} else {
			// We've already tried fetching but have no data, so stop loading
			setLoading( false );
		}
	}, [ licenseEnabled, postIdeasFromRedux, fetchPostIdeas ] );

	useEffect( () => {
		// Convert string to array for display when postIdeas changes
		if ( licenseEnabled && postIdeas && typeof postIdeas === 'string' && postIdeas.trim() !== '' ) {
			// Convert string to array by splitting on newlines
			const ideasArray = postIdeas.split( '\n' ).filter( idea => idea.trim() !== '' );
			setPostIdeasArr( ideasArray );
		} else {
			// Clear the array if no post ideas
			setPostIdeasArr( [] );
		}
	}, [ postIdeas, licenseEnabled ] );

	const handleRefresh = () => {
		dispatch( {
			type: UPDATE_POST_IDEAS,
			payload: '', // Use empty string instead of empty array
		} );
		setPostIdeas( '' );
		setLoading( true );
		setError( null );
		setIsApiError( false );
		hasFetchedRef.current = false; // Reset the fetch flag to allow refetch
		fetchPostIdeas();
	};

	if ( ! licenseEnabled ) {
		return ( '' );
	}

	// Remove the separate loading return - we'll handle it inline

	const handlePersonaClick = ( event ) => {
		event.preventDefault(); // Prevent the default link behavior
		navigate( `?page=${ homeSlug }&path=settings` ); // Navigate to the settings tab.
	};

	if ( error ) {
		// Check for insufficient tokens error
		if ( error === 'Token exhausted: Insufficient tokens for this request.' ) {
			return (
				<div className="p-4 text-red-500 flex flex-col items-center">
					<p> { __( 'Error while loading post ideas:', 'wp-ai-blogger' ) } { error } </p>
					<ProButton
						url="https://wpaiblogger.com/pricing/"
						variant="primary"
						size="default"
						icon={<MoveRight className="h-5 w-5" />}
						className="mt-5"
					>
						{ __( 'Upgrade Now', 'wp-ai-blogger' ) }
					</ProButton>
				</div>
			);
		}

		if ( error === 'Missing required fields' ) {
			const title = __( 'Please fill out the general settings to see post ideas.', 'wp-ai-blogger' );
			const buttonText = __( 'Go to General Settings', 'wp-ai-blogger' );

			return (
				<div className="p-4 text-red-500 flex flex-col items-center">
					<p> { title } </p>
					<a
						href="#"
						onClick={ handlePersonaClick }
						className="cursor-pointer inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5 gap-1"
						style={ { color: 'white' } } // Inline style to ensure white color.
					>
						{ buttonText }
						<MoveRight className="h-5 w-5" />
					</a>
				</div>
			);
		}

		if ( error === 'License key is not available. Please check your license configuration.' ) {
			const title = __( 'License key is missing. Please activate your license to use this feature.', 'wp-ai-blogger' );
			const buttonText = __( 'Go to License Settings', 'wp-ai-blogger' );

			return (
				<div className="p-4 text-red-500 flex flex-col items-center">
					<p> { title } </p>
					<a
						href="#"
						onClick={ ( event ) => {
							event.preventDefault();
							navigate( `?page=${ homeSlug }&path=settings&tab=license` );
						} }
						className="cursor-pointer inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5 gap-1"
						style={ { color: 'white' } } // Inline style to ensure white color.
					>
						{ buttonText }
						<MoveRight className="h-5 w-5" />
					</a>
				</div>
			);
		}

		return (
			<div className="p-4 text-red-500 flex flex-col items-center">
				<p> { __( 'Error while loading post ideas:', 'wp-ai-blogger' ) } { error } </p>
				{ isApiError && (
					<button
						onClick={ handleRefresh }
						className="mt-4 flex items-center gap-2 bg-indigo-600 text-white rounded px-4 py-2"
					>
						<RotateCw className="h-4 w-4" />
						{ __( 'Retry', 'wp-ai-blogger' ) }
					</button>
				) }
			</div>
		);
	}

	const wpaib_create_post = ( e, title ) => {
		e.preventDefault();

		if ( e.target.dataset.type === 'open-post' ) {
			window.open( e.target.href, '_blank' );
			return;
		}

		// Prevent multiple clicks for the same post
		if ( creatingPosts.has( title ) ) {
			return;
		}

		// Add this post to the creating set
		setCreatingPosts( prev => new Set( prev ).add( title ) );

		// Update button to show loading state
		const originalContent = e.target.innerHTML;
		e.target.innerHTML = `<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ${ __( 'Creating...', 'wp-ai-blogger' ) }`;
		e.target.style.pointerEvents = 'none';

		const formData = new window.FormData();
		formData.append( 'action', 'wpaib_create_post' );
		formData.append( 'security', adminNonce );

		const postData = {
			title,
			status: 'draft',
			post_type: 'post',
			post_content: '',
			excerpt: '',
			metadata: JSON.stringify( { wp_aib_reference: 1 } ),
			// Include license and site information for content generation
			license: license,
			site_title: siteTitle,
			site_purpose: siteFor,
			site_description: siteDescription,
			temperature: temperature,
			harassment: harassment,
			hate: hate,
			sexually_explicit: sexuallyExplicit,
			dangerous_content: dangerousContent,
		};

		formData.append( 'post_data', JSON.stringify( postData ) );

		return apiFetch( {
			url: ajaxUrl,
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => {
				// Check if response exists and has the expected structure
				if ( ! response || typeof response !== 'object' ) {
					console.error( __( 'Invalid response received from server.', 'wp-ai-blogger' ) );
					dispatch( {
						type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
						payload: __( 'Error: Invalid response from server.', 'wp-ai-blogger' ),
					} );
					// Reset button state
					e.target.innerHTML = originalContent;
					e.target.style.pointerEvents = 'auto';
					return;
				}

				// Check if the request was successful
				if ( ! response.success ) {
					const errorMessage = response.data?.message || __( 'Failed to create post.', 'wp-ai-blogger' );
					console.error( __( 'Failed to create post:', 'wp-ai-blogger' ), errorMessage );
					dispatch( {
						type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
						payload: __( 'Error: ', 'wp-ai-blogger' ) + errorMessage,
					} );
					// Reset button state
					e.target.innerHTML = originalContent;
					e.target.style.pointerEvents = 'auto';
					return;
				}

				// Validate that we have the required data
				if ( ! response.data || ! response.data.post_id || ! response.data.edit_link ) {
					console.error( __( 'Post created but no post ID or edit link received.', 'wp-ai-blogger' ) );
					dispatch( {
						type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
						payload: __( 'Error: Post created but unable to get post details.', 'wp-ai-blogger' ),
					} );
					// Reset button state
					e.target.innerHTML = originalContent;
					e.target.style.pointerEvents = 'auto';
					return;
				}

				// Use the edit link provided by the backend
				const editUrl = response.data.edit_link;

				// Update button to "Open Post"
				e.target.dataset.type = 'open-post';
				e.target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> ${ __( 'Open Post', 'wp-ai-blogger' ) }`;
				e.target.href = editUrl;
				e.target.style.pointerEvents = 'auto';
				e.target.className = 'text-green-600 hover:text-green-900 flex items-center gap-x-1 cursor-pointer font-semibold';

				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'Post created successfully! Click "Open Post" to edit it.', 'wp-ai-blogger' ),
				} );
			} )
			.catch( ( error ) => {
				// Handle network errors or other exceptions
				const errorMessage = error?.message || __( 'Network error occurred while creating post.', 'wp-ai-blogger' );
				console.error( __( 'Error creating post:', 'wp-ai-blogger' ), error );
				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'Error: ', 'wp-ai-blogger' ) + errorMessage,
				} );
				// Reset button state
				e.target.innerHTML = originalContent;
				e.target.style.pointerEvents = 'auto';
			} )
			.finally( () => {
				// Remove this post from the creating set
				setCreatingPosts( prev => {
					const newSet = new Set( prev );
					newSet.delete( title );
					return newSet;
				} );
			} );
	};

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<div className="sm:flex-auto">
					<h1 className="text-base font-semibold text-gray-900"> { __( 'Blog Post Suggestions', 'wp-ai-blogger' ) } </h1>
					<p className="mt-2 text-sm text-gray-700">
						{ __( 'A list of some new blog post ideas that you can use to grow your blog.', 'wp-ai-blogger' ) }
						{ ! proAvailable && (
							<span className="block mt-1 text-amber-600 font-medium">
								{ __( '⚡ Free users are limited to 5 post suggestions. Upgrade for unlimited ideas!', 'wp-ai-blogger' ) }
							</span>
						) }
					</p>
				</div>
				{ ! proAvailable && (
					<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
						<ProButton
							variant="primary"
							size="default"
							icon={<MoveRight className="w-4 h-4" />}
							className="shadow-lg border-2 border-amber-400 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
						>
							{ __( 'Get Unlimited Post Suggestions', 'wp-ai-blogger' ) }
						</ProButton>
					</div>
				) }
			</div>

			<div className="mt-6 flow-root">
				<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="block py-2 align-middle sm:px-6 lg:px-8">
						<div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
							<table className="w-full divide-y divide-gray-300">
								<thead className="bg-gray-50 header-nav">
									<tr>
										<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
											{ __( 'Title', 'wp-ai-blogger' ) }
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex items-center justify-between">
											<span>{ __( 'Write Post', 'wp-ai-blogger' ) }</span>
											{ proAvailable ? (
												<button
													onClick={ handleRefresh }
													disabled={ loading }
													className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
													title={ __( 'Refresh post ideas', 'wp-ai-blogger' ) }
												>
													<RotateCw className={ `h-3 w-3 ${ loading ? 'animate-spin' : '' }` } />
													{ __( 'Refresh', 'wp-ai-blogger' ) }
												</button>
											) : (
												<div className="relative group">
													<button
														disabled
														className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 text-gray-400 rounded cursor-not-allowed opacity-60"
														title={ __( 'Upgrade to Pro to refresh post ideas', 'wp-ai-blogger' ) }
													>
														<RotateCw className="h-3 w-3" />
														{ __( 'Refresh', 'wp-ai-blogger' ) }
													</button>
												</div>
											) }
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-200 bg-white">
									{ loading ? (
										// Show skeleton loader within table
										<Suspense fallback={
											<tr>
												<td colSpan="2" className="px-6 py-4 text-center text-gray-500">
													{ __( 'Loading...', 'wp-ai-blogger' ) }
												</td>
											</tr>
										}>
											<Skeleton rows={ TOTAL_ROWS } />
										</Suspense>
									) : (
										<>
											{/* Available post ideas */}
											{ postIdeasArr && Array.isArray( postIdeasArr ) && postIdeasArr.length > 0 ? (
												<>
													{/* Show available ideas - for free users, limit to what fits with created ideas */}
													{ postIdeasArr.slice( 0, proAvailable ? postIdeasArr.length : Math.min( postIdeasArr.length, TOTAL_ROWS ) ).map( ( postTitle, index ) => (
														<tr key={ `post-idea-${ index }-${ postTitle?.slice( 0, 20 ) || index }` } className="even:bg-gray-50">
															<td className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
																<div className="font-medium">
																	<TrimWordsContent
																		content={ postTitle || '' }
																		count={ 120 }
																	/>
																</div>
															</td>
															<td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
																<a
																	target="_blank"
																	href="#"
																	onClick={ ( e ) => wpaib_create_post( e, postTitle || '' ) }
																	className="text-indigo-600 hover:text-indigo-900 flex items-center gap-x-1 cursor-pointer"
																	data-type="create"
																>
																	<Plus className="w-5 h-5" />
																	{ __( 'Create', 'wp-ai-blogger' ) }
																</a>
															</td>
														</tr>
													) ) }

													{/* Show blurred skeleton rows for created posts */}
													{ createdIdeasCount > 0 && (
														<BlurredSkeleton rows={ createdIdeasCount } />
													) }

													{/* Show upgrade prompt for free users when there are more than available slots */}
													{ ! proAvailable && postIdeasArr.length > TOTAL_ROWS && (
														<tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-t-2 border-amber-200">
															<td colSpan="2" className="px-6 py-6 text-center">
																<div className="flex flex-col items-center space-y-3">
																	<div className="text-amber-700 font-semibold text-sm">
																		🔒 { __( `${ postIdeasArr.length - TOTAL_ROWS } more post ideas available with Pro!`, 'wp-ai-blogger' ) }
																	</div>
																	<ProButton
																		variant="primary"
																		size="small"
																		icon={<MoveRight className="w-4 h-4" />}
																		className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
																	>
																		{ __( 'Unlock All Ideas - Upgrade Now', 'wp-ai-blogger' ) }
																	</ProButton>
																</div>
															</td>
														</tr>
													) }
												</>
											) : (
												<>
													{/* No available ideas - show blurred rows for created posts if any, else show no ideas message */}
													{ createdIdeasCount > 0 ? (
														<BlurredSkeleton rows={ createdIdeasCount } />
													) : (
														<tr>
															<td colSpan="2" className="px-6 py-4 text-center text-gray-500">
																{ __( 'No post ideas available.', 'wp-ai-blogger' ) }
															</td>
														</tr>
													) }
												</>
											) }
										</>
									) }
								</tbody>

								<tfoot className="bg-gray-50">
									<tr>
										<td colSpan="5" className="px-3 py-3.5 text-center text-sm font-semibold">
											{ ! proAvailable ? (
												<div className="flex flex-col items-center space-y-2">
													<div className="text-amber-600 font-medium text-sm">
														{ __( '🚀 Want more post ideas? Pro users get unlimited suggestions!', 'wp-ai-blogger' ) }
													</div>
													<ProButton
														variant="primary"
														size="default"
														icon={<MoveRight className="w-5 h-5" />}
														className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
													>
														{ __( 'Upgrade to Pro - Get Unlimited Ideas', 'wp-ai-blogger' ) }
													</ProButton>
												</div>
											) : (
												<ProButton
													variant="ghost"
													size="default"
													icon={<MoveRight className="w-5 h-5" />}
													className="text-indigo-600 hover:text-indigo-900"
												>
													{ __( 'Upgrade to Pro to Unlock More Features.', 'wp-ai-blogger' ) }
												</ProButton>
											) }
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
