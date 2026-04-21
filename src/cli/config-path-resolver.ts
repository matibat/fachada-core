#!/usr/bin/env node
/**
 * Config Path Resolver — CLI utility for resolving application config paths
 *
 * Provides sensible defaults and environment variable support for CLI commands
 * that need to load application.yaml configuration files.
 *
 * Resolution order (highest to lowest priority):
 *   1. Explicit --config-path flag
 *   2. FACHADA_CONFIG environment variable
 *   3. Default: ./application.yaml in current directory
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Options for resolving config paths
 */
export interface ConfigPathResolverOptions {
  /** Explicit config path from CLI flag */
  configPath?: string;
  /** Working directory for relative paths (default: process.cwd()) */
  cwd?: string;
  /** Whether to validate file exists (default: true) */
  validateExists?: boolean;
}

/**
 * Result of config path resolution
 */
export interface ResolvedConfigPath {
  /** Absolute path to config file */
  absolutePath: string;
  /** Relative path for display purposes */
  displayPath: string;
  /** Source of the resolved path (flag, env, or default) */
  source: "flag" | "env" | "default";
}

/**
 * Default config file name
 */
export const DEFAULT_CONFIG_FILENAME = "application.yaml";

/**
 * Environment variable name for config path
 */
export const CONFIG_ENV_VAR = "FACHADA_CONFIG";

/**
 * Resolve config file path with sensible defaults
 *
 * @param options - Resolution options (configPath, cwd, validateExists)
 * @returns Resolved config path object with absolute path and source
 * @throws Error if file not found and validateExists is true
 *
 * @example
 * // Use explicit path
 * const resolved = resolveConfigPath({ configPath: './my-config.yaml' });
 *
 * @example
 * // Use environment variable or default
 * const resolved = resolveConfigPath();
 *
 * @example
 * // Resolve without validation (for existence checks later)
 * const resolved = resolveConfigPath({ validateExists: false });
 */
export function resolveConfigPath(
  options: ConfigPathResolverOptions = {},
): ResolvedConfigPath {
  const { configPath, cwd = process.cwd(), validateExists = true } = options;

  // Priority 1: Explicit --config-path flag
  if (configPath) {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.join(cwd, configPath);

    if (validateExists && !fs.existsSync(absolutePath)) {
      throw new Error(
        `Config file not found at: ${absolutePath}\n` +
          `Provided via --config-path flag.`,
      );
    }

    return {
      absolutePath,
      displayPath: configPath,
      source: "flag",
    };
  }

  // Priority 2: FACHADA_CONFIG environment variable
  const envConfigPath = process.env[CONFIG_ENV_VAR];
  if (envConfigPath) {
    const absolutePath = path.isAbsolute(envConfigPath)
      ? envConfigPath
      : path.join(cwd, envConfigPath);

    if (validateExists && !fs.existsSync(absolutePath)) {
      throw new Error(
        `Config file not found at: ${absolutePath}\n` +
          `Resolved from ${CONFIG_ENV_VAR} environment variable: "${envConfigPath}".`,
      );
    }

    return {
      absolutePath,
      displayPath: envConfigPath,
      source: "env",
    };
  }

  // Priority 3: Default ./application.yaml
  const defaultPath = path.join(cwd, DEFAULT_CONFIG_FILENAME);

  if (validateExists && !fs.existsSync(defaultPath)) {
    throw new Error(
      `Config file not found at: ${defaultPath}\n\n` +
        `No config path provided. To specify a config file:\n` +
        `  1. Use --config-path flag: --config-path ./path/to/config.yaml\n` +
        `  2. Set environment variable: export ${CONFIG_ENV_VAR}=./path/to/config.yaml\n` +
        `  3. Place config file at default location: ./application.yaml\n`,
    );
  }

  return {
    absolutePath: defaultPath,
    displayPath: `./${DEFAULT_CONFIG_FILENAME}`,
    source: "default",
  };
}

/**
 * Check if config file exists at resolved path
 *
 * @param options - Resolution options (configPath, cwd)
 * @returns true if config file exists, false otherwise (never throws)
 */
export function configExists(options: ConfigPathResolverOptions = {}): boolean {
  try {
    resolveConfigPath({ ...options, validateExists: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get CLI argument for config path
 *
 * Parses --config-path or --config flag from process.argv
 *
 * @param argv - Command line arguments (default: process.argv.slice(2))
 * @returns Config path value if found, undefined otherwise
 *
 * @example
 * // process.argv = ['node', 'script.js', '--config-path', './app.yaml']
 * const configPath = getConfigPathArg();
 * // Returns: './app.yaml'
 */
export function getConfigPathArg(
  argv: string[] = process.argv.slice(2),
): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--config-path" || argv[i] === "--config") {
      return argv[i + 1];
    }
  }
  return undefined;
}
