# Brand Color Usage Guide

## Overview
WP AI Blogger uses a purple brand color (`#9138c8`) as its primary color. This guide explains how to use the brand colors consistently across the application.

## Color System

### Primary Brand Color
- **Main**: `#9138c8` (Purple)
- **Hover**: `#7a2db0` (Darker Purple)
- **Light**: `#a855f7` (Lighter Purple)
- **Dark**: `#6b21a8` (Deep Purple)

## Usage

### 1. CSS/SCSS Files

Use CSS custom properties:

```scss
/* Background */
background-color: var(--wpaib-brand-primary);

/* Hover state */
&:hover {
  background-color: var(--wpaib-brand-primary-hover);
}

/* Text color */
color: var(--wpaib-brand-500);

/* Border */
border-color: var(--wpaib-brand-primary);
```

### 2. Tailwind Classes (JSX/React Components)

Use the `brand-` prefix:

```jsx
// Background
<div className="bg-brand-500 hover:bg-brand-600">

// Text
<span className="text-brand-500">

// Border
<div className="border-brand-500">

// Gradients
<div className="from-brand-50 to-brand-100">
```

### 3. Common Replacements

When updating existing code, replace blue classes with brand classes:

| Old Blue Class | New Brand Class |
|----------------|-----------------|
| `bg-blue-50` | `bg-brand-50` |
| `bg-blue-100` | `bg-brand-100` |
| `bg-blue-500` | `bg-brand-500` |
| `bg-blue-600` | `bg-brand-600` |
| `text-blue-500` | `text-brand-500` |
| `text-blue-600` | `text-brand-600` |
| `text-blue-700` | `text-brand-700` |
| `border-blue-200` | `bg-brand-200` |
| `from-blue-50` | `from-brand-50` |
| `ring-blue-500` | `ring-brand-500` |

### 4. Hex Code Replacements

| Old Hex | New Hex | Usage |
|---------|---------|-------|
| `#2563eb` | `#9138c8` | Primary buttons, active states |
| `#1d4ed8` | `#7a2db0` | Hover states |
| `rgb(4 107 210)` | `#9138c8` or `rgb(145, 56, 200)` | Active menu items |

## Color Scale

```
50:  #faf5ff  - Backgrounds
100: #f3e8ff  - Light backgrounds
200: #e9d5ff  - Borders, light accents
300: #d8b4fe  - Disabled states
400: #c084fc  - Secondary elements
500: #9138c8  - Primary brand (DEFAULT)
600: #7a2db0  - Hover states, active buttons
700: #6b21a8  - Active states, emphasis
800: #581c87  - Strong emphasis
900: #3b0764  - Maximum contrast
```

## Examples

### Button Component
```jsx
<button className="bg-brand-500 hover:bg-brand-600 text-white">
  Click me
</button>
```

### Card with Brand Accent
```jsx
<div className="border-l-4 border-brand-500 bg-brand-50">
  Content
</div>
```

### Gradient Background
```jsx
<div className="bg-gradient-to-r from-brand-50 to-purple-50">
  Gradient background
</div>
```

## Notes

- Always use the brand color system for primary actions and brand elements
- Keep the color consistent across all UI components
- Use lighter shades (50-300) for backgrounds
- Use medium shades (400-600) for interactive elements
- Use dark shades (700-900) for text and emphasis
