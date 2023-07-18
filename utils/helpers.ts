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

export const parseTimeNicely = (time: string) => {
  return `${
    DAYS_OF_WEEK[new Date(time).getDay() as keyof typeof DAYS_OF_WEEK]
  } ${new Date(time).getMonth() + 1}/${new Date(time).getDate()} ${new Date(
    time
  )
    .toLocaleTimeString()
    .substring(0, 5)}`;
};

export const hoursToMiliseconds = (hours: number) => {
  return hours * 60 * 60 * 1000;
};

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
  // if (timeWindow.length !== 5) {
  //   return [console.log('length is wrong in hoursminutestounix')];
  // }
  const timeWindowHours = parseInt(timeWindow.substring(0, 2)) * 60 * 60 * 1000;
  const timeWindowMinutes = parseInt(timeWindow.substring(3, 5)) * 60 * 1000;
  return [timeWindowHours, timeWindowMinutes];
};

export const generateAppropriateTime = (
  startWindow: string,
  endWindow: string,
  duration: string
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
    let i = nextWeekStartUnix;
    i < nextWeekEndUnix;
    i += 1000 * 60 * 60 * 24
  ) {
    for (
      let j = i + startWindowUnixHours + startWindowUnixMinutes;
      j < i + endWindowUnixHours + endWindowUnixMinutes;
      j += 15 * 60 * 1000
    ) {
      appropriateTimeSlot.push(j);
      console.log(
        'this is what we are pushing to appropriate timeslot',
        new Date(j)
      );
    }
  }
  return appropriateTimeSlot;
};
