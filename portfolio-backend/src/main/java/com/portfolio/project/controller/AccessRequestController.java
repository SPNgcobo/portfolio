package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.AccessDecisionRequest;
import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.service.AccessRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final AccessRequestService service;

    public AccessRequestController(
            AccessRequestService service
    ) {
        this.service = service;
    }

    /*
     * CREATE REQUEST
     */
    @PostMapping
    public ApiResponse<AccessRequest> create(
            @RequestBody AccessRequest request
    ) {

        return new ApiResponse<>(
                true,
                "Access request submitted",
                service.create(request)
        );
    }

    /*
     * GET ALL
     */
    @GetMapping
    public ApiResponse<List<AccessRequest>>
    getAll() {

        return new ApiResponse<>(
                true,
                "Access requests fetched",
                service.getAll()
        );
    }

    /*
     * GET PENDING
     */
    @GetMapping("/pending")
    public ApiResponse<List<AccessRequest>>
    getPending() {

        return new ApiResponse<>(
                true,
                "Pending requests fetched",
                service.getPending()
        );
    }

    /*
     * APPROVE
     */
    @PutMapping("/{id}/approve")
    public ApiResponse<AccessRequest> approve(
            @PathVariable String id,
            @RequestBody AccessDecisionRequest body
    ) {

        return new ApiResponse<>(
                true,
                "Access request approved",
                service.approve(
                        id,
                        body.getAdminMessage()
                )
        );
    }

    /*
     * REJECT
     */
    @PutMapping("/{id}/reject")
    public ApiResponse<AccessRequest> reject(
            @PathVariable String id,
            @RequestBody AccessDecisionRequest body
    ) {

        return new ApiResponse<>(
                true,
                "Access request rejected",
                service.reject(
                        id,
                        body.getAdminMessage()
                )
        );
    }
}