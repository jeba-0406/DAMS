package com.dams.dto;

import com.dams.entity.Request;
import com.dams.entity.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RequestDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @NotNull(message = "Request type is required")
        private RequestType type;

        // Dynamic Fields (Existing)
        private LocalDate startDate;
        private LocalDate endDate;
        private String itemName;
        private Double amount;
        private Integer hours;
        private LocalDate overtimeDate;

        // PROJECT_COMPLETION Specific Fields
        private LocalDate actualStartDate;
        private LocalDate actualEndDate;
        private LocalDate completionDate;
        private String projectLink;
        private String summary;

        // OD_REQUEST Specific Fields
        private LocalDate odDate;
        private String approvedByFaculty;

        // Note: Files are handled separately in MultipartFile parameters
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequestResponse {
        private Long id;
        private String title;
        private String description;
        private String type;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime approvedAt;
        private Long employeeId;
        private String employeeName;
        private String employeeEmail;
        private String employeeDepartment;

        // Dynamic Fields (Existing)
        private LocalDate startDate;
        private LocalDate endDate;
        private String itemName;
        private Double amount;
        private Integer hours;
        private LocalDate overtimeDate;

        // PROJECT_COMPLETION Specific Fields
        private LocalDate actualStartDate;
        private LocalDate actualEndDate;
        private LocalDate completionDate;
        private String projectLink;
        private String finalDocumentPath;
        private String summary;

        // OD_REQUEST Specific Fields
        private LocalDate odDate;
        private String approvedByFaculty;
        private String supportingDocumentPath;

        public static RequestResponse from(Request request) {
            return RequestResponse.builder()
                    .id(request.getId())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .type(request.getType().name())
                    .status(request.getStatus().name())
                    .createdAt(request.getCreatedAt())
                    .approvedAt(request.getApprovedAt())
                    .employeeId(request.getEmployee().getId())
                    .employeeName(request.getEmployee().getName())
                    .employeeEmail(request.getEmployee().getEmail())
                    .employeeDepartment(request.getEmployee().getDepartment())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .itemName(request.getItemName())
                    .amount(request.getAmount())
                    .hours(request.getHours())
                    .overtimeDate(request.getOvertimeDate())
                    .actualStartDate(request.getActualStartDate())
                    .actualEndDate(request.getActualEndDate())
                    .completionDate(request.getCompletionDate())
                    .projectLink(request.getProjectLink())
                    .finalDocumentPath(request.getFinalDocumentPath())
                    .summary(request.getSummary())
                    .odDate(request.getOdDate())
                    .approvedByFaculty(request.getApprovedByFaculty())
                    .supportingDocumentPath(request.getSupportingDocumentPath())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStats {
        private long total;
        private long pending;
        private long approved;
        private long rejected;
        private double approvalRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeApprovalStat {
        private String employeeName;
        private long approvedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminMetrics {
        private long totalRequests;
        private long approvedCount;
        private long rejectedCount;
        private long pendingCount;
        private double approvalRate;
        private Double averageApprovalTimeHours;
        private java.util.Map<String, Long> requestsByType;
        private java.util.List<EmployeeApprovalStat> topApprovedEmployees;
        // New metrics
        private java.util.List<MonthlyCount> monthlyTrend;
        private java.util.List<RejectionRateStat> rejectionRateByType;
        private java.util.List<PendingAgingStat> pendingAging;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCount {
        private String month;   // e.g. "Jan", "Feb"
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectionRateStat {
        private String type;
        private long total;
        private long rejected;
        private double rejectionRate; // percentage
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingAgingStat {
        private Long id;
        private String title;
        private String employeeName;
        private String type;
        private long agingDays;  // days since submitted
    }
}
