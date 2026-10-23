package com.odsela.game;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Od Sela do Superlige runs as a single HTML file inside a full-screen WebView.
 * Saves live in the WebView's localStorage on the phone, so they persist between launches.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        int paper = getResources().getColor(R.color.paper, getTheme());
        web = new WebView(this);
        web.setBackgroundColor(paper);
        // Android 15 and later draw apps under the status and navigation bars. The game keeps clear of them
        // (and of the keyboard and camera cut-out) by sitting inside a frame padded by their size.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(paper);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            // The same edge-to-edge layout on every version, so the padding below is always right.
            getWindow().setDecorFitsSystemWindows(false);
            if (Build.VERSION.SDK_INT < 35) {
                getWindow().setStatusBarColor(Color.TRANSPARENT);
                getWindow().setNavigationBarColor(Color.TRANSPARENT);
            }
            root.setOnApplyWindowInsetsListener((View v, WindowInsets in) -> {
                android.graphics.Insets i = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime() | WindowInsets.Type.displayCutout());
                v.setPadding(i.left, i.top, i.right, i.bottom);
                return WindowInsets.CONSUMED;
            });
        } else {
            root.setFitsSystemWindows(true);
        }
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        }

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage: the career, settings, legacy points
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);            // the game is loaded from the app's own files
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setTextZoom(100);                    // the game has its own text-size setting

        web.addJavascriptInterface(new Bridge(this), "OdSelaAndroid");

        web.setWebViewClient(new WebViewClient() {
            // Open any outside link (none are used today) in the phone's browser, not inside the game.
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if ("file".equals(u.getScheme())) return false;
                startActivity(new Intent(Intent.ACTION_VIEW, u));
                return true;
            }
        });

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl("file:///android_asset/index.html");
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    /** Back closes pop-ups, then returns to the home tab, and only then leaves the app (kept in the background). */
    private void goBack() {
        web.evaluateJavascript("(window.odselaBack && window.odselaBack()) || 'exit'", result -> {
            if (result != null && result.contains("exit")) moveTaskToBack(true);
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        goBack();   // Android 12 and older
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    /** Lets the game ask the phone to vibrate; the WebView itself ignores navigator.vibrate. */
    static class Bridge {
        private final Context ctx;

        Bridge(Context ctx) {
            this.ctx = ctx.getApplicationContext();
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            int d = Math.max(5, Math.min(ms, 200));
            if (Build.VERSION.SDK_INT >= 26) {
                v.vibrate(VibrationEffect.createOneShot(d, VibrationEffect.DEFAULT_AMPLITUDE));
            }
        }
    }
}
