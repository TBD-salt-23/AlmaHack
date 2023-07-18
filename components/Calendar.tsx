import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { ApiEvent } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { parseTimeNicely } from '../utils/helpers';

export default function Calendar() {
  const { data: session } = useSession();
  const [content, setContent] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/calendar/events');
      const json = await res.json();
      if (json.content) {
        if ('error' in json.content) {
          console.log('there was an error', json.content.error);
          return;
        }

        setContent(
          json.content.map((event: ApiEvent) => {
            return (
              <li key={uuid()} className="event__list-item">
                <h3 className="event__list__heading">{event.summary}</h3>
                <p>
                  {parseTimeNicely(event.start.dateTime)} -{' '}
                  {parseTimeNicely(event.end.dateTime)}
                </p>
              </li>
            );
          })
        );
      }
    };
    fetchData();
  }, [session]);

  if (!session) {
    return <AccessDenied />;
  }

  return (
    <>
      <h1>Events next week</h1>
      <ul>
        {/* The guy below used to be ?? */}
        {content ||
          'Issues loading events, try signing out and then back in :)'}
      </ul>
    </>
  );
}
