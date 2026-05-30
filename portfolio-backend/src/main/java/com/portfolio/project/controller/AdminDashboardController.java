package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.AnalyticsChartResponse;
import com.portfolio.project.dto.DashboardOverviewResponse;
import com.portfolio.project.dto.DashboardStatsResponse;
import com.portfolio.project.service.AdminDashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService
            service;

    public AdminDashboardController(
            AdminDashboardService service
    ) {

        this.service = service;
    }

    /*
     * STATS
     */
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse>
    stats() {

        return new ApiResponse<>(
                true,
                "Dashboard stats fetched",
                service.getStats()
        );
    }

    /*
     * OVERVIEW
     */
    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewResponse>
    overview() {

        return new ApiResponse<>(
                true,
                "Dashboard overview fetched",
                service.getOverview()
        );
    }

    /*
     * ANALYTICS CHARTS
     */
    @GetMapping("/charts")
    public ApiResponse<AnalyticsChartResponse>
    charts() {

        return new ApiResponse<>(
                true,
                "Dashboard charts fetched",
                service.getAnalyticsCharts()
        );
    }
}