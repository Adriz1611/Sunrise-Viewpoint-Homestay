import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

/**
 * The homepage is statically prerendered, so publishing has to invalidate it.
 *
 * Two guards matter here. `context.disableRevalidate` lets the seed script
 * write globals without this firing. The try/catch covers calls that happen
 * outside a Next request scope (seeding, build-time writes), where
 * revalidatePath throws rather than no-oping.
 */
export const revalidateHome: GlobalAfterChangeHook = ({ context, doc, req }) => {
  if (context?.disableRevalidate) return doc;

  try {
    revalidatePath("/");
  } catch (error) {
    req.payload.logger.warn(
      `revalidatePath('/') skipped: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return doc;
};
