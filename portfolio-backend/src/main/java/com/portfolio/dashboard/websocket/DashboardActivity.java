package com.portfolio.dashboard.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class DashboardActivity {

    private String type;

    private String message;

    private Date timestamp;
}