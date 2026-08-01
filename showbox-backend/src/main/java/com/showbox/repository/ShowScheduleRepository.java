package com.showbox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.showbox.model.ShowSchedule;
import java.time.LocalDateTime;

@Repository
public interface ShowScheduleRepository extends JpaRepository<ShowSchedule, Long> {
    
    // Ye query check karegi ki kya same theatre mein us time par koi aur show chal raha hai
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM ShowSchedule s WHERE s.theatreId = :theatreId AND s.showTime < :endTime AND s.endTime > :showTime")
    boolean hasTimeConflict(@Param("theatreId") Long theatreId, @Param("showTime") LocalDateTime showTime, @Param("endTime") LocalDateTime endTime);
}