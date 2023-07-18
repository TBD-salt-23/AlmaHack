// This is an example of how to read a JSON Web Token from an API route
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

import type { NextApiRequest, NextApiResponse } from 'next';
import { BASE_URL } from '../../../utils/consts';
import { weekBoundaries } from '../../../utils/helpers';
let accessToken: string;

const getNextWeekFromGoogle = async (): Promise<any> => {
  try {
    const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();

    const { data } = await axios.get(
      // 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      `${BASE_URL}/primary/events`,
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
    //
    // if (data?.nextPageToken) {
    //   return data.items.concat(await getNextWeekFromGoogle(data.nextPageToken));
    // }

    return data.items;
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
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    try {
      const token = await getToken({ req });
      accessToken = token?.accessToken as string;
      console.log('the accessToken looks like this', accessToken);
      console.log('the token itself looks like this', token);
      const data = await getNextWeekFromGoogle();
      return res.json({ content: data });
    } catch (error) {
      return res.json((error as Error).message);
    }
  }

  res.send({
    error: 'You must be signed in to view the protected content on this page.',
  });
}
