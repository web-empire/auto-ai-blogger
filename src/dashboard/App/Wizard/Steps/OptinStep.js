import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight, User, Mail, Star, TrendingUp, CheckCircle2, AlertCircle, Loader2, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';
import { useNavigate } from 'react-router-dom';

// Enhanced input field component
const FormField = memo( ( {
	id,
	label,
	type = 'text',
	value,
	onChange,
	placeholder,
	error,
	disabled,
	icon: Icon,
	required = true,
} ) => {
	const [ isFocused, setIsFocused ] = useState( false );

	const handleFocus = useCallback( () => setIsFocused( true ), [] );
	const handleBlur = useCallback( () => setIsFocused( false ), [] );

	return (
		<div className="space-y-2">
			<label
				htmlFor={ id }
				className="flex items-center gap-2 text-sm font-semibold text-gray-900"
			>
				{ Icon && <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" /> }
				{ label }
				{ required && <span className="text-red-500" aria-label={ __( 'Required', 'wp-ai-blogger' ) }>*</span> }
			</label>

			<div className="relative">
				<input
					id={ id }
					type={ type }
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					onFocus={ handleFocus }
					onBlur={ handleBlur }
					disabled={ disabled }
					placeholder={ placeholder }
					className={ `
						w-full pl-4 pr-10 py-3 text-sm border rounded-lg transition-all duration-200
						${ error
			? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
			: 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500'
		}
						${ isFocused ? 'shadow-md' : 'shadow-sm' }
						${ disabled ? 'bg-gray-100 cursor-not-allowed' : '' }
						focus:outline-none focus:ring-2 focus:ring-opacity-50
						placeholder:text-gray-400
					` }
					aria-describedby={ error ? `${ id }-error` : undefined }
					aria-invalid={ !! error }
				/>

				{ /* Status indicator */ }
				<div className="absolute right-3 top-3">
					{ error ? (
						<AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
					) : value && ! error ? (
						<CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
					) : null }
				</div>
			</div>

			{ error && (
				<p id={ `${ id }-error` } className="text-xs text-red-600 flex items-center gap-1">
					<AlertCircle className="w-3 h-3" />
					{ error }
				</p>
			) }
		</div>
	);
} );

FormField.displayName = 'OptinFormField';

// Enhanced benefit card component
const BenefitCard = memo( ( { icon: Icon, title, description, highlight = false } ) => (
	<div className={ `
		p-4 rounded-xl border transition-all duration-200 hover:shadow-md
		${ highlight
		? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
		: 'bg-gray-50 border-gray-200'
	}
	` }>
		<div className="flex items-start gap-3">
			<div className={ `
				p-2 rounded-lg shrink-0
				${ highlight ? 'bg-indigo-100' : 'bg-gray-100' }
			` }>
				<Icon className={ `w-5 h-5 ${ highlight ? 'text-indigo-600' : 'text-gray-600' }` } aria-hidden="true" />
			</div>
			<div>
				<h3 className="text-sm font-semibold text-gray-900 mb-1">
					{ title }
				</h3>
				<p className="text-xs text-gray-600 leading-relaxed">
					{ description }
				</p>
			</div>
		</div>
	</div>
) );

BenefitCard.displayName = 'OptinBenefitCard';

// Enhanced submit button
const SubmitButton = memo( ( { onClick, disabled, loading, children } ) => {
	const handleClick = useCallback( ( e ) => {
		e.preventDefault();
		if ( ! disabled && ! loading ) {
			onClick( e );
		}
	}, [ onClick, disabled, loading ] );

	return (
		<button
			type="submit"
			onClick={ handleClick }
			disabled={ disabled || loading }
			className="
				group inline-flex items-center gap-3 px-8 py-4
				bg-gradient-to-r from-indigo-600 to-purple-600
				text-white font-semibold rounded-xl shadow-lg
				hover:from-indigo-700 hover:to-purple-700
				focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
				transform transition-all duration-200 hover:scale-105 hover:shadow-xl
				disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
			"
			aria-label={ __( 'Save preferences and continue to final step', 'wp-ai-blogger' ) }
		>
			{ loading ? (
				<Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
			) : (
				<span>{ children }</span>
			) }
			{ ! loading && (
				<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
			) }
		</button>
	);
} );

SubmitButton.displayName = 'OptinSubmitButton';

const OptinStep = memo( () => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Redux state
	const userName = useSelector( ( state ) => state.userName );
	const userEmail = useSelector( ( state ) => state.userEmail );

	// Component state
	const [ name, setName ] = useState( userName || '' );
	const [ email, setEmail ] = useState( userEmail || '' );
	const [ savingOptin, setSavingOptin ] = useState( false );
	const [ errors, setErrors ] = useState( {} );

	// Update component state when Redux state changes
	useEffect( () => {
		setName( userName || '' );
	}, [ userName ] );

	useEffect( () => {
		setEmail( userEmail || '' );
	}, [ userEmail ] );

	useEffect( () => {
		dispatch( { type: 'UPDATE_ONBOARDING_TAB', payload: 'optin' } );
	}, [ dispatch ] );

	// Enhanced form validation
	const validateForm = useCallback( () => {
		const newErrors = {};

		if ( ! name.trim() ) {
			newErrors.name = __( 'First name is required.', 'wp-ai-blogger' );
		} else if ( name.trim().length < 2 ) {
			newErrors.name = __( 'First name must be at least 2 characters.', 'wp-ai-blogger' );
		}

		if ( ! email.trim() ) {
			newErrors.email = __( 'Email address is required.', 'wp-ai-blogger' );
		} else if ( ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email.trim() ) ) {
			newErrors.email = __( 'Please enter a valid email address.', 'wp-ai-blogger' );
		}

		setErrors( newErrors );
		return Object.keys( newErrors ).length === 0;
	}, [ name, email ] );

	// Handle name change
	const updateName = useCallback( ( value ) => {
		setName( value );
		dispatch( { type: 'UPDATE_USER_NAME', payload: value } );
		// Clear name error when user types
		if ( errors.name ) {
			setErrors( ( prev ) => ( { ...prev, name: '' } ) );
		}
	}, [ dispatch, errors.name ] );

	// Handle email change
	const updateEmail = useCallback( ( value ) => {
		setEmail( value );
		dispatch( { type: 'UPDATE_USER_EMAIL', payload: value } );
		// Clear email error when user types
		if ( errors.email ) {
			setErrors( ( prev ) => ( { ...prev, email: '' } ) );
		}
	}, [ dispatch, errors.email ] );

	// Handle step redirection
	const handleStepRedirection = useCallback( ( stepToRedirect ) => {
		navigate( `${ wpaib_localized_data.admin_app_url }&step=${ stepToRedirect }` );
	}, [ navigate ] );

	// Enhanced form submission
	const submitOptinForm = useCallback( async ( e ) => {
		e.preventDefault();

		if ( ! validateForm() ) {
			return;
		}

		setSavingOptin( true );
		setErrors( {} );

		try {
			// Update data in parallel
			await Promise.all( [
				updateApiData( 'userName', name.trim(), dispatch, abortControllerRef ),
				updateApiData( 'userEmail', email.trim(), dispatch, abortControllerRef ),
			] );

			// Update Redux state
			dispatch( { type: 'UPDATE_USER_NAME', payload: name.trim() } );
			dispatch( { type: 'UPDATE_USER_EMAIL', payload: email.trim() } );

			// Small delay for better UX
			setTimeout( () => {
				handleStepRedirection( 'ready' );
			}, 500 );
		} catch ( error ) {
			console.error( 'Failed to save user data:', error );
			setErrors( {
				general: __( 'Failed to save your information. Please try again.', 'wp-ai-blogger' ),
			} );
		} finally {
			setSavingOptin( false );
		}
	}, [ validateForm, name, email, dispatch, handleStepRedirection ] );

	const benefits = [
		{
			icon: TrendingUp,
			title: __( 'Trending Topic Insights', 'wp-ai-blogger' ),
			description: __( 'Get weekly reports on trending topics in your niche to stay ahead of the curve.', 'wp-ai-blogger' ),
			highlight: true,
		},
		{
			icon: Star,
			title: __( 'Marketing Strategies', 'wp-ai-blogger' ),
			description: __( 'Receive proven marketing strategies and growth tips from successful bloggers.', 'wp-ai-blogger' ),
		},
		{
			icon: Heart,
			title: __( 'Blog Growth Tips', 'wp-ai-blogger' ),
			description: __( 'Access exclusive content optimization and audience engagement techniques.', 'wp-ai-blogger' ),
		},
	];

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
			role="main"
			aria-labelledby="optin-heading"
		>
			<div className="w-full max-w-4xl">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
					{ /* Header */ }
					<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
						<div className="mb-4">
							<span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-medium rounded-full tracking-wide uppercase">
								<Star className="w-4 h-4 mr-2" aria-hidden="true" />
								{ __( 'Step 4 of 5', 'wp-ai-blogger' ) }
							</span>
						</div>
						<h1 id="optin-heading" className="text-3xl font-bold text-white mb-2">
							{ __( 'Almost There!', 'wp-ai-blogger' ) }
						</h1>
						<h2 className="text-xl font-semibold text-indigo-100 mb-2">
							{ __( 'Get personalized growth insights', 'wp-ai-blogger' ) }
						</h2>
					</div>

					<div className="p-8">
						<div className="grid lg:grid-cols-2 gap-8">
							{ /* Form Section */ }
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-6">
									{ __( 'Your Information', 'wp-ai-blogger' ) }
								</h3>

								<form className="space-y-6" onSubmit={ submitOptinForm }>
									<FormField
										id="wpaib-user-name"
										label={ __( 'First Name', 'wp-ai-blogger' ) }
										type="text"
										value={ name }
										onChange={ updateName }
										placeholder={ __( 'Enter your first name', 'wp-ai-blogger' ) }
										error={ errors.name }
										disabled={ savingOptin }
										icon={ User }
									/>

									<FormField
										id="wpaib-user-email"
										label={ __( 'Email Address', 'wp-ai-blogger' ) }
										type="email"
										value={ email }
										onChange={ updateEmail }
										placeholder={ __( 'Enter your email address', 'wp-ai-blogger' ) }
										error={ errors.email }
										disabled={ savingOptin }
										icon={ Mail }
									/>

									{ /* General error */ }
									{ errors.general && (
										<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
											<div className="flex items-center gap-2">
												<AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
												<p className="text-red-800">{ errors.general }</p>
											</div>
										</div>
									) }

									{ /* Submit button */ }
									<div className="flex justify-center pt-4">
										<SubmitButton
											onClick={ submitOptinForm }
											disabled={ ! name.trim() || ! email.trim() }
											loading={ savingOptin }
										>
											{ savingOptin
												? __( 'Saving…', 'wp-ai-blogger' )
												: __( 'Save & Continue', 'wp-ai-blogger' )
											}
										</SubmitButton>
									</div>

									{ /* Trust indicator */ }
									<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
											<span className="text-sm font-semibold text-green-800">
												{ __( 'Privacy Guaranteed', 'wp-ai-blogger' ) }
											</span>
										</div>
										<p className="text-xs text-green-700">
											{ __( 'We respect your privacy. No spam, unsubscribe anytime. Your data is secure and never shared.', 'wp-ai-blogger' ) }
										</p>
									</div>
								</form>
							</div>

							{ /* Benefits Section */ }
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-6">
									{ __( 'What You\'ll Receive', 'wp-ai-blogger' ) }
								</h3>

								<div className="space-y-4">
									{ benefits.map( ( benefit, index ) => (
										<BenefitCard
											key={ index }
											icon={ benefit.icon }
											title={ benefit.title }
											description={ benefit.description }
											highlight={ benefit.highlight }
										/>
									) ) }
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{ /* Screen reader announcements */ }
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{ savingOptin && __( 'Saving your information…', 'wp-ai-blogger' ) }
				{ errors.general && __( `Error: ${ errors.general }`, 'wp-ai-blogger' ) }
			</div>
		</main>
	);
} );

OptinStep.displayName = 'WizardOptinStep';

export default OptinStep;
