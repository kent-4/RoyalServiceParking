package com.appdev.set.model;

import java.time.LocalDate;

public class BookingSummary {
    private LocalDate date;
    private long totalBookings;
    private double totalEarnings;
    private long completedBookings;
    private long canceledBookings;
    private long noShowBookings;

    public BookingSummary(LocalDate date, long totalBookings, double totalEarnings, 
                         long completedBookings, long canceledBookings, long noShowBookings) {
        this.date = date;
        this.totalBookings = totalBookings;
        this.totalEarnings = totalEarnings;
        this.completedBookings = completedBookings;
        this.canceledBookings = canceledBookings;
        this.noShowBookings = noShowBookings;
    }

    // Getters
    public LocalDate getDate() {
        return date;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public double getTotalEarnings() {
        return totalEarnings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public long getCanceledBookings() {
        return canceledBookings;
    }

    public long getNoShowBookings() {
        return noShowBookings;
    }
} 