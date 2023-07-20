import React, { forwardRef } from 'react';
import { useRef } from 'react';

// export type NewEventInfoProps = {
//   titleRef: React.RefObject<HTMLInputElement>;
//   durationRef: React.RefObject<HTMLInputElement>;
// };

export type NewEventInfoProps = {
  titleRef: React.LegacyRef<HTMLInputElement>;
  durationRef: React.LegacyRef<HTMLInputElement>;
  descriptionRef: React.LegacyRef<HTMLInputElement>;
  uuid: string;
};
const NewEventInfo = forwardRef((props: NewEventInfoProps) => {
  const { titleRef, durationRef, descriptionRef, uuid } = props;

  return (
    <>
      <div>
        <label htmlFor={`eventTitle${uuid}`}>Task</label>
        <input
          ref={titleRef}
          type="text"
          id={`eventTitle${uuid}`}
          placeholder="Event summary..."
          required
        />
        <label htmlFor={`eventDuration${uuid}`}>Duration</label>

        <input
          ref={durationRef}
          type="number"
          id={`eventDuration${uuid}`}
          placeholder="Expected duration..."
          required
        />
        <span> Hours</span>
        <label htmlFor={`eventDescription${uuid}`}>Description</label>
        <input
          ref={descriptionRef}
          type="text"
          id={`eventDescription${uuid}`}
          placeholder="Notes..."
        />
      </div>
    </>
  );
});

export default NewEventInfo;
