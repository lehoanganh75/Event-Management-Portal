import React, { useState } from "react";
import MyEvents from "./MyEvents";
import CreateEvent from "./CreateEvent";

const ManageEvents = () => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      {isCreating ? (
        <CreateEvent onBack={() => setIsCreating(false)} />
      ) : (
        <MyEvents onCreateClick={() => setIsCreating(true)} />
      )}
    </>
  );
};

export default ManageEvents;