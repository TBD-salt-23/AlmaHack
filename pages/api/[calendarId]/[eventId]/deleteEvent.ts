import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { BASE_URL } from '../../../../utils/consts';
import { authOptions } from '../../auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';

let accessToken: string;

const deleteEvent = async (calendarId: string, eventId: string) => {
  const res = await axios.delete(
    `${BASE_URL}/${calendarId}/events/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log('this is the res from delete', res);
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { calendarId, eventId } = req.query;
  console.log('this is calendarId and eventId', calendarId, eventId);
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    try {
      const token = (await getToken({ req })) as any;
      accessToken = token?.accessToken;
      const data = await deleteEvent(
        calendarId?.toString() || 'primary',
        eventId?.toString() || 'nothing'
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
