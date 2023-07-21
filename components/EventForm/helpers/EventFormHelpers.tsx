import { Slot, ApiEvent, StoredValue } from '../../../utils/types';
import NewEventInfo from '../NewEventInfo';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import LastNewEventInfo from '../LastNewEventInfo';

export const handleSelect = (
  e: React.ChangeEvent<HTMLSelectElement>,
  setCalendarToRender: (value: string) => void
) => {
  if (!e.target.value) return;
  toast.info('Switching calendar!');
  setCalendarToRender(e.target.value);
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
    const startWindow = eventTimeStart.current?.value || ''; //TODO: CONSIDER THIS
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
    toast.warn('Task name and duration are required!');
    return eventsToAdd;
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

export const returnNewEventInfo = (
  titleArr: React.MutableRefObject<HTMLInputElement[]>,
  durationArr: React.MutableRefObject<HTMLInputElement[]>,
  descriptionArr: React.MutableRefObject<HTMLInputElement[]>,
  inputsToDisplay: number,
  storedValueArray: StoredValue[],
  incrementInputLines: () => void
) => {
  const newEvents = [];
  console.log(
    'this is stored values inside the new event returner',
    storedValueArray
  );

  for (let i = 0; i < inputsToDisplay; i++) {
    if (i === inputsToDisplay - 1) {
      // const identifier = uuid();
      newEvents.push(
        <LastNewEventInfo
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
    // const identifier = uuid();

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
        if (freeQuarters.length >= quartersInDuration) {
          const possibleTimeSlot = freeQuarters.slice(
            0,
            quartersInDuration * -1
          );
          console.log(
            'this is after the slice',
            possibleTimeSlot.map(quarter => {
              return (
                new Date(quarter).getHours().toString() +
                new Date(quarter).getMinutes().toString()
              );
            })
          );
          unoccupiedSlots.push(possibleTimeSlot);
        }
        freeQuarters = [];
        // break; THIS GUY WAS RECENTLY COMMENTED OUT, IF THERE IS A BIG ISSUE
        //WITH COLLISON I THINK ADD HIM BACK IN, BUT AS OF RIGHT NOW I DON'T
        //UNDERSTAND HIS PURPOSE SINCE WE CONTINUE WHEN WE GET OUT OF HERE
      }
    }
    if (slotIsOccupied) {
      confirmedOccupiedSlots.push(currentPosValue);
      continue;
    }

    freeQuarters.push(currentPosValue);
    if (timeSlotIterator === possibleTimes.length - 1) {
      console.log(
        'on the final loop, free quarters looks like',
        freeQuarters.map(quarter => {
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
          unoccupiedSlots.map(slot => {
            return slot.map(quarter => {
              return (
                new Date(quarter).getHours().toString() +
                new Date(quarter).getMinutes().toString()
              );
            });
          })
        );
      }
    }
  }
  return unoccupiedSlots;
};
