import React from "react";
import Layout from "../../components/layout/Layout";
import EventListPage from "./EventFeed";

const EventsPage = () => {
  return (
    <Layout>
      <div className="pt-10 pb-20">
        <EventListPage />
      </div>
    </Layout>
  );
};

export default EventsPage;
