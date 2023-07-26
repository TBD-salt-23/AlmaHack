import React, { useRef, useState, useEffect } from 'react';
import { hoursToMiliseconds, shuffle } from '../../utils/helpers';
import {
  CalendarResponse,
  StoredValue,
  WeekdayAndBoolean,
  EventsToAdd,
} from '../../utils/types';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import {
  getOccupiedSlots,
  parseEventsToAdd,
  returnNewEventInfo,
  handleSelect,
  addEventsToGoogleCal,
  parseTimeSlotWindowAsUnix,
  createTimeSlots,
  displayWeekdaysInProperOrder,
  removeOccupiedSlots,
  getAppropriateSlots,
} from './helpers/EventFormHelpers';
import styles from './styles/EventForm.module.css';

//TODO: IMPLEMENT TOASTIFY FOR ERROR HANDLING

type EventFormProps = {
  fetchCalendarData: (calendarId: string) => Promise<void>;
  content: CalendarResponse;
  setCalendarToRender: (calendarToRender: string) => void;
  calendarToRender: string;
};
let storedValueArray: StoredValue[] = [];

const weekdaysAvailable: WeekdayAndBoolean[] = [
  { name: 'S', checked: false },
  { name: 'M', checked: true },
  { name: 'T', checked: true },
  { name: 'W', checked: true },
  { name: 'T', checked: true },
  { name: 'F', checked: true },
  { name: 'S', checked: false },
];

const EventForm = (props: EventFormProps) => {
  const { fetchCalendarData, content, setCalendarToRender, calendarToRender } =
    props;
  const { eventList, calendarList } = content;
  const { data: session } = useSession();
  const [inputsToDisplay, setInputsToDisplay] = useState(1);
  storedValueArray.length = inputsToDisplay;

  const eventTimeStart = useRef<HTMLInputElement>(null);
  const eventTimeEnd = useRef<HTMLInputElement>(null);
  const eventSelectCalendar = useRef<HTMLSelectElement>(null);
  const titleArr = useRef<HTMLInputElement[]>([]);
  const durationArr = useRef<HTMLInputElement[]>([]);
  const descriptionArr = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (inputsToDisplay > 1) {
      titleArr.current[inputsToDisplay - 1].focus();
    }
  }, [inputsToDisplay]);

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

  if (!session) {
    return <>{''}</>;
  }
  if (!content.calendarList.length) {
    return <p>Loading....</p>;
  }

  const addEvents = async (calendarId: string, eventsToAdd: EventsToAdd[]) => {
    try {
      const occupiedSlots = getOccupiedSlots(eventList); // THIS GUY WAS OUTSIDE THIS FUNCTION BEFORE NOT SURE IF IT MAKES SENSE TO MOVE HIM IN
      console.log(
        'occupied at the start',
        occupiedSlots.map(
          timeslot =>
            `${new Date(timeslot.start).getHours()}:${new Date(
              timeslot.start
            ).getMinutes()} the ${new Date(
              timeslot.start
            ).getDate()} to ${new Date(timeslot.end).getHours()}:${new Date(
              timeslot.end
            ).getMinutes()} the ${new Date(timeslot.end).getDate()}`
        )
      );
      for (let i = 0; i < eventsToAdd.length; i++) {
        const { startWindow, endWindow, duration, title, description } =
          eventsToAdd[i];
        if (!endWindow || !startWindow || !duration || !title) {
          throw new Error('Please fill our all the required fields :)');
        }
        if (startWindow >= endWindow) {
          throw new Error('Start time must be earlier than end time');
        }
        const durationMiliseconds = hoursToMiliseconds(parseInt(duration));
        const timeframeByDay = parseTimeSlotWindowAsUnix(
          startWindow,
          endWindow,
          durationMiliseconds,
          weekdaysAvailable
        );
        const unoccupiedSlots = removeOccupiedSlots(
          occupiedSlots,
          timeframeByDay
        );
        const appropriateSlots = getAppropriateSlots(
          unoccupiedSlots,
          durationMiliseconds
        );
        console.log(
          'This is the appropriate slots',
          appropriateSlots.map(slotArray =>
            slotArray.map(
              timeslot =>
                `${new Date(timeslot).getHours()}:${new Date(
                  timeslot
                ).getMinutes()} the ${new Date(timeslot).getDate()}`
            )
          )
        );

        /* const unoccupiedSlots = filterOccupiedSlots(
          occupiedSlots,
          timeframeByDay,
          durationMiliseconds
        );
        console.log(
          'these timeslots are considered unoccupied',
          unoccupiedSlots.map(slotArray =>
            slotArray.map(
              timeslot =>
                `${new Date(timeslot).getHours()}:${new Date(
                  timeslot
                ).getMinutes()} the ${new Date(timeslot).getDate()}`
            )
          )
        );
        console.log(
          'these are considered occupied',
          occupiedSlots.map(
            timeslot =>
              `${new Date(timeslot.start).getHours()}:${new Date(
                timeslot.start
              ).getMinutes()} the ${new Date(
                timeslot.start
              ).getDate()} to ${new Date(timeslot.end).getHours()}:${new Date(
                timeslot.end
              ).getMinutes()} the ${new Date(timeslot.end).getDate()}`
          )
        ) */ if (!appropriateSlots.length) {
          //throw new Error(`Couldn't find time slot for ${title}`);
          toast.error(`Couldn't find time slot for ${title}`);
          return;
        }

        const [possibleQuarters] = shuffle(appropriateSlots) as number[][];
        const [startTime] = shuffle(possibleQuarters) as number[];
        if (!startTime) {
          console.log(`The start time for ${title} is ${startTime}`);
          //throw new Error(`Couldn't find time for ${title}`);
          toast.error(`Couldn't find start time for ${title}`);
          return;
        }
        const endTime = startTime + durationMiliseconds;

        await addEventsToGoogleCal(
          startTime,
          endTime,
          title,
          calendarId,
          description
        );

        occupiedSlots.push({
          start: startTime,
          end: endTime,
        });
        toast.success(`Adding ${title} to your Google Calendar`);
      }
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const calendarId = eventSelectCalendar.current?.value || 'primary';
    try {
      e.preventDefault();
      const eventsToAdd = parseEventsToAdd(
        inputsToDisplay,
        eventTimeStart,
        eventTimeEnd,
        durationArr,
        titleArr,
        descriptionArr
      );
      await addEvents(calendarId, eventsToAdd);
      await fetchCalendarData(calendarId);
      storedValueArray = [];
      setInputsToDisplay(1);
    } catch (error) {
      console.log('this is the erorr', (error as Error).message);
      await fetchCalendarData(calendarId);
      toast.warn((error as Error).message);
    }
  };

  return (
    <section className={styles.section__eventform}>
      <form
        className={styles.event__form}
        onSubmit={handleSubmit}
        id="inputForm"
      >
        <div className={styles.event__config__container}>
          <label
            className={styles.event__form__label__timeinput}
            htmlFor="timeSlot"
          >
            <h2 className={styles.event__form__label__timeinput}>
              1. When are you free?{' '}
            </h2>
          </label>
          <div className={styles.event__form__timeinput}>
            <div className={styles.event__form_timeinput__min}>
              <label>From</label>
              <input
                type="time"
                ref={eventTimeStart}
                min={'00:00'}
                max={'23:59'}
                step={900}
                id="timeSlot"
                list="time_list_min"
                required
              ></input>
              <datalist id="time_list_min">
                {createTimeSlots().map(timeslot => (
                  <option value={timeslot} key={uuid()}></option>
                ))}
              </datalist>
            </div>
            <span> - </span>
            <div className={styles.event__form_timeinput__max}>
              <label>Until</label>
              <input
                type="time"
                ref={eventTimeEnd}
                min={'00:00'}
                max={'23:59'}
                step={900}
                list="time_list_max"
                required
              ></input>
              <datalist id="time_list_max">
                {createTimeSlots().map(timeslot => (
                  <option value={timeslot} key={uuid()}></option>
                ))}
              </datalist>
            </div>
          </div>
          <ul className={styles.event__form__weekdays__list}>
            {displayWeekdaysInProperOrder(weekdaysAvailable)}
          </ul>
          <label
            className={styles.event__form__label__calendarselect}
            htmlFor="calendarSelect"
          >
            Calendar
          </label>
          <div className={styles.event__form__select__container}>
            <select
              className={styles.event__form__select}
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
        </div>
        <h2 className={styles.event__form__input__heading}>
          {inputsToDisplay > 1 ? '2. Add your tasks!' : '2. Add your task!'}
        </h2>
        <section className={styles.event__form__input__section}>
          {returnNewEventInfo(
            titleArr,
            durationArr,
            descriptionArr,
            inputsToDisplay,
            storedValueArray,
            incrementInputLines
          )}
        </section>
        <button className={styles.submit__button} id="inputForm" type="submit">
          Add to calendar
        </button>
      </form>
    </section>
  );
};

export default EventForm;
