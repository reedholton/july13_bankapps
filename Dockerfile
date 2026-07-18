# Step 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Step 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# EXPOSE is documentation only - Render (and most hosts) inject the real port to bind
# to via the PORT environment variable at runtime, which application.properties reads.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
