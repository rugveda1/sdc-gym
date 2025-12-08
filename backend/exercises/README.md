# How to Add New Exercises

To add new exercises to the application, simply edit the `data.json` file in this folder.

## Format
Add a new object to the list with the following structure:

```json
{
  "id": "unique_id",
  "name": "Exercise Name",
  "muscle": "Target Muscle",
  "difficulty": "Beginner/Intermediate/Advanced",
  "instructions": "Step-by-step instructions."
}
```

## Example
```json
{
  "id": "4",
  "name": "Lunges",
  "muscle": "Legs",
  "difficulty": "Beginner",
  "instructions": "Step forward with one leg..."
}
```

The application will automatically load these changes when you refresh the page or restart the server.
