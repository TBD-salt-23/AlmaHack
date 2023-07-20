import React, { useEffect } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { ApiEvent } from '../../utils/types';
import {
  hoursToMiliseconds,
  generateAppropriateTime as parseTimeSlotWindowAsUnix,
  shuffle,
} from '../../utils/helpers';
import { CalendarResponse } from '../../utils/types';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AccessDenied from '../access-denied';
import { filterInappropriateTimes as filterOccupiedSlots } from './helpers/EventFormHelpers';
import { Slot } from '../../utils/types';
import NewEventInfo from './NewEventInfo';
import styles from './styles/EventForm.module.css';
import { useState } from 'react';

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
  const [inputsToDisplay, setInputsToDisplay] = useState(1);

  const eventTimeStart = useRef<HTMLInputElement>(null);
  const eventTimeEnd = useRef<HTMLInputElement>(null);
  const eventSelectCalendar = useRef<HTMLSelectElement>(null);
  const titleArr = useRef<HTMLInputElement[]>([]);
  const durationArr = useRef<HTMLInputElement[]>([]);

  const returnNewEventInfo = (titleArr: any, durationArr: any) => {
    const arrayToReturn = [];
    console.log('this is the titleArr', titleArr.current);
    for (let i = 0; i < inputsToDisplay; i++) {
      console.log('we are inside the loop having fun', i);
      arrayToReturn.push(
        <NewEventInfo
          titleRef={(el: HTMLInputElement) => (titleArr.current[i] = el)}
          durationRef={(el: HTMLInputElement) => (durationArr.current[i] = el)}
          key={uuid()}
        />
      );
    }
    console.log(
      'before returning, arraytoreturn looks like this',
      arrayToReturn
    );
    return arrayToReturn;
  };

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
    return 'Loading...';
  }

  const occupiedSlots = getOccupiedSlots(eventList);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    type EventInput = {
      startWindow: string;
      endWindow: string;
      duration: string;
      title: string;
    };
    const configArr: EventInput[] = [];

    for (let i = 0; i < inputsToDisplay; i++) {
      const startWindow = eventTimeStart.current?.value || ''; //TODO: CONSIDER THIS
      const endWindow = eventTimeEnd.current?.value || '';
      const duration = durationArr.current[i].value;
      const title = titleArr.current[i].value;
      configArr.push({ startWindow, endWindow, duration, title });
    }

    // const configArr = inputsArray.map((_, i) => {
    //   const startWindow = eventTimeStart.current?.value;
    //   const endWindow = eventTimeEnd.current?.value;
    //   const duration = durationArr.current[i].value;
    //   const title = titleArr.current[i].value;
    //   return { startWindow, endWindow, duration, title };
    // });

    configArr.forEach(async ({ startWindow, endWindow, duration, title }) => {
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
    });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) return;
    toast.info('Switching calendar!');
    setCalendarToRender(e.target.value);
  };

  return (
    <section>
      <label className={styles.switch}>
        <input
          type="checkbox"
          onChange={e => {
            if (!e.target.checked) {
              setInputsToDisplay(1);
              console.log('setting inputs to 1');
            } else {
              setInputsToDisplay(3);
              console.log('setting inputs to 3');
            }
          }}
        />
        <span className={[styles.slider, styles.round].join(' ')}></span>
      </label>
      <form className={styles.event__form} onSubmit={handleSubmit}>
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
        {returnNewEventInfo(titleArr, durationArr)}
        <button>Submit</button>
      </form>
    </section>
  );
};

export default EventForm;
