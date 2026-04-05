# manage_appointments

## Description
Handles the full lifecycle of appointments.

## Input
```json
{
  "action": "create | update | cancel | change_status",
  "appointmentId": "string",
  "clientId": "string",
  "vehicleId": "string",
  "serviceId": "string",
  "datetime": "ISO",
  "status": "pending | confirmed | in_progress | completed | canceled"
}
```

## Output
```json
{
  "success": true,
  "appointment": {}
}
```
