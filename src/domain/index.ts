/**
 * Domain module exports
 */

export { Widget, type WidgetCreateConfig } from "./Widget";
export { WidgetRegistry, type WidgetSchema } from "./WidgetRegistry";
export {
  Container,
  type ContainerChild,
  type ContainerCreateConfig,
} from "./Container";
export {
  Page,
  type PageCreateConfig,
  type PageContent,
  type PageTranslations,
} from "./Page";
export { Skin, type SkinCreateConfig, type SkinScope } from "./Skin";
export { SkinRegistry } from "./SkinRegistry";
export { Site, type SiteCreateConfig } from "./Site";

// Initialize SkinRegistry with Skin class (after both modules are loaded)
import { Skin } from "./Skin";
import { SkinRegistry } from "./SkinRegistry";
SkinRegistry.setSkinClass(Skin);
