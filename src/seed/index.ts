import { getPayload } from "payload";
import config from "@payload-config";
import { seedExperiences } from "./experiences";
import { seedGallery } from "./gallery";
import { seedHero } from "./hero";
import { seedMedia } from "./media";
import { seedRoomInventory } from "./roomInventory";
import { seedRooms } from "./rooms";
import { seedSiteSettings } from "./siteSettings";
import { seedTariff } from "./tariff";

async function seed() {
  const payload = await getPayload({ config });
  const media = await seedMedia(payload);
  await seedHero(payload, media);
  await seedRooms(payload, media);
  await seedExperiences(payload, media);
  await seedGallery(payload, media);
  await seedTariff(payload);
  await seedSiteSettings(payload);
  await seedRoomInventory(payload);
  payload.logger.info("seed: done");
  process.exit(0);
}

await seed();
