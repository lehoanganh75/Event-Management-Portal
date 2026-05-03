package com.eventservice.dto.user;

import com.eventservice.entity.people.EventPresenter;
import com.eventservice.entity.registration.EventRegistration;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EventUserRoleResponse {
    private boolean isCreator;
    private boolean isApprover;
    private boolean isPresented;
    private boolean isRegistered;
    private String organizerRole; // LEADER, MEMBER, etc.
    private String systemRole; // ADMIN, STUDENT, etc.

    private EventRegistration registration; // chi tiết vé, QR, status...
    private EventPresenter presenter; // thông tin phiên trình bày

    // Permissions tiện lợi
    private boolean canEditEvent;
    private boolean canManageRegistrations;
    private boolean canViewTicket;
    private boolean canManageTeam;
    private boolean canManageLuckyDraw;
    private boolean canViewAnalytics;
    private boolean canCheckIn;
    // thêm sau: canCheckIn, canExport, ...
    private boolean canScanQR; // keep this one if it's already used
}
