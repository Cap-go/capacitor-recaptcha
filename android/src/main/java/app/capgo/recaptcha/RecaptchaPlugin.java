package app.capgo.recaptcha;

import android.app.Application;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Recaptcha")
public class RecaptchaPlugin extends Plugin {

    private final Recaptcha implementation = new Recaptcha();

    @PluginMethod
    public void load(PluginCall call) {
        String siteKey = resolveSiteKey(call);
        if (isBlank(siteKey)) {
            call.reject("siteKey is required. Pass siteKey/androidSiteKey or set Recaptcha.androidSiteKey/siteKey in Capacitor config.");
            return;
        }

        implementation.load(
            getApplication(),
            siteKey,
            new Recaptcha.LoadCallback() {
                @Override
                public void onSuccess() {
                    call.resolve(loadResult(siteKey));
                }

                @Override
                public void onFailure(Exception error) {
                    call.reject("Failed to load reCAPTCHA.", "LOAD_FAILED", error);
                }
            }
        );
    }

    @PluginMethod
    public void execute(PluginCall call) {
        String siteKey = resolveSiteKey(call);
        if (isBlank(siteKey)) {
            call.reject("siteKey is required. Pass siteKey/androidSiteKey or set Recaptcha.androidSiteKey/siteKey in Capacitor config.");
            return;
        }

        String action = call.getString("action");
        if (isBlank(action)) {
            call.reject("action is required.");
            return;
        }

        Long timeout = call.getLong("timeout");

        implementation.execute(
            getApplication(),
            siteKey,
            action,
            timeout,
            new Recaptcha.ExecuteCallback() {
                @Override
                public void onSuccess(String token) {
                    JSObject ret = executionResult(token, action.trim(), siteKey);
                    call.resolve(ret);
                }

                @Override
                public void onFailure(Exception error) {
                    call.reject(Recaptcha.errorMessage(error), "EXECUTE_FAILED", error);
                }
            }
        );
    }

    @PluginMethod
    public void getPluginVersion(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("version", implementation.getPluginVersion());
        call.resolve(ret);
    }

    private Application getApplication() {
        return (Application) getContext().getApplicationContext();
    }

    private JSObject loadResult(String siteKey) {
        JSObject ret = new JSObject();
        ret.put("loaded", true);
        ret.put("siteKey", siteKey);
        ret.put("enterprise", true);
        ret.put("platform", "android");
        return ret;
    }

    private JSObject executionResult(String token, String action, String siteKey) {
        JSObject ret = new JSObject();
        ret.put("token", token);
        ret.put("action", action);
        ret.put("siteKey", siteKey);
        ret.put("enterprise", true);
        ret.put("platform", "android");
        return ret;
    }

    private String resolveSiteKey(PluginCall call) {
        return firstNonBlank(
            call.getString("androidSiteKey"),
            call.getString("siteKey"),
            call.getString("sitekeyAndroid"),
            getConfig().getString("androidSiteKey"),
            getConfig().getString("siteKey")
        );
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
