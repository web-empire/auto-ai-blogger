module.exports = {
	content: [ './src/dashboard/**/*.{js,jsx,ts,tsx}' ],
	theme: {
		extend: {
			colors: {
				wpprimary: 'var(--wp-admin-theme-color)',
				wpcolor: '#2271b1',
				wphovercolor: '#135e96',
				wphoverbgcolor: '#2271b117',
				wpcolorfaded: '#2271b120',
				required_icon_color: '#EF4444',
				portal: {
					DEFAULT: '#0084c6',
					hover: '#045CB4',
				},
			},
			fontFamily: {
				inter: [ '"Inter"', 'sans-serif' ],
			},
			screens: {
				tablet: { max: '782px' },
				// => @media (max-width: 782px) { ... }
				mobile: { max: '600px' },
				// => @media (max-width: 600px) { ... }
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
};
