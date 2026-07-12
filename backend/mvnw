#!/bin/sh
# Maven Wrapper Script for Unix-like systems
# Downloads and runs Maven if not already available

# Determine the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WRAPPER_JAR="$SCRIPT_DIR/.mvn/wrapper/maven-wrapper.jar"
WRAPPER_PROPERTIES="$SCRIPT_DIR/.mvn/wrapper/maven-wrapper.properties"
MAVEN_HOME="$HOME/.m2/wrapper/dists"

# Read properties
if [ -f "$WRAPPER_PROPERTIES" ]; then
    DIST_URL=$(grep "distributionUrl" "$WRAPPER_PROPERTIES" | cut -d'=' -f2-)
fi

# Default if not set
if [ -z "$DIST_URL" ]; then
    DIST_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
fi

# Extract version from URL
MVN_VERSION=$(echo "$DIST_URL" | grep -oP 'apache-maven-\K[0-9.]+')
MVN_DIR="$MAVEN_HOME/apache-maven-$MVN_VERSION"

# Download and extract if needed
if [ ! -d "$MVN_DIR" ]; then
    echo "Downloading Maven $MVN_VERSION..."
    mkdir -p "$MAVEN_HOME"
    TMP_FILE=$(mktemp)
    curl -fsSL "$DIST_URL" -o "$TMP_FILE"
    unzip -q "$TMP_FILE" -d "$MAVEN_HOME"
    rm -f "$TMP_FILE"
fi

# Run Maven
exec "$MVN_DIR/bin/mvn" "$@"
