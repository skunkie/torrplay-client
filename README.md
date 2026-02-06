# TorrPlay-Client

TorrPlay-Client is a web-based torrent client that allows you to manage and stream torrents directly in your browser.

## Backend Dependency

This is the web frontend for TorrPlay. It requires the TorrPlay backend to be running. You can find the backend repository and setup instructions here:

[https://github.com/skunkie/torrplay.git](https://github.com/skunkie/torrplay.git)

By default, this frontend will attempt to connect to the backend at `http://localhost:8090`. You can change this in the application's settings.

## Building the Application

To build the application, you need to have Node.js and pnpm installed. Follow these steps:

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Build the application:**

    ```bash
    pnpm build
    ```

## Running the Application

To run the application, use the following command:

```bash
pnpm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## How to Use

1.  Open the application in your web browser.
2.  Add a torrent by providing a magnet link, an info hash or uploading a torrent file.
3.  Once the torrent is added, you can view its contents and stream them directly in the browser.
