package com.aulaviva.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AulavivaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AulavivaApiApplication.class, args);
    }
}
