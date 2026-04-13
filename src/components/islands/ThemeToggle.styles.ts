import _styled from "styled-components";
// Astro SSR pre-render runs in Node.js ESM context where styled-components CJS
// module.exports becomes the default — not the styled function itself. Use
// .default if present to handle both ESM and CJS/ESM interop contexts.
const styled = ((_styled as any).default ?? _styled) as typeof _styled;

export const StyledButton = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.75rem;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background-color var(--transition),
    border-color var(--transition),
    color var(--transition);
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;

  &:hover {
    background-color: var(--accent);
    border-color: var(--accent-hover);
    color: var(--bg-primary);
  }
`;
