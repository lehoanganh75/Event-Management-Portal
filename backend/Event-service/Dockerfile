# ======================
# BUILD STAGE
# ======================
FROM maven:3.9.9-amazoncorretto-17 AS build

WORKDIR /build

COPY pom.xml .

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests


# ======================
# RUNTIME STAGE
# ======================
FROM amazoncorretto:17

WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java","-jar","app.jar"]