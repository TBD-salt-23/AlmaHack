import { GoogleEventPost } from '../../../utils/types';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { BASE_URL } from '../../../utils/consts';
import { authOptions } from '../auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';

const addNewEvent = async (
  googleEvent: GoogleEventPost,
  calendarId: string
) => {
  console.log('this is the google event', googleEvent);
  console.log('this is the calendar id', calendarId);
  const res = await axios.post(
    `${BASE_URL}/${calendarId}/events`,
    googleEvent,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log('this is the res from the addNewEvent function', res);
};
let accessToken: string;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const body = req.body;

  if (session) {
    try {
      const token = (await getToken({ req })) as any;
      accessToken = token?.accessToken;
      const data = await addNewEvent(body.googleEvent, 'primary');
      console.log('this is the data from the post guy', data);
      return res.json({ content: data });
    } catch (error) {
      console.log('there is an error failing in post event handler');
      return res.json((error as Error).message);
    }
  }

  res.send({
    error: 'You must be signed in to view the protected content on this page.',
  });
}
