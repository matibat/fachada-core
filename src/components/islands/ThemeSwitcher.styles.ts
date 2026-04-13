import _styled from "styled-components";
// Astro SSR pre-render runs in Node.js ESM context where styled-components CJS
// module.exports becomes the default — not the styled function itself. Use
// .default if present to handle both ESM and CJS/ESM interop contexts.
const styled = ((_styled as any).default ?? _styled) as typeof _styled;

export const StyledWrapper = styled.div`
  position: fixed;
  bottom: 6rem;
  right: 1.5rem;
  z-index: 50;
`;

export const StyledTriggerButton = styled.button`
  padding: 0.75rem;
  border-radius: 9999px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px var(--shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);

  &:hover {
    background-color: var(--accent);
    color: var(--bg-primary);
  }
`;

export const StyledDropdown = styled.div`
  position: absolute;
  bottom: 4rem;
  right: 0;
  width: 18rem;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: 0 25px 50px -12px var(--shadow);
  border: 1px solid var(--border);
  overflow: hidden;
`;

export const StyledDropdownHeader = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
`;

export const StyledDropdownTitle = styled.h3`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0;
`;

export const StyledOptionsList = styled.div`
  padding: 0.5rem;
  max-height: 24rem;
  overflow-y: auto;
`;

interface StyledOptionButtonProps {
  $isActive: boolean;
}

export const StyledOptionButton = styled.button<StyledOptionButtonProps>`
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: block;
  transition: var(--transition);
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--accent)" : "transparent"};
  color: ${({ $isActive }) =>
    $isActive ? "var(--bg-primary)" : "var(--text-primary)"};
  border: 2px solid
    ${({ $isActive }) => ($isActive ? "var(--accent)" : "transparent")};

  &:hover {
    background-color: ${({ $isActive }) =>
      $isActive ? "var(--accent-hover)" : "var(--bg-secondary)"};
  }
`;

export const StyledOptionName = styled.span`
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
`;

export const StyledOptionDescription = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
`;

export const StyledDropdownFooter = styled.div`
  padding: 0.5rem;
  border-top: 1px solid var(--border);
  background-color: var(--bg-secondary);
`;

export const StyledCloseButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: var(--transition);

  &:hover {
    color: var(--text-primary);
  }
`;

export const StyledErrorBanner = styled.div`
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
`;

export const StyledErrorText = styled.p`
  font-size: 0.75rem;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
`;
