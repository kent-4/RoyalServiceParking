package com.appdev.set;

import com.appdev.set.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkingManagementApplication extends SpringBootServletInitializer {
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ParkingManagementApplication.class);
    }
    
    public static void main(String[] args) {
        SpringApplication.run(ParkingManagementApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner initData() {
        return args -> {
            try {
                // Initialize parking slots
                parkingSlotService.initializeParkingSlots();
                System.out.println("Parking slots initialized successfully");
            } catch (Exception e) {
                System.err.println("Error initializing parking slots: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}