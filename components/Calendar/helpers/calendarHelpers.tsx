import axios from 'axios';
import { ApiEvent } from '../../../utils/types';
import { parseTimeNicely, parseAllDayEvents } from '../../../utils/helpers';
import { ONE_DAY } from '../../../utils/consts';
import { v4 as uuid } from 'uuid';
import styles from '../styles/Calendar.module.css';

export const handleDelete = async (calendarId: string, eventId: string) => {
  try {
    const res = await axios.post(`/api/${calendarId}/${eventId}/deleteEvent`);
  } catch (error) {
    console.log(
      'Uh oh here is an error from handle delete',
      (error as Error).message
    );
  }
};

export const getEventType = (event: ApiEvent) => {
  if (event.start.dateTime) {
    return (
      <>
        <p className={styles.event__from}>
          {parseTimeNicely(event.start.dateTime)}
        </p>
        <span className={styles.spanSpacer}>to</span>
        <p className={styles.event__to}>
          {parseTimeNicely(event.end.dateTime)}
        </p>
      </>
    );
  }
  const convertedDateStart = new Date(event.start.date).getTime();
  const convertedDateEnd = new Date(event.end.date).getTime();
  if (convertedDateStart && convertedDateEnd - ONE_DAY === convertedDateStart) {
    return (
      <>
        <p className={styles.event__allDay}>
          {parseAllDayEvents(new Date(event.start.date).toString())}
        </p>
      </>
    );
  }
  return (
    <>
      <li key={uuid()} className={styles['event__list-item']}>
        <h3 className={styles.event__list__heading}>{event.summary}</h3>
        <p className={styles.event__description}>{event.description}</p>

        <p className={styles.event__allDay}>
          {parseAllDayEvents(new Date(event.start.date).toString())}
        </p>
        <span className={styles.spanSpacer}>to</span>
        <p className={styles.event__to}>
          {parseAllDayEvents(new Date(convertedDateEnd - ONE_DAY).toString())}{' '}
        </p>
      </li>
    </>
  );
};
