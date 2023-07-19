import { DAYS_OF_WEEK } from './consts';
export const weekBoundaries = () => {
  const currentDate = new Date();
  //'2023-07-22T23:59:59.000Z'
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
  }/${new Date(time).getDate()} (All day)`;


export function shuffle(array: any[]) {
  const arrayCopy = [...array];

  let currentIndex = arrayCopy.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
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

export const generateAppropriateTime = (
  startWindow: string,
  endWindow: string,
  durationMiliSeconds: number
) => {
  const [currentDate, nextWeekStart, nextWeekEnd] = weekBoundaries();

  const [startWindowUnixHours, startWindowUnixMinutes] =
    hoursMinutesToUnix(startWindow);
  const [endWindowUnixHours, endWindowUnixMinutes] =
    hoursMinutesToUnix(endWindow);

  const nextWeekStartUnix = nextWeekStart.getTime();
  const nextWeekEndUnix = nextWeekEnd.getTime();
  const appropriateTimeSlot = [];
  for (
    let dayIterator = nextWeekStartUnix;
    dayIterator < nextWeekEndUnix;
    dayIterator += 1000 * 60 * 60 * 24
  ) {
    for (
      let quarterIterator =
        dayIterator + startWindowUnixHours + startWindowUnixMinutes;
      quarterIterator <
      dayIterator +
        endWindowUnixHours +
        endWindowUnixMinutes -
        durationMiliSeconds;
      quarterIterator += 15 * 60 * 1000
    ) {
      appropriateTimeSlot.push(quarterIterator);
    }
  }
  return appropriateTimeSlot;
};
