import Calendar from '../components/Calendar/Calendar';
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
      const calendarResponse = await res.json();

      setCalendarData(calendarResponse);
    } catch (error) {
      console.log(
        'this is the error we are putting in the toast',
        (error as Error).message
      );
      //this is a bit of a lie
      toast.error('Please refresh the page :)');
    }
  };
  useEffect(() => {
    fetchCalendarData(calendarToRender);
  }, [calendarToRender]);
  console.log('EVERYTHING IS RE-RENDERED!!!');

  return (
    <Layout>
      <EventForm
        fetchCalendarData={fetchCalendarData}
        content={calendarData}
        calendarToRender={calendarToRender}
        setCalendarToRender={setCalendarToRender}
      />
      <section className="upcoming__section">
        <Calendar
          events={calendarData.eventList}
          calendarToRender={calendarToRender}
          fetchCalendarData={fetchCalendarData}
        />
      </section>
      <ToastContainer />
    </Layout>
  );
}
