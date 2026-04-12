package com.appdev.set.config;

import com.appdev.set.service.BookingService;
import com.appdev.set.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class ScheduledTasks {

    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private UserService userService;
    
    // Run every minute to check for expired bookings (more responsive)
    @Scheduled(fixedRate = 60000)
    public void checkExpiredBookings() {
        System.out.println("Running scheduled task: checkExpiredBookings");
        bookingService.checkAndExpireBookings();
    }
    
    // Run every hour to update blocklist status
    @Scheduled(cron = "0 0 * * * ?")
    public void updateBlocklistStatus() {
        System.out.println("Running scheduled task: updateBlocklistStatus");
        userService.updateBlocklistStatus();
    }
}
