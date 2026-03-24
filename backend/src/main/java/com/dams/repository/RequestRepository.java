package com.dams.repository;

import com.dams.entity.Request;
import com.dams.entity.RequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long>, JpaSpecificationExecutor<Request> {

    List<Request> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    @EntityGraph(attributePaths = { "employee" })
    Page<Request> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "employee" })
    Page<Request> findAllByType(RequestType type, Pageable pageable);

    @EntityGraph(attributePaths = { "employee" })
    Page<Request> findAllByStatus(Request.Status status, Pageable pageable);

    @EntityGraph(attributePaths = { "employee" })
    Page<Request> findAllByTypeAndStatus(RequestType type, Request.Status status, Pageable pageable);

    long countByStatus(Request.Status status);

    long countByEmployeeId(Long employeeId);

    long countByEmployeeIdAndStatus(Long employeeId, Request.Status status);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600) " +
            "FROM requests WHERE status = 'APPROVED' AND approved_at IS NOT NULL", nativeQuery = true)
    Double findAverageApprovalTimeInHours();

    @Query("SELECT r.status, COUNT(r) FROM Request r GROUP BY r.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT r.type, COUNT(r) FROM Request r GROUP BY r.type")
    List<Object[]> countByTypeGrouped();

    @Query("SELECT r.employee.name, COUNT(r), SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END), SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END), SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) FROM Request r GROUP BY r.employee.id, r.employee.name ORDER BY COUNT(r) DESC")
    List<Object[]> findEmployeePerformanceStats();

    @Query("SELECT r.employee.name, COUNT(r) FROM Request r WHERE r.status = 'APPROVED' GROUP BY r.employee.id, r.employee.name ORDER BY COUNT(r) DESC")
    List<Object[]> findTopEmployeesByApprovedRequests(Pageable pageable);

    // Monthly trend: [month_number (1-12), count] for a given year
    @Query(value = "SELECT EXTRACT(MONTH FROM created_at) AS month, COUNT(*) AS cnt " +
            "FROM requests WHERE EXTRACT(YEAR FROM created_at) = :year " +
            "GROUP BY EXTRACT(MONTH FROM created_at) ORDER BY month", nativeQuery = true)
    List<Object[]> countMonthlyTrend(@org.springframework.data.repository.query.Param("year") int year);

    // Rejection rate by type: [type, total, rejected]
    @Query("SELECT r.type, COUNT(r), SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END) FROM Request r GROUP BY r.type")
    List<Object[]> countRejectionByType();

    // Pending requests (for aging calculation)
    @Query("SELECT r FROM Request r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Request> findAllPending();

    @Query("SELECT r FROM Request r " +
           "WHERE (r.type = 'LEAVE' OR r.type = 'OD_REQUEST') " +
           "AND ((r.startDate IS NOT NULL AND r.endDate IS NOT NULL AND r.startDate <= CAST(:endOfMonth AS date) AND r.endDate >= CAST(:startOfMonth AS date)) " +
           "     OR (r.odDate IS NOT NULL AND r.odDate >= CAST(:startOfMonth AS date) AND r.odDate <= CAST(:endOfMonth AS date)))")
    List<Request> findCalendarRequests(@org.springframework.data.repository.query.Param("startOfMonth") java.time.LocalDate startOfMonth,
                                       @org.springframework.data.repository.query.Param("endOfMonth") java.time.LocalDate endOfMonth);

    @Query("SELECT r FROM Request r " +
           "WHERE r.status = 'APPROVED' AND (r.type = 'LEAVE' OR r.type = 'OD_REQUEST') " +
           "AND ((r.startDate <= :today AND r.endDate >= :today) OR r.odDate = :today)")
    List<Request> findApprovedRequestsByDate(@org.springframework.data.repository.query.Param("today") java.time.LocalDate today);

    @Query("SELECT r FROM Request r " +
           "WHERE r.status = 'APPROVED' AND (r.type = 'LEAVE' OR r.type = 'OD_REQUEST') " +
           "AND ((r.startDate > :today AND r.startDate <= :endDate) OR (r.odDate > :today AND r.odDate <= :endDate)) " +
           "ORDER BY COALESCE(r.startDate, r.odDate) ASC")
    List<Request> findUpcomingApprovedRequests(@org.springframework.data.repository.query.Param("today") java.time.LocalDate today,
                                               @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
