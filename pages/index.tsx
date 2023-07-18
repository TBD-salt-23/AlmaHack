import Calendar from '../components/Calendar';
import Layout from '../components/layout';
import EventForm from '../components/EventForm';

export default function IndexPage() {
  return (
    <Layout>
      <EventForm />
      <section className="upcoming__section">
        <Calendar />
      </section>
    </Layout>
  );
}
