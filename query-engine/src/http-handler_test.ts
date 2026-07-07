import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { assertSpyCalls, spy, stub } from "@std/testing/mock";
import {
  createAccessorMock,
  createQuerySpy,
  createTemplateSpy,
  createTestHandler,
  createUnworkingAccessorMock,
} from "./test-utilities.ts";

Deno.test("Responds with unknown request for basic GET", async () => {
  const req = new Request("http://localhost/");
  const res = await createTestHandler()(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 405);
  const body = await res.text();
  assertEquals(body, "Method not allowed");
});

Deno.test("Errs if bad form data", async () => {
  const req = new Request("http://localhost/", { method: "POST" });
  using consoleErrorSpy = stub(console, "error");
  const res = await createTestHandler()(req);
  assertSpyCalls(consoleErrorSpy, 1);
  assertEquals(consoleErrorSpy.calls[0].args[0], "Could not parse form data:");
  assert(
    consoleErrorSpy.calls[0].args[1]
      .toString()
      .startsWith("TypeError: Missing content type"),
  );
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 400);
  const responseBody = await res.text();
  assertEquals(responseBody, "Bad request");
});

Deno.test("Responds with empty string if no expression", async () => {
  const body = new FormData();
  const req = new Request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const res = await createTestHandler()(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  const responseBody = await res.text();
  assertEquals(responseBody, "");
  assertEquals(res.status, 200);
});

Deno.test("Responds with simple query result for urlencoded", async () => {
  const body = new URLSearchParams();
  body.set("query", "5+2");
  const req = new Request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const querySpy = createQuerySpy();
  const handler = createTestHandler({
    template: () => Promise.reject("Query handler template response"),
    query: querySpy,
    accessor: createUnworkingAccessorMock(),
  });
  const res = await handler(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 200);
  const responseBody = await res.text();
  assertEquals(responseBody, "7");
  assertSpyCalls(querySpy, 1);
});

Deno.test(
  "Responds with simple query result for multipart/form-data",
  async () => {
    // Cannot use the built-in FormData object for this because it's intentionally
    // opaque to the boundary used, which must be set in the content-type header
    const boundary = "my-boundary";
    const body = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="query"`,
      ``,
      `5+2`,
      `--${boundary}--`,
    ].join("\r\n");
    const req = new Request("http://localhost/", {
      method: "POST",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    const querySpy = createQuerySpy();
    const handler = createTestHandler({
      template: () => Promise.reject("Query handler template response"),
      query: querySpy,
      accessor: createUnworkingAccessorMock(),
    });
    const res = await handler(req);
    assertEquals(res.headers.get("content-type"), "text/html");
    assertEquals(res.status, 200);
    const responseBody = await res.text();
    assertEquals(responseBody, "7");
    assertSpyCalls(querySpy, 1);
  },
);

Deno.test("Responds with simple query result for urlencoded", async () => {
  const body = new URLSearchParams();
  body.set("query", "input1 * 2");
  body.set("input1", "62");
  const req = new Request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const querySpy = createQuerySpy();
  const handler = createTestHandler({
    template: () => Promise.reject("Query handler template response"),
    query: querySpy,
    accessor: createUnworkingAccessorMock(),
  });
  const res = await handler(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 200);
  const responseBody = await res.text();
  assertEquals(responseBody, "124");
  assertSpyCalls(querySpy, 1);
});

Deno.test("Responds with evaluated file", async () => {
  const body = new URLSearchParams();
  body.set("file", "kitchensink.html");
  body.set("renderAs", "html");
  const req = new Request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const template = createTemplateSpy();
  const querySpy = createQuerySpy();
  const accessorMock = createAccessorMock();
  const handler = createTestHandler({
    template: template,
    query: querySpy,
    accessor: accessorMock,
  });
  const res = await handler(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 200);
  const responseBody = await res.text();
  assertStringIncludes(responseBody, "Evaluated h2 content");
  assert(
    !responseBody.includes("Unevaluated h2 content"),
    `Expected the responseBody to not include the given string:\n${responseBody}`,
  );
  assertSpyCalls(template, 1);
  assertSpyCalls(querySpy, 1);
  assertSpyCalls(accessorMock.GetText as ReturnType<typeof spy>, 1);
});

Deno.test(
  "Accepts content in post and responds with evaluated file",
  async () => {
    const body = new URLSearchParams();
    const content = `<code>45*52 = <r- content="45*52">NOT EVALUATED</r-></code>`;
    const expected = `<code>45*52 = 2340</code>`;

    body.set("content", content);

    const req = new Request("http://localhost/", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const template = createTemplateSpy();
    const querySpy = createQuerySpy();
    const accessorMock = createAccessorMock();
    const handler = createTestHandler({
      template: template,
      query: querySpy,
      accessor: accessorMock,
    });
    const res = await handler(req);

    assertEquals(res.headers.get("content-type"), "text/html");
    assertEquals(res.status, 200);
    const responseBody = await res.text();

    assertEquals(responseBody, expected);
  },
);
