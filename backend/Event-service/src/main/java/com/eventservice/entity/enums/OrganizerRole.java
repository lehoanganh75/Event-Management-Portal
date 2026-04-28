package com.eventservice.entity.enums;

public enum OrganizerRole {
    ORGANIZER,   // Admin/Creator (Global control)
    LEADER,      // Event Team Lead (Full lifecycle control)
    COORDINATOR, // Operations Manager (Staff/Member management)
    MEMBER,      // Support Staff (Scanning, basic operations)
    ADVISOR,     // Supervisor (Read-only + Feedback)
    PARTICIPANT  // Attendee (Registration, QR display)
}