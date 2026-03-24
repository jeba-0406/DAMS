package com.dams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class CalendarDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarEvent {
        private Long id;
        private String employeeName;
        private String title;
        private LocalDate startDate;
        private LocalDate endDate;
        private String type;
        private String status;
        private String employeeDepartment; // Optional, mapping from role or a dummy field if needed
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodaysOverview {
        private long outToday;
        private long totalCompanyHeadcount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentlyOutUser {
        private String name;
        private String department;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingAbsence {
        private String name;
        private String type; // e.g. "Sick Leave"
        private LocalDate startDate;
        private LocalDate endDate;
        private long durationDays; // E.g., 2 days
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarResponse {
        private List<CalendarEvent> events;
        private TodaysOverview todaysOverview;
        private List<CurrentlyOutUser> currentlyOut;
        private List<UpcomingAbsence> upcoming;
    }
}
