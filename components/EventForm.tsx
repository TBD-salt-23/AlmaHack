import React from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { GoogleEventPost } from '../utils/types';
import {
  weekBoundaries,
  hoursToMiliseconds,
  generateAppropriateTime,
  shuffle,
} from '../utils/helpers';

//TODO: REFRESH PAGE AFTER SUBMIT (not really refresh but do some statery)
//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

const EventForm = () => {
  const eventTitle = useRef<HTMLInputElement>(null);
  const eventDuration = useRef<HTMLInputElement>(null);
  const eventSelectStart = useRef<HTMLInputElement>(null);
  const eventSelectEnd = useRef<HTMLInputElement>(null);

  return (
    <form
      className="event__form"
      onSubmit={async e => {
        e.preventDefault();
        const startWindow = eventSelectStart.current?.value;
        const endWindow = eventSelectEnd.current?.value;
        const duration = eventDuration.current?.value;
        const title = eventTitle.current?.value;
        if (!endWindow || !startWindow || !duration || !title) {
          console.log('You didnt give me a value');
          return;
        }
        if (startWindow >= endWindow) {
          console.log('The start guy is bigger than the end guy');
          return;
        }

        const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();
        const durationMiliseconds = hoursToMiliseconds(parseInt(duration));
        const [startTime] = shuffle(
          generateAppropriateTime(startWindow, endWindow, duration)
        );
        console.log(
          'this is the generated random start time',
          new Date(startTime)
        );
        const endTime = startTime + durationMiliseconds;
        console.log(
          'and with that in mind this should be the end time',
          new Date(endTime)
        );
        const body = {
          googleEvent: {
            start: {
              dateTime: new Date(startTime),
              // timeZone: 'Europe/Stockholm',
            },
            end: {
              dateTime: new Date(endTime),
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
      }}
    >
      <label htmlFor="eventTitle">Task</label>
      <input
        ref={eventTitle}
        type="text"
        id="eventTitle"
        placeholder="Event summary..."
        required
      />
      <label htmlFor="eventDuration">Duraction</label>
      <div>
        <input
          ref={eventDuration}
          type="number"
          id="eventDuration"
          placeholder="Expected duration..."
          required
        />
        <span> Hours</span>
      </div>
      <label>Time Slot</label>
      <div>
        {/* TODO: Add unset to these guys */}
        <input
          type="time"
          ref={eventSelectStart}
          min={'00:00'}
          max={'23:59'}
          step={900}
          required
        ></input>
        <span> - </span>
        <input
          type="time"
          ref={eventSelectEnd}
          min={'00:00'}
          max={'23:59'}
          step={900}
          required
        ></input>
      </div>
      <button>Submit</button>
    </form>
  );
};

export default EventForm;
