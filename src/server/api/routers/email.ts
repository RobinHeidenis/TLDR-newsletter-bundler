import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {addHours, startOfDay, subDays} from "date-fns";
import {type FirestoreTLDREntry} from "~/utils/TLDREntry";
import {type firestore} from "firebase-admin";

export const emailRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({text: z.string()}))
    .query(({input}) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  today: publicProcedure
    .query(async ({ctx}) => {
      const collection = ctx.db.collection('TLDREntries');
      const date = subDays(new Date(), 1);
      const documents = await collection.where('date', '==', addHours(startOfDay(date), 2)).get() as firestore.QuerySnapshot<FirestoreTLDREntry>;

      return documents.docs.map(doc => {
        const {sponsor, link, description, title} = doc.data();
        return {
          title,
          description,
          link,
          sponsor,
        }
      });
    }),
});
