import React, { forwardRef } from 'react';
import { StoredValue } from '../../utils/types';
import { useRef } from 'react';

// export type NewEventInfoProps = {
//   titleRef: React.RefObject<HTMLInputElement>;
//   durationRef: React.RefObject<HTMLInputElement>;
// };

export type NewEventInfoProps = {
  titleRef: React.LegacyRef<HTMLInputElement>;
  durationRef: React.LegacyRef<HTMLInputElement>;
  descriptionRef: React.LegacyRef<HTMLInputElement>;
  storedValue: StoredValue;
  uuid: string;
  incrementInputLines: () => void;
};
const LastNewEventInfo = forwardRef((props: NewEventInfoProps) => {
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
      <div>
        <label htmlFor={`eventTitle${uuid}`}>Task</label>
        <input
          ref={titleRef}
          type="text"
          id={`eventTitle${uuid}`}
          placeholder="Event summary..."
          defaultValue={storedValue.title}
          onFocus={e => {
            incrementInputLines();
          }}
        />
        <label htmlFor={`eventDuration${uuid}`}>Duration</label>

        <input
          ref={durationRef}
          type="number"
          id={`eventDuration${uuid}`}
          placeholder="Expected duration..."
          defaultValue={storedValue.duration}
        />
        <span> Hours</span>
        <label htmlFor={`eventDescription${uuid}`}>Description</label>
        <input
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

export default LastNewEventInfo;
