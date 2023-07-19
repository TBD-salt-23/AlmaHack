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

//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

const filterInappropriateTimes = (
  occupiedSlots: Slot[],
  possibleTimes: number[],
  durationMiliseconds: number
) => {
  let unoccupiedSlots: number[][] = [];
  const confirmedOccupiedSlots = [];
  const aQuarterMiliseconds = 1 * 15 * 60 * 1000;
  const quartersInDuration = durationMiliseconds / aQuarterMiliseconds;
  let freeQuarters = [];

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
        // console.log(
        //   'This slot is occupied',
        //   new Date(currentOccValue.start).getHours(),
        //   new Date(currentOccValue.start).getMinutes()
        // );
        if (freeQuarters.length >= quartersInDuration) {
          const possibleTimeSlot = freeQuarters.slice(
            0,
            quartersInDuration * -1
          );
          console.log(
            'this is after the slice',
            possibleTimeSlot.map((quarter) => {
              return (
                new Date(quarter).getHours().toString() +
                new Date(quarter).getMinutes().toString()
              );
            })
          );
          unoccupiedSlots.push(possibleTimeSlot);
        }
        freeQuarters = [];
        break;
      }
    }
    if (slotIsOccupied) {
      confirmedOccupiedSlots.push(currentPosValue);
      continue;
    }

    //this is success
    freeQuarters.push(currentPosValue);
    // console.log(
    //   'free quarters looks like this on what I consider a success',
    //   freeQuarters
    //     .map(slot => {
    //       return (
    //         new Date(slot).getHours().toString() +
    //         new Date(slot).getMinutes().toString()
    //       );
    //     })
    //     .join('\n')
    // );

    if (timeSlotIterator === possibleTimes.length - 1) {
      console.log(
        'on the final loop, free quarters looks like',
        freeQuarters.map((quarter) => {
          return (
            new Date(quarter).getHours().toString() +
            new Date(quarter).getMinutes().toString()
          );
        })
      );
      if (freeQuarters.length) {
        unoccupiedSlots.push(freeQuarters);
        console.log(
          `free quarters (${freeQuarters.length}) is now equivalent to the length of the duration in quarters (${quartersInDuration}), adding to unoccupied slots`,
          unoccupiedSlots.map((slot) => {
            return slot.map((quarter) => {
              return (
                new Date(quarter).getHours().toString() +
                new Date(quarter).getMinutes().toString()
              );
            });
          })
        );
      }
    }
    // if (freeQuarters.length === quartersInDuration) { THIS CODE WORKS BUT RANDOMNESS SUFFERS
    //   unoccupiedSlots = [...unoccupiedSlots, freeQuarters];
    //   console.log(
    //     `free quarters (${freeQuarters.length}) is now equivalent to the length of the duration in quarters (${quartersInDuration}), adding to unoccupied slots`,
    //     unoccupiedSlots.map(slot => {
    //       return slot.map(quarter => {
    //         return (
    //           new Date(quarter).getHours().toString() +
    //           new Date(quarter).getMinutes().toString()
    //         );
    //       });
    //     })
    //   );
    //   freeQuarters = [];
    // }
  }
  return unoccupiedSlots;
};

type EventFormProps = {
  fetchData: (calendarId: string) => Promise<void>;
  content: CalendarResponse;
};

type Slot = {
  start: number;
  end: number;
};

const getOccupiedSlots = (content: ApiEvent[]): Slot[] => {
  return content.map((event) => {
    return {
      start: new Date(event.start.dateTime).getTime(),
      end: new Date(event.end.dateTime).getTime(),
    };
  });
};

const EventForm = (props: EventFormProps) => {
  const { fetchData, content } = props;
  const { eventList, calendarList } = content;
  const eventTitle = useRef<HTMLInputElement>(null);
  const eventDuration = useRef<HTMLInputElement>(null);
  const eventTimeStart = useRef<HTMLInputElement>(null);
  const eventTimeEnd = useRef<HTMLInputElement>(null);
  const eventSelectCalendar = useRef<HTMLSelectElement>(null);

  const occupiedSlots = getOccupiedSlots(eventList);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startWindow = eventTimeStart.current?.value;
    const endWindow = eventTimeEnd.current?.value;
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
      possibleTimes,
      durationMiliseconds
    );
    console.log(
      'these times are considered unoccupied',
      unoccupiedSlots.map((slot) => {
        return slot.map((quarter) => {
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

    // const [[startTime]] = shuffle(shuffle(unoccupiedSlots));
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
    console.log('this is the res from the onclick button', res);
    await fetchData(calendarId);
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
        <select name="" id="calendarSelect" ref={eventSelectCalendar}>
          {calendarList.map((calendar) => {
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
