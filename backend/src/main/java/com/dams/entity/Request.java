package com.dams.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests", indexes = {
        @Index(name = "idx_requests_employee_id", columnList = "employee_id"),
        @Index(name = "idx_requests_status", columnList = "status"),
        @Index(name = "idx_requests_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestType type = RequestType.LEAVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Common Dynamic Fields
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
    @Column(name = "final_document_path", length = 500)
    private String finalDocumentPath;
    @Column(columnDefinition = "TEXT")
    private String summary;

    // OD_REQUEST Specific Fields
    private LocalDate odDate;
    private String approvedByFaculty;
    @Column(name = "supporting_document_path", length = 500)
    private String supportingDocumentPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null)
            this.status = Status.PENDING;
        if (this.type == null)
            this.type = RequestType.LEAVE;
    }

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
