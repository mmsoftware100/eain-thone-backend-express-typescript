# API Documentation

This directory contains the OpenAPI 3.0 specification for the Items API.

## Files

- `openapi.yaml` - OpenAPI specification in YAML format
- `openapi.json` - OpenAPI specification in JSON format (recommended for Postman)
- `README.md` - This documentation file

## API Overview

The Items API provides CRUD operations for managing items. Each item has:
- `id` (number): Unique identifier (timestamp-based)
- `name` (string): Item name

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| POST | `/api/items` | Create a new item |
| GET | `/api/items/{id}` | Get item by ID |
| PUT | `/api/items/{id}` | Update an item |
| DELETE | `/api/items/{id}` | Delete an item |

## Importing to Postman

### Method 1: Import from File
1. Open Postman
2. Click "Import" button
3. Select "File" tab
4. Choose `openapi.json` from this directory
5. Click "Import"

### Method 2: Import from URL (if hosted)
1. Open Postman
2. Click "Import" button
3. Select "Link" tab
4. Enter the URL to your `openapi.json` file
5. Click "Continue" and then "Import"

### Method 3: Copy and Paste
1. Open Postman
2. Click "Import" button
3. Select "Raw text" tab
4. Copy the contents of `openapi.json` and paste it
5. Click "Continue" and then "Import"

## Testing the API

After importing to Postman, you can:

1. **Test GET /api/items**: Should return an empty array `[]` initially
2. **Test POST /api/items**: Create a new item with JSON body `{"name": "Test Item"}`
3. **Test GET /api/items/{id}**: Use the ID from the created item
4. **Test PUT /api/items/{id}**: Update the item with new name
5. **Test DELETE /api/items/{id}**: Delete the item

## Server Configuration

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Port**: 3000 (configurable via environment variables)

## Example Requests

### Create Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Item"}'
```

### Get All Items
```bash
curl http://localhost:3000/api/items
```

### Get Item by ID
```bash
curl http://localhost:3000/api/items/1672531200000
```

### Update Item
```bash
curl -X PUT http://localhost:3000/api/items/1672531200000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item Name"}'
```

### Delete Item
```bash
curl -X DELETE http://localhost:3000/api/items/1672531200000
```

## Response Formats

### Success Responses
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations

### Error Responses
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Item not found
- **500 Internal Server Error**: Server error

All error responses include a JSON object with a `message` field describing the error.

## Development

Make sure your server is running on `http://localhost:3000` before testing the API endpoints.

```bash
npm run dev
```

The server should display: "Server running on port 3000"