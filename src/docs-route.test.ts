import { describe, expect, it } from "vitest";
import routeData from "../scripts/catalog-routes.json";
import { routesForBase } from "./catalog/routes";

describe("fixed bilingual routes", () => {
  it("uses the canonical route data for both supported bases", () => {
    expect(routeData.componentIds).toHaveLength(28);
    expect(routesForBase("/").ja[0]).toBe("/");
    expect(routesForBase("/ikasue/").en[0]).toBe("/ikasue/en/");
    expect(routesForBase("/ikasue/").ja).toContain("/ikasue/components/text/");
    const queryMarker = String.fromCharCode(63) + "component" + "=";
    expect(
      routeData.jaRoutes.some((route) => route.includes(queryMarker)),
    ).toBe(false);
  });
});
