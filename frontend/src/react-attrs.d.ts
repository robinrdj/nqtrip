import "react";

declare module "react" {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    /**
     * React 18 does not know the camelCase `fetchPriority` prop and drops it
     * with a warning, so we pass the lowercase DOM attribute instead.
     */
    fetchpriority?: "high" | "low" | "auto";
  }
}
