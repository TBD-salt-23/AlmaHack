import Calendar from '../components/Calendar';
import Layout from '../components/layout';
import EventForm from '../components/EventForm';
import { useState, useEffect } from 'react';
import { CalendarResponse } from '../utils/types';

export default function IndexPage() {
  const [calendarData, setCalendarData] = useState<CalendarResponse>({
    calendarList: [],
    eventList: [],
  });
  const [calendarToRender, setCalendarToRender] = useState('primary');
  const fetchCalendarData = async (calendarId: string = 'primary') => {
    const res = await fetch(`/api/${calendarId}/events`);

    const calendarResponse = await res.json();

    if ('error' in calendarResponse) {
      console.log('there was an error', calendarResponse.error);
      return;
    }
    setCalendarData(calendarResponse);
  };
  useEffect(() => {
    fetchCalendarData(calendarToRender);
  }, [calendarToRender]);
  console.log('EVERYTHING IS RE-RENDERED!!!');

  return (
    <Layout>
      <EventForm
        fetchData={fetchCalendarData}
        content={calendarData}
        calendarToRender={calendarToRender}
        setCalendarToRender={setCalendarToRender}
      />
      <section className="upcoming__section">
        <Calendar content={calendarData.eventList} />
      </section>
    </Layout>
  );
}
