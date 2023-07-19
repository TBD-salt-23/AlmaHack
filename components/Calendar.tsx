import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { ApiEvent } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { parseTimeNicely, parseAllDayEvents } from '../utils/helpers';

type CalendarProps = {
  content: ApiEvent[];
};

const renderEvents = (event: ApiEvent) => {
  {
    /* The guy below used to be ?? */
  }

  if (event.start.dateTime) {
    return (
      <li key={uuid()} className="event__list-item">
        <h3 className="event__list__heading">{event.summary}</h3>
        <p>
          {parseTimeNicely(event.start.dateTime)} -{' '}
          {parseTimeNicely(event.end.dateTime)}
        </p>
      </li>
    );
  }

  const startDate = event.start.date;
  const endDate = event.end.date;

  if (startDate)
    console.log('date', parseAllDayEvents(new Date(startDate).toString()));

  const convertedDateStart = new Date(startDate).getTime();
  const convertedDateEnd = new Date(endDate).getTime();
  if (
    event.start.date &&
    convertedDateEnd - 24 * 60 * 60 * 1000 === convertedDateStart
  ) {
    return (
      <li key={uuid()} className="event__list-item">
        <h3 className="event__list__heading">{event.summary}</h3>
        <p>{parseAllDayEvents(new Date(event.start.date).toString())}</p>
      </li>
    );
  }

  return (
    <li key={uuid()} className="event__list-item">
      <h3 className="event__list__heading">{event.summary}</h3>
      <p>
        {event.start.date} - {event.end.date}
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
