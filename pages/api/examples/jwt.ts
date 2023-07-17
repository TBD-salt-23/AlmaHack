// This is an example of how to read a JSON Web Token from an API route
import { getToken } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';
import axios from 'axios';

import type { NextApiRequest, NextApiResponse } from 'next';

let accessToken: any;

const getYTData = async (pageToken = ''): Promise<any> => {
  try {
    console.log(
      'this is the access token when getYTdata is called',
      accessToken
    );
    const { data } = await axios.get(
      // 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // const { data } = await axios.get(
    //   `https://youtube.googleapis.com/youtube/v3/subscriptions?mine=true&pageToken=${pageToken}&maxResults=50&part=snippet`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   }
    // );

    if (data?.nextPageToken) {
      return data.items.concat(await getYTData(data.nextPageToken));
    }

    return data.items;
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
    const data = await getYTData();

    console.log('this is the data', data);
    // console.log('hopefully this is token', token?.jti);
    // const data = await getYTData();
    res.json(data);
  } catch (error) {
    res.json((error as Error).message);
  }
}
