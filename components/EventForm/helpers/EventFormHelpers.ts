import { Slot } from '../../../utils/types';

export const filterInappropriateTimes = (
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
        // console.log(
        //   'This slot is occupied',
        //   new Date(currentOccValue.start).getHours(),
        //   new Date(currentOccValue.start).getMinutes()
        // );
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
        break;
      }
    }
    if (slotIsOccupied) {
      confirmedOccupiedSlots.push(currentPosValue);
      continue;
    }

    //this is success
    freeQuarters.push(currentPosValue);
    // console.log(
    //   'free quarters looks like this on what I consider a success',
    //   freeQuarters
    //     .map(slot => {
    //       return (
    //         new Date(slot).getHours().toString() +
    //         new Date(slot).getMinutes().toString()
    //       );
    //     })
    //     .join('\n')
    // );

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
    // if (freeQuarters.length === quartersInDuration) { THIS CODE WORKS BUT RANDOMNESS SUFFERS
    //   unoccupiedSlots = [...unoccupiedSlots, freeQuarters];
    //   console.log(
    //     `free quarters (${freeQuarters.length}) is now equivalent to the length of the duration in quarters (${quartersInDuration}), adding to unoccupied slots`,
    //     unoccupiedSlots.map(slot => {
    //       return slot.map(quarter => {
    //         return (
    //           new Date(quarter).getHours().toString() +
    //           new Date(quarter).getMinutes().toString()
    //         );
    //       });
    //     })
    //   );
    //   freeQuarters = [];
    // }
  }
  return unoccupiedSlots;
};
