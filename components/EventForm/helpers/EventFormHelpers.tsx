import {
  Slot,
  ApiEvent,
  StoredValue,
  WeekdayAndBoolean,
} from '../../../utils/types';
import NewEventInfo from '../NewEventInfo';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import styles from '../styles/EventForm.module.css';
import axios from 'axios';

export const handleSelect = (
  e: React.ChangeEvent<HTMLSelectElement>,
  setCalendarToRender: (value: string) => void
) => {
  if (!e.target.value) return;
  toast.info('Switching calendar!');
  setCalendarToRender(e.target.value);
};

export const addEventsToGoogleCal = async (
  startTime: number,
  endTime: number,
  title: string,
  calendarId: string,
  description: string
) => {
  try {
    const body = {
      googleEvent: {
        start: {
          dateTime: new Date(startTime),
        },
        end: {
          dateTime: new Date(endTime),
        },
        summary: title || 'You should have provided a title you numbskull',
        description,
      },
      calendarId,
    };
    const res = await axios.post(`/api/${calendarId}/postEvent`, body);
    console.log('this is the res from the addEventsToGoogleCal', res);
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const parseEventsToAdd = (
  inputsToDisplay: number,
  eventTimeStart: React.RefObject<HTMLInputElement>,
  eventTimeEnd: React.RefObject<HTMLInputElement>,
  durationArr: React.MutableRefObject<HTMLInputElement[]>,
  titleArr: React.MutableRefObject<HTMLInputElement[]>,
  descriptionArr: React.MutableRefObject<HTMLInputElement[]>
) => {
  const eventsToAdd = [];
  for (let i = 0; i < inputsToDisplay; i++) {
    const startWindow = eventTimeStart.current?.value || '';
    const endWindow = eventTimeEnd.current?.value || '';
    const duration = durationArr.current[i].value;
    const title = titleArr.current[i].value;
    const description = descriptionArr.current[i].value || '';
    if (duration && title) {
      eventsToAdd.push({
        startWindow,
        endWindow,
        duration,
        title,
        description,
      });
    }
  }
  if (eventsToAdd.length === 0) {
    throw new Error('Task name and duration are required!');
  }
  return eventsToAdd;
};

const KEY_ARRAY: string[] = [];

const makeOrFindUuid = (i: number) => {
  if (KEY_ARRAY[i]) {
    return KEY_ARRAY[i];
  }
  return uuid();
};

export const renderWeekdayOption = (day: WeekdayAndBoolean) => {
  const uniqueKey = uuid();
  return (
    <li key={uniqueKey} className={styles.event__form__weekday_checkbox}>
      <input
        id={`day_${uniqueKey}`}
        type="checkbox"
        defaultChecked={day.checked}
        onChange={() => {
          day.checked ? (day.checked = false) : (day.checked = true);
        }}
      />
      <label htmlFor={`day_${uniqueKey}`}>{day.name}</label>
    </li>
  );
};

export const returnNewEventInfo = (
  titleArr: React.MutableRefObject<HTMLInputElement[]>,
  durationArr: React.MutableRefObject<HTMLInputElement[]>,
  descriptionArr: React.MutableRefObject<HTMLInputElement[]>,
  inputsToDisplay: number,
  storedValueArray: StoredValue[],
  incrementInputLines: () => void
) => {
  const newEvents = [];

  for (let i = 0; i < inputsToDisplay; i++) {
    if (i === inputsToDisplay - 1) {
      newEvents.push(
        <NewEventInfo
          titleRef={(el: HTMLInputElement) => (titleArr.current[i] = el)}
          durationRef={(el: HTMLInputElement) => (durationArr.current[i] = el)}
          descriptionRef={(el: HTMLInputElement) =>
            (descriptionArr.current[i] = el)
          }
          storedValue={storedValueArray[i] || ''}
          uuid={makeOrFindUuid(i)}
          incrementInputLines={incrementInputLines}
          key={makeOrFindUuid(i)}
        />
      );

      return newEvents;
    }

    newEvents.push(
      <NewEventInfo
        titleRef={(el: HTMLInputElement) => (titleArr.current[i] = el)}
        durationRef={(el: HTMLInputElement) => (durationArr.current[i] = el)}
        descriptionRef={(el: HTMLInputElement) =>
          (descriptionArr.current[i] = el)
        }
        storedValue={storedValueArray[i] || ''}
        uuid={makeOrFindUuid(i)}
        key={makeOrFindUuid(i)}
      />
    );
  }
  return newEvents;
};

export const getOccupiedSlots = (content: ApiEvent[]): Slot[] => {
  return content.map(event => {
    return {
      start: new Date(event.start.dateTime).getTime(),
      end: new Date(event.end.dateTime).getTime(),
    };
  });
};

export const filterOccupiedSlots = (
  occupiedSlots: Slot[],
  timeframeByDay: number[][],
  durationMiliseconds: number
) => {
  let unoccupiedSlots: number[][] = [];
  const confirmedOccupiedSlots = [];
  const fifteenMinutesInMiliseconds = 1 * 15 * 60 * 1000;
  const quartersInDuration = durationMiliseconds / fifteenMinutesInMiliseconds;
  let freeQuarters: number[] = [];

  for (
    let dayIterator = 0;
    dayIterator < timeframeByDay.length;
    dayIterator++
  ) {
    const dayToCheck = timeframeByDay[dayIterator];
    for (
      let timeSlotForDayIterator = 0;
      timeSlotForDayIterator < dayToCheck.length;
      timeSlotForDayIterator++
    ) {
      const currentPosValue = dayToCheck[timeSlotForDayIterator];
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
          if (freeQuarters.length >= quartersInDuration) {
            const possibleTimeSlot = freeQuarters.slice(
              0,
              (quartersInDuration - 1) * -1
            );
            unoccupiedSlots.push(possibleTimeSlot);
          }
          freeQuarters = [];
        }
      }
      if (slotIsOccupied) {
        confirmedOccupiedSlots.push(currentPosValue);
        continue;
      }
      freeQuarters.push(currentPosValue);
      console.log(
        'after pushing free quarters, it looks like this',
        freeQuarters.map(timeslot => {
          return `${new Date(timeslot).getHours()}:${new Date(
            timeslot
          ).getMinutes()} the ${new Date(timeslot).getDate()}`;
        })
      );
      if (timeSlotForDayIterator === dayToCheck.length - 1) {
        if (freeQuarters.length >= quartersInDuration) {
          const possibleTimeSlot = freeQuarters.slice(
            0,
            (quartersInDuration - 1) * -1
          );
          console.log(
            'this is the possible time slot we are adding',
            possibleTimeSlot
          );
          unoccupiedSlots.push(possibleTimeSlot);
          console.log(
            'we found a guy! We are adding him! Unoccupied slots looks like this',
            unoccupiedSlots
          );
          freeQuarters = [];
        }
      }
    }
  }
  console.log('these slots are unoccupied before returning', unoccupiedSlots);
  return unoccupiedSlots;
};
