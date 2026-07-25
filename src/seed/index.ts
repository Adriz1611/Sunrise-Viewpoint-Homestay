import { getPayload } from "payload";
import config from "@payload-config";
import { seedMedia } from "./media";
import { seedSiteSettings } from "./siteSettings";
import { seedHero } from "./hero";

async function seed() {
  const payload = await getPayload({ config });
  const media = await seedMedia(payload);
  payload.logger.info(`seed: ${Object.keys(media).length} media documents ready`);
  await seedSiteSettings(payload);
  await seedHero(payload, media);
  payload.logger.info("seed: done");
  process.exit(0);
}

await seed();
