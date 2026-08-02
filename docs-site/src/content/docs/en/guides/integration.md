---
title: Integration
description: Mount the framework-neutral runtime package in an existing application.
---

## Install the package

`@ugoite/ikasue` is published to GitHub Packages. Configure npm for the `@ugoite` scope in the consuming project, then install the package from the GitHub npm registry.

```sh
npm install @ugoite/ikasue --registry=https://npm.pkg.github.com
```

The repository intentionally does not document or invent credentials. Use your organization’s supported GitHub Packages authentication and keep the token in the package manager’s normal user or CI secret store.

## Mount and unmount

```ts
import { mountCatalog } from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const mount = document.getElementById("workspace");
const handle = mount
  ? mountCatalog(mount, {
      label: "Operations workspace",
      component: "axis-flow",
      search: "?component=axis-flow",
    })
  : undefined;

// On route teardown:
handle?.dispose();
```

Use one mount per owned target. The returned handle owns the runtime listeners and generated subtree; call `dispose()` when the host route removes the target.

## Events and layout ownership

The runtime exports `COMMIT_EVENT` and `LAYOUT_REQUEST_EVENT`, plus `dispatchCommit` and `dispatchLayoutRequest`. A `Text` editor commits a value through the commit event. A `FocusRegion` asks its nearest `FocusPlane` for space through the bubbling layout request.

```ts
import { LAYOUT_REQUEST_EVENT, dispatchLayoutRequest } from "@ugoite/ikasue";

dispatchLayoutRequest(document.querySelector("#detail")!, "secondary");
```

The event is a request, not an imperative resize command. The owning plane decides whether the requested allocation fits the current viewport.

## CSS and host layout

Import `@ugoite/ikasue/style.css` once at the application boundary. Give the mount target a real block size and avoid applying an ancestor transform that changes the meaning of directional motion. Keep the host's own focus styles visible.

The docs site includes the interactive catalog at the relative `catalog/` route, so component demo links stay on the same origin and follow the configured Astro base path. The standalone Vite catalog remains available from the root `npm run catalog` command.

The English documentation is manually authored and reviewed alongside the source locale. Do not add external machine-translated prose or rely on an external translation service when updating it.
