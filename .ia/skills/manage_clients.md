# manage_clients

## Description
CRUD operations for clients.

## Input
```json
{
  "action": "create | update | delete | get",
  "client": {
    "name": "string",
    "phone": "string",
    "email": "string",
    "status": "active | vip | inactive",
    "notes": "string"
  }
}
```
