import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import type { Loader, LoaderContext } from "astro/loaders";
import { defineCollection } from "astro:content";
import {
  COMPONENT_MATRIX_PAGE_COPY,
  COMPONENT_PAGE_COPY,
} from "../../src/catalog/registry";

function registryDocsLoader(): Loader {
  const loader = docsLoader();

  return {
    ...loader,
    name: "starlight-docs-loader-with-registry-pages",
    load(context: LoaderContext) {
      return loader.load({
        ...context,
        parseData: ({ id, data, filePath }) => {
          const normalizedPath = filePath?.replaceAll("\\", "/") ?? "";
          const match = normalizedPath.match(
            /\/content\/docs\/(en\/)?components\/([^/]+)\.mdx$/,
          );
          const locale = match?.[1] ? "en" : "ja";
          const slug = match?.[2];
          const page =
            slug === "index"
              ? COMPONENT_MATRIX_PAGE_COPY[locale]
              : slug && slug in COMPONENT_PAGE_COPY
                ? COMPONENT_PAGE_COPY[slug as keyof typeof COMPONENT_PAGE_COPY][
                    locale
                  ]
                : undefined;

          return context.parseData({
            id,
            filePath,
            data: page ? { ...data, ...page } : data,
          });
        },
      });
    },
  };
}

export const collections = {
  docs: defineCollection({
    loader: registryDocsLoader(),
    schema: docsSchema(),
  }),
};
