package com.portfolio.common;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class PaginationResponse<T> {

    private List<T> content;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean first;

    private boolean last;

    private boolean hasNext;

    private boolean hasPrevious;

    public PaginationResponse(
            Page<T> pageData
    ) {

        this.content =
                pageData.getContent();

        this.page =
                pageData.getNumber();

        this.size =
                pageData.getSize();

        this.totalElements =
                pageData.getTotalElements();

        this.totalPages =
                pageData.getTotalPages();

        this.first =
                pageData.isFirst();

        this.last =
                pageData.isLast();

        this.hasNext =
                pageData.hasNext();

        this.hasPrevious =
                pageData.hasPrevious();
    }
}