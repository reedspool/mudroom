import { spy } from "@std/testing/mock";
import { query } from "./query.ts";

export const createQuerySpy = () => spy(query);
