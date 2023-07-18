import React from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { GoogleEventPost } from '../utils/types';
import { weekBoundaries } from '../utils/helpers';

const EventForm = () => {
  const eventTitle = useRef<HTMLInputElement>(null);
  const eventDuration = useRef<HTMLInputElement>(null);
  return (
    <form className="event__form">
      <label htmlFor="eventTitle">Task</label>
      <input
        ref={eventTitle}
        type="text"
        id="eventTitle"
        placeholder="Event summary..."
      />
      <label htmlFor="eventDuration">Duraction</label>
      <div>
        <input
          ref={eventDuration}
          type="number"
          id="eventDuration"
          placeholder="Expected duration..."
        />
        <span> Hours</span>
      </div>
      <button
        onClick={async e => {
          e.preventDefault();
          const hoursToMiliseconds = (hours: number) => {
            return hours * 60 * 60 * 1000;
          };
          const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();
          if (eventDuration.current?.value) {
            const durationMiliseconds = hoursToMiliseconds(
              parseInt(eventDuration.current.value)
            );
            const probablyAppropriateStartTime =
              nextWeekStart.getTime() + durationMiliseconds;

            const probablyAppropriateEndTime =
              probablyAppropriateStartTime + durationMiliseconds;
            const body = {
              googleEvent: {
                start: {
                  dateTime: new Date(probablyAppropriateStartTime),
                  // timeZone: 'Europe/Stockholm',
                },
                end: {
                  dateTime: new Date(probablyAppropriateEndTime),
                  // timeZone: 'Europe/Stockholm',
                },
                summary:
                  eventTitle.current?.value ||
                  'You should have provided a title you numbskull',
              },
              calendarId: 'primary',
            };
            // const body: GoogleEventPost = { start, end, summary };
            console.log('this is the body', body);
            const res = await axios.post(`/api/calendar/postEvent`, body);
            console.log('this is the res from the onclick button', res);
          }
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default EventForm;
