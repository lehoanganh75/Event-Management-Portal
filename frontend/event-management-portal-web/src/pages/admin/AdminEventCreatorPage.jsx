import React from "react";
import { EventCreator } from "../../components/event-planner/EventCreator";

const AdminEventCreatorPage = ({ onBack }) => {
  return <EventCreator onBack={onBack} />;
};

export { EventCreator }; // Keep the named export for AppRouter compatibility
export default AdminEventCreatorPage;
