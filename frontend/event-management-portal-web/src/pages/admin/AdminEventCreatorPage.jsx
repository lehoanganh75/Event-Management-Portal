import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventCreator } from "../../components/event-planner/EventCreator";
import eventService from "../../services/eventService";
import { Loader2 } from "lucide-react";

const AdminEventCreatorPage = ({ onBack }) => {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const res = await eventService.getEventById(id);
          const data = res.data;
          
          // Map backend data to EventCreator's formData structure
          const mappedData = {
            id: data.id,
            eventTitle: data.title,
            eventType: data.type,
            startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : "",
            endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : "",
            registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString().slice(0, 16) : "",
            location: data.location,
            eventPurpose: data.description,
            eventTopic: data.eventTopic,
            maxParticipants: data.maxParticipants,
            organizationId: data.organization?.id,
            orgSelectionMode: "existing",
            coverImage: data.coverImage,
            notes: data.notes,
            additionalInfo: data.additionalInfo,
            status: data.status, // Bổ sung status
            targetObjects: data.targetObjects || [],
            recipients: data.recipients || [],
            invitations: data.invitations || [],
            presenters: data.presenters || [],
            sessions: data.sessions || [],
            interactionSettings: data.interactionSettings || {},
            hasLuckyDraw: data.hasLuckyDraw || false,
          };
          
          setInitialData(mappedData);
        } catch (err) {
          console.error("Lỗi khi tải thông tin sự kiện:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  return <EventCreator onBack={onBack} initialFormData={initialData || {}} planId={id} fromPlan={false} isEdit={!!id} />;
};

export { EventCreator }; // Keep the named export for AppRouter compatibility
export default AdminEventCreatorPage;
