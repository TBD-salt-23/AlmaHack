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
