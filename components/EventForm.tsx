import React from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { ApiEvent } from '../utils/types';
import {
  hoursToMiliseconds,
  generateAppropriateTime,
  shuffle,
} from '../utils/helpers';
import { CalendarResponse } from '../utils/types';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AccessDenied from './access-denied';
import { filterInappropriateTimes } from './helpers/EventFormHelpers';
import { Slot } from '../utils/types';

//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

type EventFormProps = {
  fetchData: (calendarId: string) => Promise<void>;
  content: CalendarResponse;
  setCalendarToRender: (calendarToRender: string) => void;
  calendarToRender: string;
};

const getOccupiedSlots = (content: ApiEvent[]): Slot[] => {
  return content.map(event => {
    return {
      start: new Date(event.start.dateTime).getTime(),
      end: new Date(event.end.dateTime).getTime(),
    };
  });
};

const EventForm = (props: EventFormProps) => {
  const { fetchData, content, setCalendarToRender, calendarToRender } = props;
  const { eventList, calendarList } = content;
  const eventTitle = useRef<HTMLInputElement>(null);
  const eventDuration = useRef<HTMLInputElement>(null);
  const eventTimeStart = useRef<HTMLInputElement>(null);
  const eventTimeEnd = useRef<HTMLInputElement>(null);
  const eventSelectCalendar = useRef<HTMLSelectElement>(null);

  const { data: session } = useSession();
  if (!session) {
    return <AccessDenied />;
  }

  const occupiedSlots = getOccupiedSlots(eventList);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startWindow = eventTimeStart.current?.value;
    const endWindow = eventTimeEnd.current?.value;
    const duration = eventDuration.current?.value;
    const title = eventTitle.current?.value;
    if (!endWindow || !startWindow || !duration || !title) {
      toast.error('Please fill our all the required fields :)');
      return;
    }
    if (startWindow >= endWindow) {
      toast.error('Start time must be earlier than end time');
      return;
    }
    const durationMiliseconds = hoursToMiliseconds(parseInt(duration));
    const possibleTimes = generateAppropriateTime(
      startWindow,
      endWindow,
      durationMiliseconds
    );
    const unoccupiedSlots = filterInappropriateTimes(
      occupiedSlots,
      possibleTimes,
      durationMiliseconds
    );
    console.log(
      'these times are considered unoccupied',
      unoccupiedSlots.map(slot => {
        return slot.map(quarter => {
          return (
            new Date(quarter).getHours().toString() +
            new Date(quarter).getMinutes().toString()
          );
        });
      })
    );
    if (!unoccupiedSlots.length) return;
    const [possibleQuarters] = shuffle(unoccupiedSlots);
    const [startTime] = shuffle(possibleQuarters);
    const endTime = startTime + durationMiliseconds;
    const calendarId = eventSelectCalendar.current?.value || 'primary';

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
      calendarId,
    };

    const res = await axios.post(`/api/${calendarId}/postEvent`, body);
    toast.success('Sent ;)');
    console.log('this is the res from the onclick button', res);
    await fetchData(calendarId);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) return;
    toast('Switching calendar!');
    setCalendarToRender(e.target.value);
  };

  return (
    <form className="event__form" onSubmit={handleSubmit}>
      <label htmlFor="eventTitle">Task</label>
      <input
        ref={eventTitle}
        type="text"
        id="eventTitle"
        placeholder="Event summary..."
        required
      />
      <label htmlFor="eventDuration">Duration</label>
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
          ref={eventTimeStart}
          min={'00:00'}
          max={'23:59'}
          step={900}
          required
        ></input>
        <span> - </span>
        <input
          type="time"
          ref={eventTimeEnd}
          min={'00:00'}
          max={'23:59'}
          step={900}
          required
        ></input>
      </div>
      <label htmlFor="calendarSelect">Calendar</label>
      <div>
        <select
          name=""
          id="calendarSelect"
          ref={eventSelectCalendar}
          value={calendarToRender}
          onChange={handleSelect}
        >
          {calendarList.map(calendar => {
            return (
              <option key={uuid()} value={calendar.id}>
                {calendar.summary}
              </option>
            );
          })}
        </select>
      </div>
      <button>Submit</button>
    </form>
  );
};

export default EventForm;
