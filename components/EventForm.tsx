import React from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { ApiEvent } from '../utils/types';
import {
  hoursToMiliseconds,
  generateAppropriateTime,
  shuffle,
} from '../utils/helpers';

//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

const filterInappropriateTimes = (
  occupiedSlots: Slot[],
  possibleTimes: number[]
) => {
  const unoccupiedSlots = [];
  const confirmedOccupiedSlots = [];

  for (
    let timeSlotIterator = 0;
    timeSlotIterator < possibleTimes.length;
    timeSlotIterator++
  ) {
    const currentPosValue = possibleTimes[timeSlotIterator];
    let slotIsOccupied = false;

    for (
      let occupiedSlotIterator = 0;
      occupiedSlotIterator < occupiedSlots.length;
      occupiedSlotIterator++
    ) {
      const currentOccValue = occupiedSlots[occupiedSlotIterator];
      if (
        currentPosValue >= currentOccValue.start &&
        currentPosValue <= currentOccValue.end
      ) {
        slotIsOccupied = true;
        console.log(
          'This slot is occupied',
          new Date(currentOccValue.start).getHours(),
          new Date(currentOccValue.start).getMinutes()
        );
        break;
      }
    }
    if (slotIsOccupied) {
      confirmedOccupiedSlots.push(currentPosValue);
      continue;
    }
    unoccupiedSlots.push(currentPosValue);
  }
  return unoccupiedSlots;
};

type EventFormProps = {
  fetchData: () => Promise<void>;
  content: ApiEvent[];
};

type Slot = {
  start: number;
  end: number;
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
  const { fetchData, content } = props;
  const eventTitle = useRef<HTMLInputElement>(null);
  const eventDuration = useRef<HTMLInputElement>(null);
  const eventSelectStart = useRef<HTMLInputElement>(null);
  const eventSelectEnd = useRef<HTMLInputElement>(null);

  const occupiedSlots = getOccupiedSlots(content);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const durationMiliseconds = hoursToMiliseconds(parseInt(duration));
    const possibleTimes = generateAppropriateTime(
      startWindow,
      endWindow,
      durationMiliseconds
    );
    const unoccupiedSlots = filterInappropriateTimes(
      occupiedSlots,
      possibleTimes
    );
    console.log(
      'these times are considered unoccupied',
      unoccupiedSlots
        .map(slot => {
          return (
            new Date(slot).getHours().toString() +
            new Date(slot).getMinutes().toString()
          );
        })
        .join('\n')
    );
    const [startTime] = shuffle(unoccupiedSlots);
    const endTime = startTime + durationMiliseconds;

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
    const res = await axios.post(`/api/calendar/postEvent`, body);
    console.log('this is the res from the onclick button', res);
    await fetchData();
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
