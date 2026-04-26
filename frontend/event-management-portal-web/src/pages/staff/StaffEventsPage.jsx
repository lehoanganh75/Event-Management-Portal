import React from "react";
import EventsManagement from "../../components/common/management/EventsManagement";

const StaffEventsPage = () => {
  return <EventsManagement type="lecturer" />; // Dùng chung component nhưng pass type để filter
};

export default StaffEventsPage;
