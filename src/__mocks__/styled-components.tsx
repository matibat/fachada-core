/**
 * Test stub for styled-components.
 * fachada-core uses styled-components as a peer dep (not installed in devDeps).
 * This stub is aliased in vitest.config.ts so tests that import ThemeContext
 * work without the real package.
 */
import React from 'react';
import type { ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);

export const useTheme = () => ({});
export const createGlobalStyle = () => null;
export const css = (...args: unknown[]) => args;
export const keyframes = (...args: unknown[]) => args;

const tagged = () => () => null;
export const styled: Record<string, unknown> = new Proxy(
    {},
    {
        get: (_target, _prop) => tagged,
        apply: () => tagged,
    },
);

export default {
    ThemeProvider,
    useTheme,
    createGlobalStyle,
    css,
    keyframes,
    styled,
};
