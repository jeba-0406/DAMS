package com.dams.service;

import com.dams.dto.PageResponse;
import com.dams.dto.RequestDto;
import com.dams.entity.Request;
import com.dams.entity.RequestType;
import com.dams.entity.User;
import com.dams.exception.BadRequestException;
import com.dams.exception.ResourceNotFoundException;
import com.dams.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestService {

    private final RequestRepository requestRepository;
    private final com.dams.repository.UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public RequestDto.RequestResponse createRequest(
            RequestDto.CreateRequest dto,
            User employee,
            MultipartFile finalDocument,
            MultipartFile supportingDocument) {

        validateRequestByType(dto, finalDocument);

        Request.RequestBuilder requestBuilder = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .status(Request.Status.PENDING)
                .employee(employee);

        // Map Common & New Fields
        switch (dto.getType()) {
            case LEAVE -> {
                requestBuilder.startDate(dto.getStartDate()).endDate(dto.getEndDate());
            }
            case PURCHASE -> {
                requestBuilder.itemName(dto.getItemName()).amount(dto.getAmount());
            }
            case OVERTIME -> {
                requestBuilder.overtimeDate(dto.getOvertimeDate()).hours(dto.getHours());
            }
            case PROJECT_COMPLETION -> {
                requestBuilder.actualStartDate(dto.getActualStartDate())
                        .actualEndDate(dto.getActualEndDate())
                        .completionDate(dto.getCompletionDate())
                        .projectLink(dto.getProjectLink())
                        .summary(dto.getSummary());

                if (finalDocument != null && !finalDocument.isEmpty()) {
                    String fileName = fileStorageService.storeFile(finalDocument, "PROJECT");
                    requestBuilder.finalDocumentPath(fileName);
                }
            }
            case OD_REQUEST -> {
                requestBuilder.odDate(dto.getOdDate())
                        .approvedByFaculty(dto.getApprovedByFaculty());

                if (supportingDocument != null && !supportingDocument.isEmpty()) {
                    String fileName = fileStorageService.storeFile(supportingDocument, "OD");
                    requestBuilder.supportingDocumentPath(fileName);
                }
            }
        }

        Request request = requestBuilder.build();
        Request saved = requestRepository.save(request);
        log.info("Request created: {} by employee: {}", saved.getId(), employee.getEmail());
        return RequestDto.RequestResponse.from(saved);
    }

    private void validateRequestByType(RequestDto.CreateRequest dto, MultipartFile finalDocument) {
        switch (dto.getType()) {
            case LEAVE -> {
                if (dto.getStartDate() == null || dto.getEndDate() == null) {
                    throw new BadRequestException("Start and End dates are required for LEAVE requests");
                }
            }
            case PURCHASE -> {
                if (dto.getItemName() == null || dto.getAmount() == null) {
                    throw new BadRequestException("Item Name and Amount are required for PURCHASE requests");
                }
            }
            case OVERTIME -> {
                if (dto.getOvertimeDate() == null || dto.getHours() == null) {
                    throw new BadRequestException("Overtime Date and Hours are required for OVERTIME requests");
                }
            }
            case PROJECT_COMPLETION -> {
                if (dto.getActualStartDate() == null || dto.getActualEndDate() == null
                        || dto.getCompletionDate() == null) {
                    throw new BadRequestException("Actual Start, End, and Completion dates are required");
                }
                if (dto.getCompletionDate().isBefore(dto.getActualEndDate())) {
                    throw new BadRequestException("Completion Date cannot be before Actual End Date");
                }
                // Validation: Either projectLink or finalDocument must be provided
                boolean hasLink = dto.getProjectLink() != null && !dto.getProjectLink().isBlank();
                boolean hasFile = finalDocument != null && !finalDocument.isEmpty();
                if (!hasLink && !hasFile) {
                    throw new BadRequestException("Either Project Link or Final Document must be provided");
                }
            }
            case OD_REQUEST -> {
                if (dto.getOdDate() == null) {
                    throw new BadRequestException("OD Date is required for OD requests");
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<RequestDto.RequestResponse> getMyRequests(Long employeeId) {
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(RequestDto.RequestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestDto.EmployeeStats getMyStats(Long employeeId) {
        long total = requestRepository.countByEmployeeId(employeeId);
        long approved = requestRepository.countByEmployeeIdAndStatus(employeeId, Request.Status.APPROVED);
        long rejected = requestRepository.countByEmployeeIdAndStatus(employeeId, Request.Status.REJECTED);
        long pending = requestRepository.countByEmployeeIdAndStatus(employeeId, Request.Status.PENDING);
        double approvalRate = total > 0 ? (double) approved / total * 100 : 0;

        return RequestDto.EmployeeStats.builder()
                .total(total)
                .approved(approved)
                .rejected(rejected)
                .pending(pending)
                .approvalRate(Math.round(approvalRate * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<RequestDto.RequestResponse> getAllRequests(
            int page, 
            int size, 
            RequestType type, 
            Request.Status status,
            String search,
            LocalDate startDate,
            LocalDate endDate) {
        log.info("Fetching all requests for admin - page: {}, size: {}, type: {}, status: {}, search: {}, dateRange: {} to {}", 
                page, size, type, status, search, startDate, endDate);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        org.springframework.data.jpa.domain.Specification<Request> spec = 
                RequestSpecification.filterRequests(search, type, status, startDate, endDate);

        Page<Request> requests = requestRepository.findAll(spec, pageRequest);

        log.info("Found {} requests in total, {} on current page", requests.getTotalElements(),
                requests.getNumberOfElements());
        Page<RequestDto.RequestResponse> mapped = requests.map(RequestDto.RequestResponse::from);
        return PageResponse.from(mapped);
    }

    @Transactional
    public RequestDto.RequestResponse approveRequest(Long requestId) {
        Request request = findById(requestId);
        if (request.getStatus() != Request.Status.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved");
        }
        request.setStatus(Request.Status.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        Request saved = requestRepository.save(request);
        log.info("Request approved: {}", requestId);
        return RequestDto.RequestResponse.from(saved);
    }

    @Transactional
    public RequestDto.RequestResponse rejectRequest(Long requestId) {
        Request request = findById(requestId);
        if (request.getStatus() != Request.Status.PENDING) {
            throw new BadRequestException("Only PENDING requests can be rejected");
        }
        request.setStatus(Request.Status.REJECTED);
        request.setApprovedAt(LocalDateTime.now());
        Request saved = requestRepository.save(request);
        log.info("Request rejected: {}", requestId);
        return RequestDto.RequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public RequestDto.AdminMetrics getAdminMetrics() {
        long total = requestRepository.count();
        long approved = requestRepository.countByStatus(Request.Status.APPROVED);
        long rejected = requestRepository.countByStatus(Request.Status.REJECTED);
        long pending = requestRepository.countByStatus(Request.Status.PENDING);
        double approvalRate = total > 0 ? (double) approved / total * 100 : 0;
        Double avgTime = requestRepository.findAverageApprovalTimeInHours();

        java.util.List<Object[]> typeStats = requestRepository.countByTypeGrouped();
        java.util.Map<String, Long> requestsByType = typeStats.stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> row[0].toString(),
                        row -> ((Number) row[1]).longValue()
                ));

        java.util.List<Object[]> topEmployees = requestRepository.findTopEmployeesByApprovedRequests(PageRequest.of(0, 5));
        java.util.List<RequestDto.EmployeeApprovalStat> topApprovedEmployees = topEmployees.stream()
                .map(row -> new RequestDto.EmployeeApprovalStat(
                        (String) row[0],
                        ((Number) row[1]).longValue()
                ))
                .toList();

        // Monthly Trend (current year)
        int currentYear = java.time.Year.now().getValue();
        List<Object[]> monthlyRaw = requestRepository.countMonthlyTrend(currentYear);
        String[] MONTH_NAMES = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        java.util.Map<Integer, Long> monthlyMap = monthlyRaw.stream().collect(
                java.util.stream.Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> ((Number) row[1]).longValue()
                ));
        List<RequestDto.MonthlyCount> monthlyTrend = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            monthlyTrend.add(new RequestDto.MonthlyCount(MONTH_NAMES[m - 1], monthlyMap.getOrDefault(m, 0L)));
        }

        // Rejection Rate by Type
        List<Object[]> rejRaw = requestRepository.countRejectionByType();
        List<RequestDto.RejectionRateStat> rejectionRateByType = rejRaw.stream().map(row -> {
            String typeName = row[0].toString();
            long rowTotal = ((Number) row[1]).longValue();
            long rowRejected = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            double rate = rowTotal > 0 ? (double) rowRejected / rowTotal * 100 : 0;
            return new RequestDto.RejectionRateStat(typeName, rowTotal, rowRejected, Math.round(rate * 10.0) / 10.0);
        }).toList();

        // Pending Aging
        List<Request> pendingList = requestRepository.findAllPending();
        LocalDate today = LocalDate.now();
        List<RequestDto.PendingAgingStat> pendingAging = pendingList.stream().map(r -> {
            long days = r.getCreatedAt() != null
                    ? ChronoUnit.DAYS.between(r.getCreatedAt().toLocalDate(), today)
                    : 0L;
            return new RequestDto.PendingAgingStat(r.getId(), r.getTitle(), r.getEmployee().getName(), r.getType().name(), days);
        }).toList();

        return RequestDto.AdminMetrics.builder()
                .totalRequests(total)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .pendingCount(pending)
                .approvalRate(Math.round(approvalRate * 100.0) / 100.0)
                .averageApprovalTimeHours(avgTime != null ? Math.round(avgTime * 100.0) / 100.0 : null)
                .requestsByType(requestsByType)
                .topApprovedEmployees(topApprovedEmployees)
                .monthlyTrend(monthlyTrend)
                .rejectionRateByType(rejectionRateByType)
                .pendingAging(pendingAging)
                .build();
    }

    @Transactional(readOnly = true)
    public com.dams.dto.CalendarDto.CalendarResponse getCalendarView(int year, int month) {
        java.time.LocalDate startOfMonth = java.time.LocalDate.of(year, month, 1);
        java.time.LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate nextWeek = today.plusDays(7);

        long totalHeadcount = userRepository.count();

        List<Request> calendarRequests = requestRepository.findCalendarRequests(startOfMonth, endOfMonth);
        List<com.dams.dto.CalendarDto.CalendarEvent> events = calendarRequests.stream().map(req -> {
            boolean isOd = req.getType() == RequestType.OD_REQUEST;
            return com.dams.dto.CalendarDto.CalendarEvent.builder()
                    .id(req.getId())
                    .employeeName(req.getEmployee().getName())
                    .title(req.getEmployee().getName() + " (" + req.getType().name().replace("_", " ") + ")")
                    .startDate(isOd ? req.getOdDate() : req.getStartDate())
                    .endDate(isOd ? req.getOdDate() : req.getEndDate())
                    .type(req.getType().name())
                    .status(req.getStatus().name())
                    .employeeDepartment(req.getEmployee().getRole() != null ? req.getEmployee().getRole().name() : "N/A")
                    .build();
        }).toList();

        List<Request> outTodayRequests = requestRepository.findApprovedRequestsByDate(today);
        long outTodayCount = outTodayRequests.size();
        List<com.dams.dto.CalendarDto.CurrentlyOutUser> currentlyOut = outTodayRequests.stream().map(req -> {
            boolean isOd = req.getType() == RequestType.OD_REQUEST;
            return com.dams.dto.CalendarDto.CurrentlyOutUser.builder()
                    .name(req.getEmployee().getName())
                    .department(req.getEmployee().getRole() != null ? req.getEmployee().getRole().name() : "N/A")
                    .startDate(isOd ? req.getOdDate() : req.getStartDate())
                    .endDate(isOd ? req.getOdDate() : req.getEndDate())
                    .build();
        }).toList();

        List<Request> upcomingReqs = requestRepository.findUpcomingApprovedRequests(today, nextWeek);
        List<com.dams.dto.CalendarDto.UpcomingAbsence> upcoming = upcomingReqs.stream().map(req -> {
            boolean isOd = req.getType() == RequestType.OD_REQUEST;
            java.time.LocalDate sDate = isOd ? req.getOdDate() : req.getStartDate();
            java.time.LocalDate eDate = isOd ? req.getOdDate() : req.getEndDate();
            long dDays = sDate != null && eDate != null ? java.time.temporal.ChronoUnit.DAYS.between(sDate, eDate) + 1 : 1;
            return com.dams.dto.CalendarDto.UpcomingAbsence.builder()
                    .name(req.getEmployee().getName())
                    .type(req.getType().name().replace("_", " "))
                    .startDate(sDate)
                    .endDate(eDate)
                    .durationDays(dDays)
                    .build();
        }).toList();

        return com.dams.dto.CalendarDto.CalendarResponse.builder()
                .todaysOverview(new com.dams.dto.CalendarDto.TodaysOverview(outTodayCount, totalHeadcount))
                .events(events)
                .currentlyOut(currentlyOut)
                .upcoming(upcoming)
                .build();
    }

    private Request findById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + id));
    }
}
