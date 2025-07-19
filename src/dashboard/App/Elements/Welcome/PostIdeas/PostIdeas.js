import React, { useState, useEffect, useRef, Suspense } from 'react';
import { __ } from '@wordpress/i18n';
import { Plus, MoveRight, RotateCw, Crown } from 'lucide-react';
import { TrimWordsContent } from '@Utils/TrimWordsContent';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
import apiFetch from '@wordpress/api-fetch';

const UPDATE_POST_IDEAS = 'UPDATE_POST_IDEAS';

export default function PostIdeas() {
	const dispatch = useDispatch();
	const abortControllerRef = useRef( {} );
	const navigate = useNavigate();

	// Fetch data from Redux store using selectors.
	const siteTitle = useSelector( ( state ) => state.siteTitle ) || '';
	const siteFor = useSelector( ( state ) => state.siteFor ) || '';
	const siteDescription = useSelector( ( state ) => state.siteDescription ) || '';
	const temperature = useSelector( ( state ) => state.temperature ) || '';
	const harassment = useSelector( ( state ) => state.harassment ) || '';
	const hate = useSelector( ( state ) => state.hate ) || '';
	const sexuallyExplicit = useSelector( ( state ) => state.sexuallyExplicit ) || '';
	const dangerousContent = useSelector( ( state ) => state.dangerousContent ) || '';
	const license = useSelector( ( state ) => state.license ) || '';
	const postIdeasFromRedux = useSelector( ( state ) => state.postIdeas ) || '';

	const [ postIdeas, setPostIdeas ] = useState( postIdeasFromRedux );
	const [ postIdeasArr, setPostIdeasArr ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	const licenseEnabled = 'licensed' === wpaib_localized_data.license_status;
	const [ showTooltip, setShowTooltip ] = useState( false );

	const fetchPostIdeas = async () => {
		console.log( 'Fetching post ideas...', postIdeasFromRedux );
		// Check if all required data is populated in Redux
		if ( postIdeasFromRedux ) {
			setLoading( false );
			return;
		}

		setLoading( true );
		setError( null );

		if ( ! siteTitle || ! siteFor || ! siteDescription ) {
			setError( 'Missing required fields' );
			setLoading( false );
			return;
		}

		try {
			const response = await fetch( 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-post-ideas', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					site_title: siteTitle,
					site_purpose: siteFor,
					site_description: siteDescription,
					temperature,
					harassment,
					hate,
					sexually_explicit: sexuallyExplicit,
					dangerous_content: dangerousContent,
					license,
				} ),
			} );

			if ( ! response.ok ) {
				const errorData = await response.json();
				console.error( 'API Error:', errorData );
				throw new Error( errorData.message || 'Failed to fetch post ideas.' );
			}

			const data = await response.json();

			if ( data && data.post_ideas ) {
				dispatch( {
					type: UPDATE_POST_IDEAS,
					payload: data.post_ideas,
				} );
				await updateApiData( 'postIdeas', data.post_ideas, dispatch, abortControllerRef );
				setPostIdeas( data.post_ideas );
				setLoading( false );
			} else {
				console.error( 'API Error: Invalid response from API' );
				throw new Error( 'Invalid response from API.' );
			}
		} catch ( err ) {
			console.error( 'API Error:', err );
			setError( err.message );
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchPostIdeas();

		if ( licenseEnabled && postIdeas ) {
			let formattedPostIdeas = postIdeas;

			if ( ! postIdeas.includes( '\n' ) ) {
				formattedPostIdeas = postIdeas.replace( /IDEA:\s/g, '\nIDEA: ' );
			}

			const ideasArray = formattedPostIdeas
				.split( '\n' )
				.filter( ( item ) => item.trim() !== '' )
				.map( ( item ) => {
					const match = item.match( /^IDEA:\s*(.*)$/ );
					if ( match ) {
						return {
							title: match[ 1 ].trim(),
							volume: 'N/A',
							position: 'N/A',
							visits: 'N/A',
						};
					}
					return null;
				} )
				.filter( ( item ) => item !== null );

			setPostIdeasArr( ideasArray );
			setLoading( false );
		}
	}, [ postIdeas ] );

	const handleRefresh = () => {
		if ( ! wpaib_localized_data.pro_available ) {
			window.open( wpaib_localized_data.upgrade_link, '_blank' );
			return;
		}

		setPostIdeas( '' );
		setLoading( true );
		setError( null );
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
		navigate( `?page=${ wpaib_localized_data.home_slug }&path=settings` ); // Navigate to the settings tab.
	};

	if ( error ) {
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

		return (
			<div className="p-4 text-red-500 flex flex-col items-center">
				<p> { __( 'Error while loading post ideas:', 'wp-ai-blogger' ) } { error } </p>
				<button
					onClick={ handleRefresh }
					className="mt-4 flex items-center gap-2 bg-indigo-600 text-white rounded px-4 py-2"
				>
					<RotateCw className="h-4 w-4" />
					{ __( 'Retry', 'wp-ai-blogger' ) }
				</button>
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
		formData.append( 'security', wpaib_localized_data.admin_nonce );

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
			url: wpaib_localized_data.ajax_url,
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
				e.target.href = wpaib_localized_data.edit_post_link.replace( '{{POST_ID}}', response.data.post_id );
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
				<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-2">
					<span
						className="inline-flex items-center text-xs font-medium text-indigo-700 relative"
						onMouseEnter={ () => setShowTooltip( true ) }
						onMouseLeave={ () => setShowTooltip( false ) }
					>
						{ showTooltip && (
							<div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 mt-2 whitespace-nowrap">
								{ __( 'Upgrade to Pro', 'wp-ai-blogger' ) }
							</div>
						) }
						<button
							type="button"
							className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-none cursor-pointer flex items-center gap-x-1"
							onClick={ handleRefresh }
						>
							{
								wpaib_localized_data.pro_available ? (
									<RotateCw className="w-4 h-4" />
								) : (
									<Crown className="w-4 h-4" />
								)
							}
							{ __( 'Refresh', 'wp-ai-blogger' ) }
						</button>
					</span>
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
									{ postIdeasArr.map( ( post ) => (
										<tr key={ post.title } className="even:bg-gray-50">
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
												{ TrimWordsContent( post.title, 120 ) }
											</td>
											<td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
												<a target="_blank" href="#" onClick={ ( e ) => wpaib_create_post( e, post.title ) } className="text-indigo-600 hover:text-indigo-900 flex items-center gap-x-1 cursor-pointer" data-type="create">
													<Plus className="w-5 h-5" />
													{ __( 'Create', 'wp-ai-blogger' ) }
												</a>
											</td>
										</tr>
									) ) }
								</tbody>

								<tfoot className="bg-gray-50">
									<tr>
										<td colSpan="5" className="px-3 py-3.5 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-900">
											<a href={ wpaib_localized_data.upgrade_link } className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center gap-x-1">
												{ __( 'Upgrade to Pro to Unlock More Features.', 'wp-ai-blogger' ) }
												<MoveRight className="w-5 h-5" />
											</a>
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
