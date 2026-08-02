import "./styles.css";

export const PACKAGE_NAME = "@ugoite/ikasue";
export const ROOT_CLASS_NAME = "ikasue-root";
const DEFAULT_MOUNT_LABEL = "ikasue workspace";

export interface MountOptions {
  label?: string;
}

export interface IkasueMount {
  readonly element: HTMLElement;
  dispose(): void;
}

export function getMountLabel(label?: string): string {
  const normalizedLabel = label?.trim();
  return normalizedLabel || DEFAULT_MOUNT_LABEL;
}

/** Mounts the phase 1 root element without imposing a framework runtime. */
export function mountIkasue(
  target: HTMLElement,
  options: MountOptions = {},
): IkasueMount {
  const element = target.ownerDocument.createElement("section");
  element.className = ROOT_CLASS_NAME;
  element.setAttribute("aria-label", getMountLabel(options.label));
  target.append(element);

  return {
    element,
    dispose: () => {
      element.remove();
    },
  };
}
