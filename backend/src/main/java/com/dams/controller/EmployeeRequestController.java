package com.dams.controller;

import com.dams.dto.ApiResponse;
import com.dams.dto.RequestDto;
import com.dams.entity.User;
import com.dams.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class EmployeeRequestController {

    private final RequestService requestService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RequestDto.RequestResponse>> createRequest(
            @RequestPart("request") @Valid RequestDto.CreateRequest dto,
            @RequestPart(value = "finalDocument", required = false) MultipartFile finalDocument,
            @RequestPart(value = "supportingDocument", required = false) MultipartFile supportingDocument,
            @AuthenticationPrincipal User currentUser) {

        RequestDto.RequestResponse response = requestService.createRequest(
                dto, currentUser, finalDocument, supportingDocument);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Request created successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RequestDto.RequestResponse>>> getMyRequests(
            @AuthenticationPrincipal User currentUser) {
        List<RequestDto.RequestResponse> requests = requestService.getMyRequests(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<ApiResponse<RequestDto.EmployeeStats>> getMyStats(
            @AuthenticationPrincipal User currentUser) {
        RequestDto.EmployeeStats stats = requestService.getMyStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
