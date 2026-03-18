# ======================
# STAGE 1: BUILD (Phải dùng Java 17 để đồng bộ)
# ======================
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ======================
# STAGE 2: RUNTIME (Dùng bản nhẹ bạn muốn)
# ======================
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# LƯU Ý: Phải lấy file từ stage 'build' ở trên qua
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]