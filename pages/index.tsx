import Calendar from '../components/Calendar';
import Layout from '../components/layout';
import EventForm from '../components/EventForm';
import { ApiEvent } from '../utils/types';
import { useState, useEffect } from 'react';

export default function IndexPage() {
  const [content, setContent] = useState<ApiEvent[]>([]);
  const fetchData = async () => {
    const res = await fetch('/api/calendar/events');
    const json = await res.json();
    if (json.content) {
      if ('error' in json.content) {
        console.log('there was an error', json.content.error);
        return;
      }
      setContent(json.content);
    }
  };
  useEffect(() => {
    console.log('EVERYTHING IS RE-RENDERED!!!');
    fetchData();
  }, []);

  return (
    <Layout>
      <EventForm fetchData={fetchData} content={content} />
      <section className="upcoming__section">
        <Calendar content={content} />
      </section>
    </Layout>
  );
}
