import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { ApiEvent } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { parseTimeNicely, parseAllDayEvents } from '../utils/helpers';
import { ONE_DAY } from '../utils/consts';

type CalendarProps = {
  content: ApiEvent[];
};

const renderEvents = (event: ApiEvent) => {
  {
    /* The guy below used to be ??, as in null coalescing */
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

  const convertedDateStart = new Date(event.start.date).getTime();
  const convertedDateEnd = new Date(event.end.date).getTime();

  if (convertedDateStart && convertedDateEnd - ONE_DAY === convertedDateStart) {
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
        {parseAllDayEvents(new Date(convertedDateStart).toString())} -{' '}
        {parseAllDayEvents(new Date(convertedDateEnd - ONE_DAY).toString())}{' '}
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
