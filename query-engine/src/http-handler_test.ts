import { assertEquals } from "@std/assert";
import { createHandler } from "./http-handler.ts";
import { assertSpyCalls } from "@std/testing/mock";
import { createQuerySpy } from "./test-utilities.ts";

const emptyHandler = createHandler(
  () => Promise.reject("Empty handler template response"),
  () => Promise.reject("Empty handler query response"),
);
Deno.test("Responds with unknown request for basic GET", async () => {
  const req = new Request("http://localhost/");
  const res = await emptyHandler(req);
  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(res.status, 405);
  const body = await res.text();
  assertEquals(body, "Method not allowed");
});

Deno.test("Errs if bad form data", async () => {
  const req = new Request("http://localhost/", { method: "POST" });
  const res = await emptyHandler(req);
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
  const res = await emptyHandler(req);
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
  const handler = createHandler(
    () => Promise.reject("Query handler template response"),
    querySpy,
  );
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
    const handler = createHandler(
      () => Promise.reject("Query handler template response"),
      querySpy,
    );
    const res = await handler(req);
    assertEquals(res.headers.get("content-type"), "text/html");
    assertEquals(res.status, 200);
    const responseBody = await res.text();
    assertEquals(responseBody, "7");
    assertSpyCalls(querySpy, 1);
  },
);
