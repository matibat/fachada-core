/**
 * Test file to verify NavbarConfig interface can be imported and used.
 * This file demonstrates proper TypeScript integration.
 */

import type { NavbarConfig, AppConfig } from "./index";

// Test 1: Empty config (all defaults)
const emptyConfig: NavbarConfig = {};
console.log("✅ Test 1 passed: Empty NavbarConfig accepted");

// Test 2: Full config with all properties
const fullConfig: NavbarConfig = {
  variant: "horizontal",
  mobileBreakpoint: "md",
  position: "sticky",
  hasMenu: true,
  menuTriggerLabel: "Menu",
  customClass: "my-navbar",
  mobileMode: "hamburger",
};
console.log("✅ Test 2 passed: Full NavbarConfig accepted");

// Test 3: Partial config (only some properties)
const partialConfig: NavbarConfig = {
  variant: "vertical",
  position: "fixed",
};
console.log("✅ Test 3 passed: Partial NavbarConfig accepted");

// Test 4: NavbarConfig can be used in AppConfig
const appConfigWithNavbar: AppConfig = {
  seo: {
    name: "Test App",
    description: "Test Description",
  },
  theme: {
    defaultColorMode: "light",
    enableColorModeToggle: true,
  },
  themeVariants: {},
  assets: {
    ogImage: "test.png",
  },
  page: {
    sections: [],
  },
  navbar: {
    variant: "horizontal",
    mobileBreakpoint: "lg",
  },
};
console.log("✅ Test 4 passed: NavbarConfig integrates with AppConfig");

// Test 5: NavbarConfig with custom number breakpoint
const customBreakpoint: NavbarConfig = {
  mobileBreakpoint: 900,
};
console.log("✅ Test 5 passed: Custom numeric breakpoint accepted");

// Test 6: AppConfig works without navbar property
const appConfigWithoutNavbar: AppConfig = {
  seo: {
    name: "Test App",
    description: "Test Description",
  },
  theme: {
    defaultColorMode: "light",
    enableColorModeToggle: true,
  },
  themeVariants: {},
  assets: {
    ogImage: "test.png",
  },
  page: {
    sections: [],
  },
  // navbar not specified - backward compatible
};
console.log(
  "✅ Test 6 passed: AppConfig works without navbar (backward compatible)",
);

export {
  emptyConfig,
  fullConfig,
  partialConfig,
  appConfigWithNavbar,
  appConfigWithoutNavbar,
};
