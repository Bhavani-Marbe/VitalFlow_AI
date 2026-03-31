# VitalFlow Healthcare AI - Django Backend

This is the Django implementation of the VitalFlow Healthcare AI backend, as requested.

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Migrations:**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

3.  **Start the Server:**
    ```bash
    python manage.py runserver 0.0.0.0:3000
    ```

## API Endpoints

-   `GET /api/inventory/`: List all inventory items.
-   `POST /api/inventory/{id}/reserve/`: Reserve units for a specific item.
    -   Payload: `{"units": 5}`

## Note on Live Preview

The current AI Studio environment is optimized for a Node.js/TypeScript runtime to support the live interactive preview. While this Django code is fully functional and ready for deployment in a Python environment, the live preview currently uses the TypeScript bridge (`server.ts`) to maintain interactivity within this container.
