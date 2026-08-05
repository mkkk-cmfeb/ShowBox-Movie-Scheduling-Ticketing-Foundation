package com.showbox.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.showbox.model.ShowSchedule;
import com.showbox.repository.ShowScheduleRepository;

@Service
public class ShowScheduleService {

    @Autowired
    private ShowScheduleRepository showScheduleRepository;

    public List<ShowSchedule> getAllSchedules() {
        return showScheduleRepository.findAll();
    }

    public ShowSchedule addSchedule(ShowSchedule schedule) {
        if (showScheduleRepository.hasTimeConflict(schedule.getTheatreId(), schedule.getShowTime(), schedule.getEndTime())) {
            throw new IllegalArgumentException("Time conflict: theatre already has a show at this time");
        }
        return showScheduleRepository.save(schedule);
    }
}