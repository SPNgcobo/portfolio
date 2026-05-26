package com.portfolio.analytics.controller;

import com.portfolio.analytics.dto.AnalyticsDashboardResponse;
import com.portfolio.analytics.model.Visitor;
import com.portfolio.analytics.service.AnalyticsService;
import com.portfolio.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(
            AnalyticsService service
    ) {
        this.service = service;
    }

    /*
     * TRACK VISIT
     */
    @PostMapping("/track")
    public ApiResponse<Visitor> trackVisit(
            HttpServletRequest request,
            @RequestParam String page
    ) {

        return new ApiResponse<>(
                true,
                "Visit tracked",
                service.trackVisit(
                        request,
                        page
                )
        );
    }

    /*
     * GET VISITORS
     */
    @GetMapping
    public ApiResponse<List<Visitor>> getVisitors() {

        return new ApiResponse<>(
                true,
                "Visitors fetched",
                service.getAll()
        );
    }

    /*
     * TOTAL VISITS
     */
    @GetMapping("/count")
    public ApiResponse<Long> totalVisits() {

        return new ApiResponse<>(
                true,
                "Total visits fetched",
                service.totalVisits()
        );
    }

    /*
     * DASHBOARD ANALYTICS
     */
    @GetMapping("/dashboard")
    public ApiResponse<AnalyticsDashboardResponse>
    dashboard() {

        return new ApiResponse<>(
                true,
                "Dashboard analytics fetched",
                service.dashboard()
        );
    }
}