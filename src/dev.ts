import { mountIkasue } from "./index";

const target = document.querySelector<HTMLElement>("#app");

if (!target) {
  throw new Error("The development shell requires an #app element.");
}

const mount = mountIkasue(target, { label: "ikasue toolchain shell" });
const heading = document.createElement("h1");
heading.textContent = "ikasue";
const message = document.createElement("p");
message.textContent =
  "Phase 1 toolchain ready. The component catalog comes next.";
mount.element.append(heading, message);
