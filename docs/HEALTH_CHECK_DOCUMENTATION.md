# Health Check Documentation

## Overview

This project implements a comprehensive health check system with configurable timeout behavior to ensure application availability and reliable deployment verification.

## Health Check Configuration

### Timeout Settings

- **Timeout Duration**: 2 minutes (120 seconds)
- **Monitored Endpoints**:
  - `http://localhost:3000/api/health` (Backend API)
  - `http://localhost:4200` (Frontend Application)

### Configuration Location

The health check timeout is configured in `package.json`:

```json
{
  "scripts": {
    "pm2-full:dev:start": "wait-on --timeout 120000 http://localhost:3000/api/health http://localhost:4200 && echo 'All services are healthy'",
    "pm2-full:prod:start": "wait-on --timeout 120000 http://localhost:3000/api/health http://localhost:4200 && echo 'All services are healthy'"
  }
}
```

## Health Check Behavior

### Success Scenario

1. **Service Startup**: PM2 starts the backend and frontend services
2. **Health Check Initiation**: `wait-on` begins monitoring the specified endpoints
3. **Endpoint Verification**: Both endpoints are checked for HTTP 200 responses
4. **Success Confirmation**: If both endpoints respond within 2 minutes, the health check passes
5. **Deployment Completion**: The system logs "All services are healthy" and continues

### Failure Scenario

1. **Timeout Trigger**: If either endpoint doesn't respond within 2 minutes (120 seconds)
2. **Process Termination**: The startup process fails with an error
3. **Error Reporting**: Clear error messages indicate which endpoint(s) failed
4. **Deployment Halt**: The deployment process stops to prevent broken deployments

## Implementation Details

### Backend Health Endpoint (`/api/health`)

- **Purpose**: Verifies backend service availability
- **Response Format**: HTTP 200 with health status
- **Dependencies Checked**: Database connectivity, external services
- **Location**: Implemented in NestJS server

### Frontend Health Check (`http://localhost:4200`)

- **Purpose**: Verifies frontend application availability
- **Response Format**: HTTP 200 with application served
- **Dependencies Checked**: Build completion, asset availability
- **Location**: Angular development/production server

## Development vs Production

### Development Mode (`pm2-full:dev:start`)

- **Port Configuration**: Frontend on 4200, Backend on 3000
- **Hot Reload**: Angular development server with live reloading
- **Debug Features**: Enhanced logging and debugging capabilities

### Production Mode (`pm2-full:prod:start`)

- **Port Configuration**: Combined serving on port 3000
- **Optimized Build**: Minified and optimized assets
- **Process Management**: PM2 clustering for high availability

## Troubleshooting

### Common Issues

1. **Slow Database Startup**

   - **Symptom**: Backend health check timeout
   - **Solution**: Ensure database is running and accessible
   - **Prevention**: Add database health checks to startup sequence

2. **Build Process Delays**

   - **Symptom**: Frontend health check timeout
   - **Solution**: Optimize build process, increase timeout if necessary
   - **Prevention**: Pre-build assets in CI/CD pipeline

3. **Port Conflicts**
   - **Symptom**: Connection refused errors
   - **Solution**: Verify ports 3000 and 4200 are available
   - **Prevention**: Use dynamic port allocation in containerized environments

### Monitoring Commands

```bash
# Check service status
npm run pm2-full:dev:status

# View logs
npm run pm2-full:dev:logs

# Stop services
npm run pm2-full:dev:stop

# Restart with health checks
npm run pm2-full:dev:restart
```

## Best Practices

### Health Check Design

1. **Fast Response**: Health endpoints should respond quickly (< 1 second)
2. **Dependency Verification**: Check critical dependencies (database, external APIs)
3. **Graceful Degradation**: Distinguish between critical and non-critical failures
4. **Consistent Format**: Use standardized health check response format

### Timeout Configuration

1. **Environment-Specific**: Different timeouts for dev/staging/production
2. **Service Dependencies**: Consider startup time of dependent services
3. **Network Conditions**: Account for network latency in distributed environments
4. **Monitoring Integration**: Integrate with application monitoring systems

## Security Considerations

### Health Endpoint Security

- **Authentication**: Health endpoints should be accessible without authentication
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Information Disclosure**: Avoid exposing sensitive system information
- **Network Access**: Restrict access to internal networks when possible

## Monitoring and Alerting

### Recommended Monitoring

1. **Uptime Monitoring**: External monitoring of health endpoints
2. **Response Time Tracking**: Monitor health check response times
3. **Failure Rate Analysis**: Track health check failure patterns
4. **Dependency Monitoring**: Monitor upstream service health

### Alert Configuration

- **Immediate Alerts**: Critical service failures
- **Trend Alerts**: Increasing response times or failure rates
- **Capacity Alerts**: Resource utilization thresholds
- **Recovery Notifications**: Service restoration confirmations

## Integration with CI/CD

### Pipeline Integration

```yaml
# Example CI/CD integration
deploy:
  script:
    - npm run build
    - npm run pm2-full:prod:start
    - npm run health-check-verification
  timeout: 5m
  retry: 2
```

### Deployment Verification

1. **Pre-deployment**: Verify previous version health
2. **Deployment**: Execute with health checks
3. **Post-deployment**: Verify new version health
4. **Rollback**: Automatic rollback on health check failure

This documentation provides comprehensive guidance for understanding, implementing, and maintaining the health check system in the site15.ru project.
