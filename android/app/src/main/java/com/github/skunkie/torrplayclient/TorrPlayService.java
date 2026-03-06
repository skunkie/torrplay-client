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
import torrplay.Torrplay;

public class TorrPlayService extends Service {
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "torrplay_channel";

    private WifiManager.MulticastLock multicastLock;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("TorrPlayService", "Service onCreate");
        createNotificationChannel();

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
        startForeground(NOTIFICATION_ID, getNotification());

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String dataDir = getFilesDir().getAbsolutePath();
                    Log.i("TorrPlayService", "Starting TorrPlay service with data directory: " + dataDir);
                    Torrplay.run(dataDir); // This is a blocking call
                    Log.i("TorrPlayService", "TorrPlay service has stopped.");
                } catch (Exception e) {
                    Log.e("TorrPlayService", "TorrPlay service crashed", e);
                }
            }
        }).start();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.e("TorrPlayService", "Service onDestroy. The service is being killed!");
        // Release the WakeLock
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }

        // Release the MulticastLock
        if (multicastLock != null) {
            multicastLock.release();
            multicastLock = null;
        }
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
