import { useSession } from 'next-auth/react';
import { ApiEvent } from '../../utils/types';
import { v4 as uuid } from 'uuid';
import styles from './styles/Calendar.module.css';
import LandingPage from '../LandingPage';
import { toast } from 'react-toastify';
import { getEventType, handleDelete } from './helpers/calendarHelpers';

type CalendarProps = {
  events: ApiEvent[];
  calendarToRender: string;
  fetchCalendarData: (calendarId?: string) => Promise<void>;
};

export default function Calendar(props: CalendarProps) {
  const { events, calendarToRender, fetchCalendarData } = props;
  console.log('this is events', events);
  const { data: session } = useSession();

  const renderEvents = (event: ApiEvent, calendarId: string) => {
    const toAndFrom = getEventType(event);
    return (
      <li key={uuid()} className={styles['event__list-item']}>
        <h3 className={styles.event__list__heading}>{event.summary}</h3>
        <p className={styles.event__description}>{event.description}</p>
        {toAndFrom}
        <button
          className={styles.upcoming__events__deleteBtn}
          onClick={async () => {
            toast(`Deleting ${event.summary}`);
            await handleDelete(calendarId, event.id);
            await fetchCalendarData(calendarId);
          }}
        >
          X
        </button>
      </li>
    );
  };

  if (!session) {
    return <LandingPage />;
  }

  if (!events.length) {
    return (
      <>
        <h1 className={styles.upcoming__events__heading}>Events next week</h1>
        <p className={styles.upcoming__events__empty}>No upcoming events</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.upcoming__events__heading}>Events next week</h1>
      <ul className={styles.upcoming__events__list}>
        {events.map(event => renderEvents(event, calendarToRender)) ||
          'Issues loading events, try reloading the page :)'}
      </ul>
    </>
  );
}
