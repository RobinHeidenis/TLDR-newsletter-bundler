import {Auth, google} from "googleapis";
import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {env} from "~/env.mjs";
import {parseEmailHTML} from "~/utils/parseEmailHTML";
import {utcToZonedTime} from "date-fns-tz"
import {endOfDay, startOfDay} from "date-fns";
import {TRPCError} from "@trpc/server";

export const emailRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({text: z.string()}))
    .query(({input}) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  today: publicProcedure
    .query(async () => {
      const authJSON = {
        type: "authorized_user",
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
      }
      const auth = google.auth.fromJSON(authJSON);
      const gmail = google.gmail({version: 'v1', auth: auth as Auth.OAuth2Client});

      const date = utcToZonedTime(new Date().getTime(), 'Europe/Amsterdam');
      const beginningOfDayDate = startOfDay(date).getTime().toString().slice(0, -3);
      const endOfDayDate = endOfDay(date).getTime().toString().slice(0, -3);

      const res = await gmail.users.messages.list({
        userId: 'me',
        q: `from:dan@tldrnewsletter.com after:${beginningOfDayDate} before:${endOfDayDate}`,
        prettyPrint: true,
      })

      if (!res.data.messages) throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No TLDR emails found for today',
      })

      return (await Promise.all(res.data.messages.map(async (message) => {
        if (!message.id) throw new Error('No message id found');

        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const rawEmailHTML = atob(email.data.payload?.parts?.[1]?.body?.data?.replace(/-/g, '+').replace(/_/g, '/') ?? '');
        const emailHTML = Buffer.from(rawEmailHTML, 'ascii').toString('utf-8');

        return parseEmailHTML(emailHTML)
      }))).flatMap(entries => entries);
    }),
});
