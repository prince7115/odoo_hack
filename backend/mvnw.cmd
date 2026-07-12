@REM Maven Wrapper Script for Windows
@REM Downloads and runs Maven if not already available

@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "WRAPPER_PROPERTIES=%SCRIPT_DIR%.mvn\wrapper\maven-wrapper.properties"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists"

@REM Read distribution URL from properties
set "DIST_URL="
if exist "%WRAPPER_PROPERTIES%" (
    for /f "tokens=1,* delims==" %%a in ('findstr "distributionUrl" "%WRAPPER_PROPERTIES%"') do (
        set "DIST_URL=%%b"
    )
)

@REM Default URL
if "%DIST_URL%"=="" set "DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

set "MVN_VERSION=3.9.9"
set "MVN_DIR=%MAVEN_HOME%\apache-maven-%MVN_VERSION%"

@REM Download and extract if needed
if not exist "%MVN_DIR%\bin\mvn.cmd" (
    echo Downloading Maven %MVN_VERSION%...
    if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"
    set "TMP_FILE=%TEMP%\maven-%MVN_VERSION%.zip"
    powershell -Command "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%TMP_FILE%'"
    powershell -Command "Expand-Archive -Path '%TMP_FILE%' -DestinationPath '%MAVEN_HOME%' -Force"
    del /f /q "%TMP_FILE%" 2>nul
)

@REM Run Maven
"%MVN_DIR%\bin\mvn.cmd" %*
