import React from "react";
import { EventCreator } from "../../components/event-planner/EventCreator";

const EventCreatorPage = ({ onBack }) => {
  return <EventCreator onBack={onBack} />;
};

export { EventCreator }; // Keep the named export for AppRouter compatibility
export default EventCreatorPage;
