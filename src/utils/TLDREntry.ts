import { z } from "zod";
import {categoriesArray} from "~/utils/categories";

export const TLDREntry = z.object({
  link: z.string().url(),
  text: z.string(),
  description: z.string(),
  category: z.enum(categoriesArray),
})

export type TLDREntry = z.infer<typeof TLDREntry>;

export const categories = TLDREntry.shape.category.enum;