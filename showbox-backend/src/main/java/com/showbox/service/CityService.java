package com.showbox.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.showbox.model.City;
import com.showbox.repository.CityRepository;

@Service
public class CityService {

    @Autowired
    private CityRepository cityRepository;

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public City addCity(City city) {
        if (cityRepository.existsByNameIgnoreCase(city.getName())) {
            throw new IllegalArgumentException("City already exists");
        }
        return cityRepository.save(city);
    }
}