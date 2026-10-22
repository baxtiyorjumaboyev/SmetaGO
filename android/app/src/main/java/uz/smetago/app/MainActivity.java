package uz.smetago.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * SmetaGo oflayn ilova: assets/index.html (offline/SmetaGo.html) WebView'da ochiladi.
 * Server yo'q — smetalar WebView xotirasida (localStorage), Excel ham shu yerda yasaladi.
 * Sahifa https://appassets.androidplatform.net manzilidan beriladi: xotira doimiy va xavfsiz manbaga bog'lanadi.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/index.html";
    private static final int PICK_FILE = 1;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage — smetalar shu yerda saqlanadi
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;   // tashqi havolalar ilova ichida ochilmaydi
            }
        });

        // "Zaxiradan tiklash": telefondan .json fayl tanlash
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(pick, null), PICK_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        web.addJavascriptInterface(new Bridge(), "SmetaGoAndroid");

        if (state != null) web.restoreState(state);
        else web.loadUrl(START);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    /** "Orqaga": oyna ochiq bo'lsa yopiladi, smetadan ro'yxatga qaytiladi, ro'yxatda — ilovadan chiqiladi. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.smetagoBack && window.smetagoBack()) ? 'yes' : 'no'", value -> {
            if (!"\"yes\"".equals(value)) finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /** JavaScript → Android: faylni "Download/SmetaGo" ga saqlash va ulashish oynasini ochish. */
    private class Bridge {
        @JavascriptInterface
        public String saveFile(String name, String base64, String mime) {
            String safe = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_");
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            String savedTo = "";
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                    v.put(MediaStore.Downloads.MIME_TYPE, mime);
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/SmetaGo");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (u != null) {
                        try (OutputStream o = getContentResolver().openOutputStream(u)) { o.write(data); }
                        savedTo = "Download/SmetaGo/" + safe;
                    }
                }
            } catch (Exception ignored) { }
            try {
                File dir = new File(getCacheDir(), "export");
                dir.mkdirs();
                File f = new File(dir, safe);
                try (FileOutputStream o = new FileOutputStream(f)) { o.write(data); }
                Uri uri = FileProvider.getUriForFile(MainActivity.this, "uz.smetago.app.files", f);
                Intent send = new Intent(Intent.ACTION_SEND)
                        .setType(mime)
                        .putExtra(Intent.EXTRA_STREAM, uri)
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                runOnUiThread(() -> {
                    try { startActivity(Intent.createChooser(send, safe)); } catch (Exception ignored) { }
                });
            } catch (Exception ignored) { }
            return savedTo;
        }
    }
}
