import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { ApiEvent } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { parseTimeNicely } from '../utils/helpers';

type CalendarProps = {
  content: ApiEvent[];
};

const renderEvents = (event: ApiEvent) => {
  {
    /* The guy below used to be ?? */
  }

  return (
    <li key={uuid()} className="event__list-item">
      <h3 className="event__list__heading">{event.summary}</h3>
      <p>
        {parseTimeNicely(event.start.dateTime)} -{' '}
        {parseTimeNicely(event.end.dateTime)}
      </p>
    </li>
  );
};

export default function Calendar(props: CalendarProps) {
  const { content } = props;
  console.log('this is content', content);
  const { data: session } = useSession();

  if (!session) {
    return <AccessDenied />;
  }

  return (
    <>
      <h1>Events next week</h1>
      <ul>
        {content.map(renderEvents) ||
          'Issues loading events, try signing out and then back in :)'}
      </ul>
    </>
  );
}
