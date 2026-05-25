# ======================
# BUILD STAGE
# ======================
FROM maven:3.9.9-amazoncorretto-17 AS build

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# ======================
# RUNTIME STAGE
# ======================
FROM amazoncorretto:17

WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

ENV TZ=Asia/Ho_Chi_Minh

EXPOSE 8084

ENTRYPOINT ["java","-Duser.timezone=Asia/Ho_Chi_Minh","-jar","app.jar"]