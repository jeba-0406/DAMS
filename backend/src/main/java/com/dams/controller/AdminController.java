package com.dams.controller;

import com.dams.dto.ApiResponse;
import com.dams.dto.PageResponse;
import com.dams.dto.RequestDto;
import com.dams.entity.RequestType;
import com.dams.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final RequestService requestService;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<PageResponse<RequestDto.RequestResponse>>> getAllRequests(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "type", required = false) RequestType type,
            @RequestParam(name = "status", required = false) com.dams.entity.Request.Status status,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        PageResponse<RequestDto.RequestResponse> response = requestService.getAllRequests(page, size, type, status, search, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<ApiResponse<RequestDto.RequestResponse>> approveRequest(@PathVariable(name = "id") Long id) {
        RequestDto.RequestResponse response = requestService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request approved successfully", response));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<ApiResponse<RequestDto.RequestResponse>> rejectRequest(@PathVariable(name = "id") Long id) {
        RequestDto.RequestResponse response = requestService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request rejected successfully", response));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<RequestDto.AdminMetrics>> getMetrics() {
        RequestDto.AdminMetrics metrics = requestService.getAdminMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<com.dams.dto.CalendarDto.CalendarResponse>> getCalendarView(
            @RequestParam(name = "year") int year,
            @RequestParam(name = "month") int month) {
        com.dams.dto.CalendarDto.CalendarResponse response = requestService.getCalendarView(year, month);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
