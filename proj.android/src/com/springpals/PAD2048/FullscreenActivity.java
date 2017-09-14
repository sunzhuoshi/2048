package com.springpals.PAD2048;

import android.app.ActionBar;
import android.webkit.WebView;

import com.flurry.android.FlurryAgent;
import com.springpals.PAD2048.util.SystemUiHider;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 *
 * @see SystemUiHider
 */
public class FullscreenActivity extends Activity {
    /**
     * The flags to pass to {@link SystemUiHider#getInstance}.
     */
    private static final int HIDER_FLAGS = SystemUiHider.FLAG_HIDE_NAVIGATION;

    /**
     * The instance of the {@link SystemUiHider} for this activity.
     */
    private SystemUiHider mSystemUiHider;

    @SuppressLint("SetJavaScriptEnabled")
	@Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_fullscreen);
        ActionBar actionBar = getActionBar();
        actionBar.hide();
        
        WebView contentView = (WebView) findViewById(R.id.webview);
        contentView.getSettings().setJavaScriptEnabled(true);
        contentView.loadUrl("file:///android_asset/index-Android.html");

        // Set up an instance of SystemUiHider to control the system UI for
        // this activity.
        mSystemUiHider = SystemUiHider.getInstance(this, contentView, HIDER_FLAGS);
        mSystemUiHider.setup();
        mSystemUiHider.hide();
    }
    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);        
    }
    @Override
    protected void onStart() {
    	super.onStart();
    	FlurryAgent.onStartSession(this, "GVX322WGS5ZGHST29WD9");
    }
    @Override
    protected void onStop() {
    	super.onStop();
    	FlurryAgent.onEndSession(this);    	
    }
}
