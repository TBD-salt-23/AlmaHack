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
