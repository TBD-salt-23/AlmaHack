import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { ApiEvent } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { parseTimeNicely, parseAllDayEvents } from '../utils/helpers';
import { ONE_DAY } from '../utils/consts';
import styles from './styles/Calendar.module.css';
import LandingPage from './LandingPage';

type CalendarProps = {
  content: ApiEvent[];
};

const renderEvents = (event: ApiEvent) => {
  {
    /* The guy below used to be ??, as in null coalescing */
  }

  if (event.start.dateTime) {
    return (
      <li key={uuid()} className={styles['event__list-item']}>
        <h3 className={styles.event__list__heading}>{event.summary}</h3>
        <p className={styles.event__description}>{event.description}</p>

        <p className={styles.event__from}>
          {parseTimeNicely(event.start.dateTime)}
        </p>
        <span className={styles.spanSpacer}>to</span>
        <p className={styles.event__to}>
          {parseTimeNicely(event.end.dateTime)}
        </p>
      </li>
    );
  }

  const convertedDateStart = new Date(event.start.date).getTime();
  const convertedDateEnd = new Date(event.end.date).getTime();

  if (convertedDateStart && convertedDateEnd - ONE_DAY === convertedDateStart) {
    return (
      <li key={uuid()} className={styles['event__list-item']}>
        <h3 className={styles.event__list__heading}>{event.summary}</h3>
        <p className={styles.event__description}>{event.description}</p>

        <p className={styles.event__allDay}>
          {parseAllDayEvents(new Date(event.start.date).toString())}
        </p>
      </li>
    );
  }

  return (
    <li key={uuid()} className={styles['event__list-item']}>
      <h3 className={styles.event__list__heading}>{event.summary}</h3>
      <p className={styles.event__description}>{event.description}</p>

      <p className={styles.event__from}>
        {parseAllDayEvents(new Date(convertedDateStart).toString())}
      </p>
      <span className={styles.spanSpacer}>to</span>
      <p className={styles.event__to}>
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
    // return <AccessDenied />;
    return <LandingPage />;
  }

  if (!content.length) {
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
        {content.map(renderEvents) ||
          'Issues loading events, try signing out and then back in :)'}
      </ul>
    </>
  );
}
