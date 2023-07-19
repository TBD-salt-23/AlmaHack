// This is an example of how to read a JSON Web Token from an API route
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

import type { NextApiRequest, NextApiResponse } from 'next';
import { BASE_URL } from '../../../utils/consts';
import { weekBoundaries } from '../../../utils/helpers';
import { GoogleCalendar } from '../../../utils/types';
let accessToken: string;

const getNextWeekFromGoogle = async (
  calendarId: string = 'primary'
): Promise<any> => {
  try {
    const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();

    const eventResponse = await axios.get(`${BASE_URL}/${calendarId}/events`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        timeMin: nextWeekStart.toISOString(),
        timeMax: nextWeekEnd.toISOString(),
        orderBy: 'startTime',
        singleEvents: true,
      },
    });

    const eventList = eventResponse.data.items;
    const calendarResponse = await axios.get(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

      const primaryCalendar = calendarResponse.data.items
        .filter((calendar: GoogleCalendar) => {
          return calendar.primary;
        })
        .map((calendar: GoogleCalendar) => ({
          id: calendar.id,
          summary: `${calendar.summary} (Primary)`,
        }));
      const ownedCalendars = calendarResponse.data.items
        .filter(
          (calendar: GoogleCalendar) =>
            (calendar.accessRole === 'owner' ||
              calendar.accessRole === 'writer') &&
            !calendar.primary
        )
        .map((calendar: GoogleCalendar) => ({
          id: calendar.id,
          summary: calendar.summary,
        }));
      const calendarList = [...primaryCalendar, ...ownedCalendars];
    console.log('calendar list', calendarList);

    //
    // if (data?.nextPageToken) {
    //   return data.items.concat(await getNextWeekFromGoogle(data.nextPageToken));
    // }

    return { eventList, calendarList };
  } catch (error) {
    console.log(
      'this is the error from within the axios get',
      (error as Error).message
    );
    throw new Error((error as Error).message);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('HELLO! we are in the funky backend folder');
  const { calendarId } = req.query;
  console.log('hopefully this is calendar id', calendarId);

  const session = await getServerSession(req, res, authOptions);

  if (session) {
    try {
      const token = await getToken({ req });
      accessToken = token?.accessToken as string;
      const { eventList, calendarList } = await getNextWeekFromGoogle(
        calendarId?.toString()
      );
      return res.json({ eventList, calendarList });
    } catch (error) {
      return res.json((error as Error).message);
    }
  }

  res.send({
    error: 'You must be signed in to view the protected content on this page.',
  });
}
