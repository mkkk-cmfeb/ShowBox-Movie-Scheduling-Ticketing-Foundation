package com.showbox;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling; // Import this

@SpringBootApplication
@EnableScheduling // Add this to activate the 60-second background job
@EnableAsync // Lets @Async methods (like sending ticket emails) run in the background
public class ShowboxApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShowboxApplication.class, args);
    }

}