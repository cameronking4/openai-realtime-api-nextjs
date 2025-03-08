/**
 * Layout Components
 * 
 * This file exports all layout components for easy imports.
 * Components are organized by category for better discoverability.
 */

// Core layout components
export { Header } from '@/app/_components/shared/header';
export { Footer } from '@/app/_components/shared/footer';
export { MobileNav } from '@/app/_components/shared/mobile-nav';

// Specialized layout components
export { SidePanel } from '@/app/_components/shared/side-panel';
export { SidePanelLogs } from '@/app/_components/shared/side-panel-logs';
export { SidePanelTokenUsage } from '@/app/_components/shared/side-panel-token-usage';

// Navigation components
export { ThemeSwitcher } from '@/app/_components/shared/theme-switcher';
export { LanguageSwitcher } from '@/app/_components/shared/language-switcher';

// Status components
export { StatusDisplay as Status } from '@/app/_components/shared/status';

import NetworkErrorAlert from '@/app/_components/shared/network-error-alert';
export { NetworkErrorAlert };

export { Banner } from '@/app/_components/shared/banner';

// Provider components
export { ThemeProvider } from '@/app/_components/shared/theme-provider'; 