# Build stage - use official Maven image with Eclipse Temurin 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline -DskipTests

COPY src ./src
RUN mvn -B package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app
USER app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
