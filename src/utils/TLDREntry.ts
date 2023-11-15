import {z} from "zod";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;

export const TLDREntry = z.object({
  link: z.string().url(),
  title: z.string(),
  description: z.string(),
  sponsor: z.boolean().default(false),
})

export type TLDREntry = z.infer<typeof TLDREntry>;

export type FirestoreTLDREntry = TLDREntry & {
  date: Timestamp,
}