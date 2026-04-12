package com.appdev.set.repository;

import com.appdev.set.model.Booking;
import com.appdev.set.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByStatus(String status);
    List<Booking> findByLevelAndSlotNameAndDateAndStatus(String level, String slotName, LocalDate date, String status);
    List<Booking> findByLevelAndDateAndStatus(String level, LocalDate date, String status);
    List<Booking> findByDateAndStatus(LocalDate date, String status);
    long countByStatus(String status);
    
    // Basic queries
    List<Booking> findByDate(LocalDate date);
    List<Booking> findByLevelAndDate(String level, LocalDate date);
    List<Booking> findBySlotNameAndDate(String slotName, LocalDate date);
    
    // New queries for auto-expiry and blocklist functionality
    List<Booking> findByStatusAndDateAndStartTimeBefore(String status, LocalDate date, java.time.LocalTime time);
    List<Booking> findByUserAndAutoExpiredTrue(User user);
    
    // Find bookings by status list
    List<Booking> findByStatusIn(List<String> statuses);
    
    // Find active bookings by user
    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.status IN :statuses")
    List<Booking> findByUserAndStatusIn(@Param("user") User user, @Param("statuses") List<String> statuses);
    
    // Find active bookings by level and slotName
    @Query("SELECT b FROM Booking b WHERE b.level = :level AND b.slotName = :slotName AND b.status IN :statuses")
    List<Booking> findByLevelAndSlotNameAndStatusIn(
        @Param("level") String level, 
        @Param("slotName") String slotName, 
        @Param("statuses") List<String> statuses
    );
    
    // Find bookings by level, date and status list
    @Query("SELECT b FROM Booking b WHERE b.level = :level AND b.date = :date AND b.status IN :statuses")
    List<Booking> findByLevelAndDateAndStatusIn(
        @Param("level") String level,
        @Param("date") LocalDate date,
        @Param("statuses") List<String> statuses
    );
    
    // Find bookings by level, slot name, date and status list
    @Query("SELECT b FROM Booking b WHERE b.level = :level AND b.slotName = :slotName AND b.date = :date AND b.status IN :statuses")
    List<Booking> findByLevelAndSlotNameAndDateAndStatusIn(
        @Param("level") String level,
        @Param("slotName") String slotName,
        @Param("date") LocalDate date,
        @Param("statuses") List<String> statuses
    );
    
    // New methods for reports
    List<Booking> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Booking> findByDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, String status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.date BETWEEN :startDate AND :endDate")
    long countBookingsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(b.parkingCost) FROM Booking b WHERE b.date BETWEEN :startDate AND :endDate AND b.status = 'COMPLETED'")
    Double sumRevenueBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b.level, COUNT(b) FROM Booking b WHERE b.date BETWEEN :startDate AND :endDate GROUP BY b.level ORDER BY COUNT(b) DESC")
    List<Object[]> findMostPopularLevelsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b.level, b.slotName, COUNT(b) FROM Booking b WHERE b.date BETWEEN :startDate AND :endDate GROUP BY b.level, b.slotName ORDER BY COUNT(b) DESC")
    List<Object[]> findMostPopularSlotsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find expired bookings (including past dates)
    @Query("SELECT b FROM Booking b WHERE b.status = 'RESERVED' AND NOT b.autoExpired AND " +
           "((b.date = :today AND b.startTime < :cutoffTime) OR " +
           "(b.date < :today)) AND " +
           "NOT b.arrived")
    List<Booking> findExpiredBookings(
        @Param("today") LocalDate today,
        @Param("cutoffTime") LocalTime cutoffTime
    );
}
