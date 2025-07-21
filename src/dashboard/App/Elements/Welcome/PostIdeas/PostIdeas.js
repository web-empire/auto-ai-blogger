import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { Plus, MoveRight, RotateCw } from 'lucide-react';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
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
	const licenseStatus = useSelector( ( state ) => state.license_status );
	const homeSlug = useSelector( ( state ) => state.homeSlug );
	const adminNonce = useSelector( ( state ) => state.adminNonce );
	const ajaxUrl = useSelector( ( state ) => state.ajaxUrl );
	const editPostLink = useSelector( ( state ) => state.editPostLink );

	const [ postIdeas, setPostIdeas ] = useState( postIdeasFromRedux );
	const [ postIdeasArr, setPostIdeasArr ] = useState( [] );
	const [ loading, setLoading ] = useState(
		! postIdeasFromRedux || typeof postIdeasFromRedux !== 'string' || postIdeasFromRedux.trim() === ''
	);
	const [ error, setError ] = useState( null );
	const [ isApiError, setIsApiError ] = useState( false );

	const licenseEnabled = licenseStatus === 'licensed';

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
			setLoading( false );
		} else if ( licenseEnabled && ( ! postIdeas || postIdeas.trim() === '' ) ) {
			// No post ideas available
			setPostIdeasArr( [] );
			setLoading( false );
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

	if ( loading ) {
		return (
			<div className="p-4">
				<Suspense fallback={ <div>Loading skeleton...</div> }>
					<Skeleton />
				</Suspense>
			</div>
		);
	}

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

		if ( e.target.dataset.type === 'edit' ) {
			window.open( e.target.href, '_blank' );
			return;
		}

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
		};

		formData.append( 'post_data', JSON.stringify( postData ) );

		return apiFetch( {
			url: ajaxUrl,
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => {
				if ( ! response.success ) {
					console.error( __( 'Failed to create post.', 'wp-ai-blogger' ) );
					return;
				}

				e.target.dataset.type = 'edit';
				e.target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line w-5 h-5"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/></svg> ${ __( 'Edit', 'wp-ai-blogger' ) }`;
				e.target.href = editPostLink.replace( '{{POST_ID}}', response.data.post_id );
				window.open( e.target.href, '_blank' );

				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'Post Created Successfully!', 'wp-ai-blogger' ),
				} );
			} )
			.catch( () => {} );
	};

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<h1 className="text-base font-semibold text-gray-900"> { __( 'Blog Post Suggestions', 'wp-ai-blogger' ) } </h1>
					<p className="mt-2 text-sm text-gray-700">
						{ __( 'A list of some new blog post ideas that you can use to grow your blog.', 'wp-ai-blogger' ) }
					</p>
				</div>
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
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											{ __( 'Write Post', 'wp-ai-blogger' ) }
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-200 bg-white">
									{ postIdeasArr && Array.isArray( postIdeasArr ) && postIdeasArr.length > 0 ? (
										postIdeasArr.map( ( postTitle, index ) => (
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
										) )
									) : (
										<tr>
											<td colSpan="2" className="px-6 py-4 text-center text-gray-500">
												{ __( 'No post ideas available.', 'wp-ai-blogger' ) }
											</td>
										</tr>
									) }
								</tbody>

								<tfoot className="bg-gray-50">
									<tr>
										<td colSpan="5" className="px-3 py-3.5 text-center text-sm font-semibold">
											<ProButton
												variant="ghost"
												size="default"
												icon={<MoveRight className="w-5 h-5" />}
												className="text-indigo-600 hover:text-indigo-900"
											>
												{ __( 'Upgrade to Pro to Unlock More Features.', 'wp-ai-blogger' ) }
											</ProButton>
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
