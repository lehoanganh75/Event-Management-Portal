package com.eventservice.dto;

import com.eventservice.entity.EventPresenter;
import com.eventservice.entity.EventRegistration;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EventCurrentUserRole {
    private boolean isCreator;
    private boolean isApprover;
    private boolean isOrganizer;
    private boolean isPresented;
    private boolean isRegistered;

    private EventRegistration registration;     // chi tiết vé, QR, status...
    private EventPresenter presenter;      // thông tin phiên trình bày

    // Permissions tiện lợi
    private boolean canEditEvent;
    private boolean canManageRegistrations;
    private boolean canViewTicket;
    // thêm sau: canCheckIn, canExport, ...
}