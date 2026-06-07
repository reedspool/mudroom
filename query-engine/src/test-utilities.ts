import { spy } from "@std/testing/mock";

export const createQuerySpy = () => {
  return spy((input) => {
    if (input === "5+2") return Promise.resolve(7);
    return Promise.reject(new Error(`Unhandled query spy input '${input}'`));
  });
};
