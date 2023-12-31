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
let accessToken: string;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const body = req.body;
  const { calendarId } = req.query;
  if (session) {
    try {
      const token = (await getToken({ req })) as any;
      accessToken = token?.accessToken;
      const data = await addNewEvent(
        body.googleEvent,
        calendarId?.toString() || 'primary'
      );
      return res.json({ content: data });
    } catch (error) {
      return res.json((error as Error).message);
    }
  }

  res.send({
    error: 'You must be signed in to view the protected content on this page.',
  });
}
