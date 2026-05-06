package com.analyticsservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.analyticsservice.entity.EventSummaryReport;

@Repository
public interface EventSummaryReportRepository extends JpaRepository<EventSummaryReport, String> {
}
