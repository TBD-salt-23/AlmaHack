// This is an example of how to read a JSON Web Token from an API route
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

import type { NextApiRequest, NextApiResponse } from 'next';
const BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';

type GoogleTime = {
  dateTime?: Date;
  timeZone?: string;
};

type GoogleEventPost = {
  start: GoogleTime;
  end: GoogleTime;
  summary: string;
};

let accessToken: any;

const addNewEvent = async (
  googleEvent: GoogleEventPost,
  calendarId: string
) => {
  const res = await axios.post(
    `${BASE_URL}/${calendarId}/events`,
    googleEvent,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const getNextWeekFromGoogle = async (): Promise<any> => {
  try {
    const currentDate = new Date();
    //'2023-07-22T23:59:59.000Z'
    const nextWeekStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (7 - currentDate.getDay()) + 1
    );
    const nextWeekEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (7 - currentDate.getDay()) + 8
    );

    const { data } = await axios.get(
      // 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          timeMin: nextWeekStart.toISOString(),
          timeMax: nextWeekEnd.toISOString(),
          orderBy: 'startTime',
          singleEvents: true,
        },
      }
    );

    // if (data?.nextPageToken) {
    //   return data.items.concat(await getNextWeekFromGoogle(data.nextPageToken));
    // }

    return data.items.map((event: any) => {
      return event.summary;
    });
  } catch (error) {
    console.log('this is the error', (error as Error).message);
    return (error as Error).message;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = await getToken({ req });
    accessToken = token?.accessToken;
    const data = await getNextWeekFromGoogle();

    console.log('this is the data', data.join('\n'));

    res.json(data);
  } catch (error) {
    res.json((error as Error).message);
  }
}
