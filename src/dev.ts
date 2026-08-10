import { mountCatalog } from "./index";

const target = document.querySelector<HTMLElement>("#app");

if (!target) {
  throw new Error("The development shell requires an #app element.");
}

mountCatalog(target);
