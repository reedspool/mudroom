import { spy } from "@std/testing/mock";
import { query } from "./query.ts";
import { join } from "node:path";
import { TemplateInterface } from "./template.ts";
import { QueryInterface } from "./query.ts";
import { AccessorInterface } from "./accessor.ts";
import { template } from "./template.ts";
import { createHandler, HandlerInterface } from "./http-handler.ts";

export const createQuerySpy = () => spy(query);
export const createTemplateSpy = () => spy(template);

export const createUnworkingAccessorMock: () => AccessorInterface = () => ({
  host: "",
  port: "",
  fetchImpl: fetch,
  GetText: () => Promise.reject("Unworking accessor mock"),
});

export const createAccessorMock: () => AccessorInterface = () => ({
  host: "",
  port: "",
  fetchImpl: fetch,
  GetText: spy((path: string) =>
    Deno.readTextFile(join("./testdata/fixtures/layers/user1/base", path)),
  ),
});

// TODO: Probably want a more solid version of this which accepts and returns
// spys or mocks, and always returns proper spys for assertSpyCalls
export const createTestHandler = ({
  template,
  query,
  accessor,
}: {
  template?: TemplateInterface;
  query?: QueryInterface;
  accessor?: AccessorInterface;
} = {}) => {
  const fulfilled = {
    template:
      template ?? (() => Promise.reject("Empty handler template response")),
    query: query ?? (() => Promise.reject("Empty handler query response")),
    accessor: accessor ?? createUnworkingAccessorMock(),
  };
  return createHandler(fulfilled.template, fulfilled.query, fulfilled.accessor);
};
