package com.eventservice.repository.mongodb;

import com.eventservice.entity.mongodb.EventVector;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventVectorRepository extends MongoRepository<EventVector, String> {
}
