import React, { forwardRef } from 'react';
import { useRef } from 'react';

// export type NewEventInfoProps = {
//   titleRef: React.RefObject<HTMLInputElement>;
//   durationRef: React.RefObject<HTMLInputElement>;
// };

export type NewEventInfoProps = {
  titleRef: any;
  durationRef: any;
};
const NewEventInfo = forwardRef((props: NewEventInfoProps) => {
  const { titleRef, durationRef } = props;

  return (
    <>
      <div>
        <label htmlFor="eventTitle">Task</label>
        <input
          ref={titleRef}
          type="text"
          id="eventTitle"
          placeholder="Event summary..."
          required
        />
        <label htmlFor="eventDuration">Duration</label>

        <input
          ref={durationRef}
          type="number"
          id="eventDuration"
          placeholder="Expected duration..."
          required
        />
        <span> Hours</span>
      </div>
    </>
  );
});

export default NewEventInfo;
