import { getPayload } from "payload";
import config from "@payload-config";
import { seedMedia } from "./media";
import { seedSiteSettings } from "./siteSettings";

async function seed() {
  const payload = await getPayload({ config });
  const media = await seedMedia(payload);
  payload.logger.info(`seed: ${Object.keys(media).length} media documents ready`);
  await seedSiteSettings(payload);
  payload.logger.info("seed: done");
  process.exit(0);
}

await seed();
