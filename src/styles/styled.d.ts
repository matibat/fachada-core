import type { ThemeTokens } from "../utils/theme.config";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeTokens {}
}
