import { __ } from '@wordpress/i18n';
import { Features } from '../Elements/FreeVsPro/Features';
import ProButton from '@Components/ProButton';
import { Sprout } from 'lucide-react';

const FreeVsPro = () => {
	const checkStatus = ( value ) => {
		if ( value === 'yes' ) {
			return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18.3602 6.35938L10.2002 14.5194L6.84016 11.1594L5.16016 12.8394L10.2002 17.8794L20.0402 8.03937L18.3602 6.35938Z" fill="#22C55E"></path></svg>;
		} else if ( value === 'no' ) {
			return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17.9396 7.75255L13.6916 12.0005L17.9396 16.2485L16.2476 17.9405L11.9996 13.7045L7.76357 17.9405L6.05957 16.2365L10.2956 12.0005L6.05957 7.76455L7.76357 6.06055L11.9996 10.2965L16.2476 6.06055L17.9396 7.75255Z" fill="#F87171"></path></svg>;
		}
		return value;
	};

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex flex-row justify-between items-center">
				<h1 className="text-base font-semibold text-gray-900">{ __( 'Free vs Pro', 'wp-ai-blogger' ) }</h1>
				<ProButton />
			</div>

			<div className="mt-6 flex flex-col">
				<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
						<div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
							<table className="w-full divide-y divide-gray-300">
								<thead className="bg-gray-50 header-nav">
									<tr>
										<th
											scope="col"
											className="py-3.5 pl-4 pr-3 text-left text-base font-medium text-slate-800 sm:pl-8"
										>
											{ __( 'Features', 'wp-ai-blogger' ) }
										</th>
										<th
											scope="col"
											className="px-3 py-3.5 text-center text-base font-medium text-slate-800"
										>
											{ __( 'Free', 'wp-ai-blogger' ) }
										</th>
										<th
											scope="col"
											className="px-3 py-3.5 text-center text-base font-medium text-slate-800"
										>
											{ __( 'Pro', 'wp-ai-blogger' ) }
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									{ Features.map( ( feature, key ) => (
										<tr key={ key } className="even:bg-gray-50">
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-base text-slate-600 sm:pl-8">
												{ feature.name }
											</td>
											<td className="whitespace-nowrap capitalize px-3 py-4 text-base text-center text-slate-600">
												<div className="flex justify-center font-medium">
													{ checkStatus( feature.free ) }
												</div>
											</td>
											<td className="whitespace-nowrap capitalize px-3 py-4 text-base text-center text-slate-600">
												<div className="flex justify-center font-medium">
													{ checkStatus( feature.pro ) }
												</div>
											</td>
										</tr>
									) ) }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<section className="mt-6 py-10 flex flex-col bg-slate-200 items-center justify-center shadow-overlay-light rounded-md">
				<Sprout className="w-8 h-8 mb-4 text-[#008000]" />

				<h4 className="text-2xl font-semibold text-slate-800 m-0 p-0 mb-3">
					{ __( 'Start Growing with AI Blogger Pro', 'wp-ai-blogger' ) }
				</h4>

				<div className="max-w-2xl text-center text-base text-slate-600 mb-7">
					{ __( 'Unlock all the features and take your blog to the next level with AI Blogger Pro.', 'wp-ai-blogger' ) }
				</div>

				<ProButton />
			</section>
		</div>
	);
};

export default FreeVsPro;
