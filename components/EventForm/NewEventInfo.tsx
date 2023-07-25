import React, { forwardRef } from 'react';
import { StoredValue } from '../../utils/types';
import styles from './styles/NewEventInfo.module.css';

export type NewEventInfoProps = {
  titleRef: React.LegacyRef<HTMLInputElement>;
  durationRef: React.LegacyRef<HTMLInputElement>;
  descriptionRef: React.LegacyRef<HTMLInputElement>;
  storedValue: StoredValue;
  uuid: string;
  incrementInputLines?: () => void;
};
const NewEventInfo = forwardRef((props: NewEventInfoProps) => {
  const {
    titleRef,
    durationRef,
    descriptionRef,
    storedValue,
    uuid,
    incrementInputLines,
  } = props;

  return (
    <>
      <div className={styles['event__form__input-container']}>
        <label htmlFor={`eventTitle${uuid}`} className={styles.taskTitle}>
          Task
        </label>
        <input
          className={styles.taskContent}
          ref={titleRef}
          type="text"
          id={`eventTitle${uuid}`}
          placeholder="Event summary..."
          defaultValue={storedValue.title}
          onFocus={() => {
            if (incrementInputLines) {
              incrementInputLines();
            }
          }}
        />

        <label
          htmlFor={`eventDuration${uuid}`}
          className={styles.durationTitle}
        >
          Duration
        </label>
        <input
          className={styles.durationContent}
          ref={durationRef}
          type="number"
          id={`eventDuration${uuid}`}
          placeholder="Hours..."
          defaultValue={storedValue.duration}
        />

        <label
          htmlFor={`eventDescription${uuid}`}
          className={styles.descriptionT}
        >
          Description
        </label>
        <input
          className={styles.descriptionC}
          ref={descriptionRef}
          type="text"
          id={`eventDescription${uuid}`}
          placeholder="Notes..."
          defaultValue={storedValue.description}
        />
      </div>
    </>
  );
});

export default NewEventInfo;
