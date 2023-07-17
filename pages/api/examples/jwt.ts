// This is an example of how to read a JSON Web Token from an API route
import { getToken } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';
import axios from 'axios';

import type { NextApiRequest, NextApiResponse } from 'next';

let accessToken: any;

const getNextWeekFromGoogle = async (pageToken = ''): Promise<any> => {
  try {
    console.log('this is the access token when GNWFG is called', accessToken);

    const currentDate = new Date();
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
    console.log('this is nextweekstart', nextWeekStart);
    console.log('this is nextweekend', nextWeekEnd);

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

    // return data.items;
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
    // If you don't have the NEXTAUTH_SECRET environment variable set,
    // you will have to pass your secret as `secret` to `getToken`
    const token = await getToken({ req });
    accessToken = token?.accessToken;
    const data = await getNextWeekFromGoogle();

    console.log('this is the data', data.join('\n'));
    // console.log('hopefully this is token', token?.jti);
    // const data = await getYTData();
    res.json(data);
  } catch (error) {
    res.json((error as Error).message);
  }
}
