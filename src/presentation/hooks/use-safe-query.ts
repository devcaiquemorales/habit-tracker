"use client";

import { type RequestForQueries, useQueries } from "convex/react";
import {
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
  getFunctionName,
} from "convex/server";
import { useMemo } from "react";

/**
 * Like `useQuery`, but a failing function returns an `Error` instead of throwing
 * during render and taking the whole screen down.
 */
export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | Error | undefined {
  // `api.x.y` is a fresh proxy on every access, so identity comes from the name.
  const name = getFunctionName(query);
  const argsKey = JSON.stringify(args);
  const queries = useMemo(
    (): RequestForQueries =>
      args === "skip" ? {} : { result: { query, args } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, argsKey],
  );
  return useQueries(queries).result as
    | FunctionReturnType<Query>
    | Error
    | undefined;
}
