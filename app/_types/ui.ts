/**
 * UI Types
 * 
 * This file contains types related to UI components and interactions.
 */

// Button variants
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Form types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

// Layout types
export type Direction = 'row' | 'column';
export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// Animation types
export type AnimationVariant = 'fade' | 'slide' | 'scale' | 'rotate';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

// Toast types
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

// Modal types
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Color types
export type ColorScheme = 'primary' | 'secondary' | 'accent' | 'warning' | 'error' | 'success' | 'info'; 