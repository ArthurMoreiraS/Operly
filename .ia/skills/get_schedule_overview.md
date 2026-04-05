# get_schedule_overview

## Description
Returns schedule overview by period.

## Input
```json
{
  "view": "day | week | month",
  "date": "ISO"
}
```

## Output
```json
{
  "appointments": [],
  "summary": {
    "pending": 0,
    "confirmed": 0,
    "completed": 0
  }
}
```
