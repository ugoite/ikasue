import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import type { Loader, LoaderContext } from "astro/loaders";
import { defineCollection } from "astro:content";
import {
  CATALOG_PAGE_COPY,
  COMPONENT_MATRIX_PAGE_COPY,
} from "../../src/catalog/registry";
import type { CatalogLocale, CatalogPageId } from "../../src/catalog/types";

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
            /\/content\/docs\/(en\/)?(?:(?:components\/([^/]+))|(philosophy))\.(?:md|mdx)$/,
          );
          const locale: CatalogLocale = match?.[1] ? "en" : "ja";
          const slug = match?.[2] ?? (match?.[3] ? "philosophy" : undefined);
          const page =
            slug === "index"
              ? COMPONENT_MATRIX_PAGE_COPY[locale]
              : slug && slug in CATALOG_PAGE_COPY
                ? CATALOG_PAGE_COPY[slug as CatalogPageId][locale]
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
