import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {utcToZonedTime} from "date-fns-tz";
import {addHours, endOfDay, startOfDay, subDays} from "date-fns";
import {TRPCError} from "@trpc/server";
import {parseEmailHTML} from "~/utils/parseEmailHTML";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;

export const cronRouter = createTRPCRouter({
  saveTodaysEmails: publicProcedure
    .query(async ({ctx: {db, gmail}}) => {
      const collection = db.collection('TLDREntries');
      // TODO: fix this
      const date = utcToZonedTime(subDays(new Date().getTime(), 1).getTime(), 'Europe/Amsterdam');
      const beginningOfDayDate = addHours(startOfDay(date),2).getTime().toString().slice(0, -3);
      const endOfDayDate = endOfDay(date).getTime().toString().slice(0, -3);

      const snapshot = await collection.where('date', '==', addHours(startOfDay(date),2)).get();
      if (!snapshot.empty) return;

      console.log('Fetching emails from Gmail API')
      console.log(addHours(startOfDay(date),2))

      const res = await gmail.users.messages.list({
        userId: 'me',
        q: `from:dan@tldrnewsletter.com after:${beginningOfDayDate} before:${endOfDayDate}`,
        prettyPrint: true,
      })

      if (!res.data.messages) throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No TLDR emails found for today',
      })

      const result = (await Promise.all(res.data.messages.map(async (message) => {
        if (!message.id) throw new Error('No message id found');

        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const rawEmailHTML = atob(email.data.payload?.parts?.[1]?.body?.data?.replace(/-/g, '+').replace(/_/g, '/') ?? '');
        const emailHTML = Buffer.from(rawEmailHTML, 'ascii').toString('utf-8');

        return parseEmailHTML(emailHTML)
      }))).flat();

      const batch = db.batch();
      result.forEach((entry) => {
        const docRef = collection.doc();
        batch.set(docRef, {...entry, date: Timestamp.fromDate(startOfDay(date))});
      });

      await batch.commit();

      return result;
    }),
});