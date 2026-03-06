package com.github.skunkie.torrplayclient;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import torrplay.App;
import torrplay.Torrplay;

public class TorrPlayService extends Service {
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "torrplay_channel";

    private App torrplayApp;
    private WifiManager.MulticastLock multicastLock;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("TorrPlayService", "Service onCreate");
        createNotificationChannel();

        // Initialize the Go application
        try {
            String dataDir = getFilesDir().getAbsolutePath();
            Log.i("TorrPlayService", "Initializing TorrPlay with data directory: " + dataDir);
            torrplayApp = Torrplay.new_(dataDir);
        } catch (Exception e) {
            Log.e("TorrPlayService", "Failed to initialize TorrPlay app", e);
            torrplayApp = null; // Ensure app is null on failure
        }

        // Acquire a WakeLock to keep the CPU running
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "TorrPlayClient::WakeLock");
            wakeLock.acquire();
        }

        // Acquire a MulticastLock to allow the device to receive multicast packets
        WifiManager wifi = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (wifi != null) {
            multicastLock = wifi.createMulticastLock("multicastLock");
            multicastLock.setReferenceCounted(true);
            multicastLock.acquire();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i("TorrPlayService", "Service onStartCommand");

        if (torrplayApp == null) {
            Log.e("TorrPlayService", "TorrPlay app not initialized. Stopping service.");
            stopSelf();
            return START_NOT_STICKY;
        }

        startForeground(NOTIFICATION_ID, getNotification());

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i("TorrPlayService", "Starting TorrPlay app");
                    torrplayApp.start(); // This is a blocking call
                    Log.i("TorrPlayService", "TorrPlay app has stopped.");
                } catch (Exception e) {
                    Log.e("TorrPlayService", "TorrPlay app crashed", e);
                }
            }
        }).start();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.e("TorrPlayService", "Service onDestroy. The service is being killed! Stopping app and scheduling restart...");

        // Stop the Go application
        if (torrplayApp != null) {
            try {
                torrplayApp.stop();
                Log.i("TorrPlayService", "TorrPlay app stopped successfully.");
            } catch (Exception e) {
                Log.e("TorrPlayService", "Failed to stop TorrPlay app", e);
            }
        }

        // Release the locks
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }
        if (multicastLock != null) {
            multicastLock.release();
            multicastLock = null;
        }

        // Send a broadcast to the Restarter
        Intent broadcastIntent = new Intent(this, Restarter.class);
        broadcastIntent.setAction(Restarter.ACTION_RESTART_SERVICE);
        this.sendBroadcast(broadcastIntent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }

    private Notification getNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Torrplay Service")
                .setContentText("Running in background")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_LOW);

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "TorrPlay Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
