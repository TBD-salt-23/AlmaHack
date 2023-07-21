import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
  hoursToMiliseconds,
  generateAppropriateTime as parseTimeSlotWindowAsUnix,
  shuffle,
} from '../../utils/helpers';
import { CalendarResponse, StoredValue } from '../../utils/types';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AccessDenied from '../access-denied';
import {
  filterOccupiedSlots,
  getOccupiedSlots,
  parseEventsToAdd,
  returnNewEventInfo,
  handleSelect,
} from './helpers/EventFormHelpers';
import styles from './styles/EventForm.module.css';
import { title } from 'process';

//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

type EventFormProps = {
  fetchData: (calendarId: string) => Promise<void>;
  content: CalendarResponse;
  setCalendarToRender: (calendarToRender: string) => void;
  calendarToRender: string;
};
let storedValueArray: StoredValue[] = [];

const EventForm = (props: EventFormProps) => {
  const { fetchData, content, setCalendarToRender, calendarToRender } = props;
  const { eventList, calendarList } = content;
  const [inputsToDisplay, setInputsToDisplay] = useState(1);

  const eventTimeStart = useRef<HTMLInputElement>(null);
  const eventTimeEnd = useRef<HTMLInputElement>(null);
  const eventSelectCalendar = useRef<HTMLSelectElement>(null);
  const titleArr = useRef<HTMLInputElement[]>([]);
  const durationArr = useRef<HTMLInputElement[]>([]);
  const descriptionArr = useRef<HTMLInputElement[]>([]);

  storedValueArray.length = inputsToDisplay;
  useEffect(() => {
    if (inputsToDisplay > 1) {
      titleArr.current[inputsToDisplay - 2].focus();
    }
  }, [inputsToDisplay]);
  // useEffect(() => {
  //   // titleArr.current = titleArr.current.slice(0, inputsToDisplay);
  //   // durationArr.current = durationArr.current.slice(0, inputsToDisplay);
  //   // console.log(
  //   //   'this is what these guys look like',
  //   //   titleArr.current,
  //   //   durationArr.current
  //   // );
  // }, []);

  const { data: session } = useSession();
  if (!session) {
    return <AccessDenied />;
  }
  if (!content.calendarList.length) {
    return <p>Loading....</p>;
  }

  const incrementInputLines = () => {
    for (let i = 0; i < inputsToDisplay; i++) {
      const valuesToStore = {
        title: titleArr.current[i].value,
        duration: durationArr.current[i].value,
        description: descriptionArr.current[i].value || '',
      };
      storedValueArray[i] = valuesToStore;
    }
    setInputsToDisplay(inputsToDisplay + 1);
  };

  const occupiedSlots = getOccupiedSlots(eventList);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const eventsToAdd = parseEventsToAdd(
      inputsToDisplay,
      eventTimeStart,
      eventTimeEnd,
      durationArr,
      titleArr,
      descriptionArr
    );

    eventsToAdd.forEach(
      async ({ startWindow, endWindow, duration, title, description }) => {
        if (!endWindow || !startWindow || !duration || !title) {
          toast.error('Please fill our all the required fields :)');
          return;
        }
        if (startWindow >= endWindow) {
          toast.error('Start time must be earlier than end time');
          return;
        }
        const durationMiliseconds = hoursToMiliseconds(parseInt(duration));
        const windowAsUnix = parseTimeSlotWindowAsUnix(
          startWindow,
          endWindow,
          durationMiliseconds
        );
        const unoccupiedSlots = filterOccupiedSlots(
          occupiedSlots,
          windowAsUnix,
          durationMiliseconds
        );
        if (!unoccupiedSlots.length) {
          toast.warn("Couldn't find time slot for " + title);
          return;
        }
        const [possibleQuarters] = shuffle(unoccupiedSlots);
        const [startTime] = shuffle(possibleQuarters);
        if (!startTime) {
          toast.warn("Couldn't find time for " + title);
          console.log('this is start time', startTime);
          return;
        }
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
            summary: title || 'You should have provided a title you numbskull',
            description,
          },
          calendarId,
        };
        occupiedSlots.push({
          start: body.googleEvent.start.dateTime.getTime(),
          end: body.googleEvent.end.dateTime.getTime(),
        });
        const res = await axios.post(`/api/${calendarId}/postEvent`, body);
        toast.success('Sent ;)');
        console.log('this is the res from the onclick button', res);
        await fetchData(calendarId);
      }
    );
  };

  return (
    <section>
      <form
        className={styles.event__form}
        onSubmit={handleSubmit}
        id="inputForm"
      >
        <label>Time Slot</label>
        <div>
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
            onChange={e => {
              handleSelect(e, setCalendarToRender);
            }}
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
        {returnNewEventInfo(
          titleArr,
          durationArr,
          descriptionArr,
          inputsToDisplay,
          storedValueArray,
          incrementInputLines
        )}
        <button id="inputForm" type="submit">
          Submit
        </button>
      </form>
    </section>
  );
};

export default EventForm;
