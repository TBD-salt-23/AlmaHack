import { DAYS_OF_WEEK } from './consts';
import { WeekdayAndBoolean } from './types';

const returnAsDoubleDigit = (number: number) =>
  number.toString().length !== 2 ? `0${number}` : `${number}`;
// {
//   if (number.toString().length !== 2) {
//     return `0${number}`;
//   }
//   return `${number}`;
// };

export const createTimeSlots = () => {
  const timeSlotArray: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlotArray.push(`${returnAsDoubleDigit(h)}:${returnAsDoubleDigit(m)}`);
    }
  }
  return timeSlotArray;
};

export const weekBoundaries = () => {
  const currentDate = new Date();

  const nextWeekStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + (7 - currentDate.getDay()) + 1
  );
  const nextWeekEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + (7 - currentDate.getDay()) + 8
  );

  return [currentDate, nextWeekStart, nextWeekEnd];
};

export const parseTimeNicely = (time: string) =>
  `${DAYS_OF_WEEK[new Date(time).getDay() as keyof typeof DAYS_OF_WEEK]} ${
    new Date(time).getMonth() + 1
  }/${new Date(time).getDate()} ${new Date(time)
    .toLocaleTimeString()
    .substring(0, 5)}`;

export const hoursToMiliseconds = (hours: number) => {
  return hours * 60 * 60 * 1000;
};

export const parseAllDayEvents = (time: string) =>
  `${DAYS_OF_WEEK[new Date(time).getDay() as keyof typeof DAYS_OF_WEEK]} ${
    new Date(time).getMonth() + 1
  }/${new Date(time).getDate()}`;

export function shuffle(array: any[]) {
  const arrayCopy = [...array];

  let currentIndex = arrayCopy.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[currentIndex],
    ];
  }
  return arrayCopy;
}

const hoursMinutesToUnix = (timeWindow: string) => {
  if (timeWindow.length !== 5) {
    throw new Error('Somehow this time is the wrong amount of characters');
  }
  const timeWindowHours = parseInt(timeWindow.substring(0, 2)) * 60 * 60 * 1000;
  const timeWindowMinutes = parseInt(timeWindow.substring(3, 5)) * 60 * 1000;
  return [timeWindowHours, timeWindowMinutes];
};

export const parseTimeSlotWindowAsUnix = (
  startWindow: string,
  endWindow: string,
  durationMiliSeconds: number,
  daysForTasks: WeekdayAndBoolean[]
) => {
  const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();

  const [startWindowUnixHours, startWindowUnixMinutes] =
    hoursMinutesToUnix(startWindow);
  const [endWindowUnixHours, endWindowUnixMinutes] =
    hoursMinutesToUnix(endWindow);

  const nextWeekStartUnix = nextWeekStart.getTime();
  const nextWeekEndUnix = nextWeekEnd.getTime();
  const appropriateTimeSlotsPerDay = [];
  for (
    let dayIterator = nextWeekStartUnix;
    dayIterator < nextWeekEndUnix;
    dayIterator += 1000 * 60 * 60 * 24
  ) {
    const appropriateTimesForThisDay = [];
    const currentWeekday = daysForTasks[new Date(dayIterator).getDay()];
    if (!currentWeekday.checked) {
      continue;
    }
    for (
      let quarterIterator =
        dayIterator + startWindowUnixHours + startWindowUnixMinutes;
      quarterIterator <= //IF WE GET OFF BY ONE THEN CHANGE THIS GUY TO BE <
      dayIterator + endWindowUnixHours + endWindowUnixMinutes;
      //  - durationMiliSeconds; THIS GUY USED TO BE DEDUCTED FROM THE DAYITERATOR STUFF, BUT I THINK WE ARE FINE RETURNING BIG QUARTERS HERE AND THEN DOING THE LOGIC
      quarterIterator += 15 * 60 * 1000
    ) {
      appropriateTimesForThisDay.push(quarterIterator);
    }
    appropriateTimeSlotsPerDay.push(appropriateTimesForThisDay);
  }
  console.log(
    'this guy should have 5 or so things with a bunch of times',
    appropriateTimeSlotsPerDay
  );
  return appropriateTimeSlotsPerDay;
};
