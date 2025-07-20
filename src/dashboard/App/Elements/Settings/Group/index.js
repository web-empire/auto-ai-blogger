import React, { lazy, Suspense } from 'react';

// Lazy load components for better performance
const Persona = lazy(() => import('./Persona'));

// Loading fallback component
const ComponentLoader = () => (
	<div className="flex items-center justify-center p-8">
		<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
		<span className="ml-3 text-gray-600">Loading...</span>
	</div>
);

// Enhanced exports with Suspense wrappers
export const PersonaWithSuspense = () => (
	<Suspense fallback={<ComponentLoader />}>
		<Persona />
	</Suspense>
);

// Direct export for backward compatibility
export { Persona };

// Default export
export default {
	Persona,
	PersonaWithSuspense,
};
