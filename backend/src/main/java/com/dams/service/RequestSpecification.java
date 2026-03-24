package com.dams.service;

import com.dams.entity.Request;
import com.dams.entity.RequestType;
import com.dams.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class RequestSpecification {

    public static Specification<Request> filterRequests(
            String search,
            RequestType type,
            Request.Status status,
            LocalDate startDate,
            LocalDate endDate) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by name, type (string), or department
            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Join<Request, User> employeeJoin = root.join("employee");
                
                Predicate namePredicate = cb.like(cb.lower(employeeJoin.get("name")), searchPattern);
                Predicate deptPredicate = cb.like(cb.lower(employeeJoin.get("department")), searchPattern);
                // Also support searching by type name as text
                Predicate typePredicate = cb.like(cb.lower(root.get("type").as(String.class)), searchPattern);
                
                predicates.add(cb.or(namePredicate, deptPredicate, typePredicate));
            }

            // Filter by Status
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Filter by Type
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            // Date Range
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt").as(LocalDate.class), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt").as(LocalDate.class), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
