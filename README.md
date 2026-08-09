# ikasue

ikasue is a small standard-web component library for information-dense workspaces.

The public API uses familiar Flex, Stack, Grid, ScrollArea, Tabs, Sidebar, Toolbar, native inputs, DataGrid, Dialog, and a small set of workspace patterns. CSS and the browser own layout geometry. TypeScript owns explicit state and interaction.

## Development

```sh
npm install
npm run check
npm run build
npm run docs:check
npm run docs:build
```

The docs site is an Astro + Starlight site with manually mirrored Japanese and English pages. The visual language stays flat, readable during work, directional, and keyboard-first. Selected work receives area; loading keeps its content mounted; panels remain in flow.

## Publishing

Documentation is deployed to GitHub Pages and the package is published to GitHub Packages by the existing workflows.

## License

MIT
