import Calendar from '../components/Calendar';
import Layout from '../components/layout';
import EventForm from '../components/EventForm/EventForm';
import { useState, useEffect } from 'react';
import { CalendarResponse } from '../utils/types';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export default function IndexPage() {
  const [calendarData, setCalendarData] = useState<CalendarResponse>({
    calendarList: [],
    eventList: [],
  });
  const [calendarToRender, setCalendarToRender] = useState('primary');
  const fetchCalendarData = async (calendarId: string = 'primary') => {
    try {
      const res = await fetch(`/api/${calendarId}/events`);
      console.log('this is the calendarId in index.ts', calendarId);
      console.log('this is the res when there is an error', res);

      const calendarResponse = await res.json();

      setCalendarData(calendarResponse);
    } catch (error) {
      console.log(
        'this is the error we are putting in the toast',
        (error as Error).message
      );
      //this is a bit of a lie
      toast.error('Session expired! Sign out and back in :)');
    }
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
      <ToastContainer />
    </Layout>
  );
}
