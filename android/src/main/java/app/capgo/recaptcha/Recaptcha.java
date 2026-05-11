package app.capgo.recaptcha;

import android.app.Application;
import com.google.android.recaptcha.RecaptchaAction;
import com.google.android.recaptcha.RecaptchaException;
import com.google.android.recaptcha.RecaptchaTasksClient;

public class Recaptcha {

    public interface LoadCallback {
        void onSuccess();
        void onFailure(Exception error);
    }

    public interface ExecuteCallback {
        void onSuccess(String token);
        void onFailure(Exception error);
    }

    private RecaptchaTasksClient client;
    private String loadedSiteKey;

    public void load(Application application, String siteKey, LoadCallback callback) {
        if (client != null && siteKey.equals(loadedSiteKey)) {
            callback.onSuccess();
            return;
        }

        com.google.android.recaptcha.Recaptcha.fetchTaskClient(application, siteKey)
            .addOnSuccessListener((recaptchaTasksClient) -> {
                client = recaptchaTasksClient;
                loadedSiteKey = siteKey;
                callback.onSuccess();
            })
            .addOnFailureListener(callback::onFailure);
    }

    public void execute(Application application, String siteKey, String action, Long timeout, ExecuteCallback callback) {
        load(
            application,
            siteKey,
            new LoadCallback() {
                @Override
                public void onSuccess() {
                    executeLoadedClient(action, timeout, callback);
                }

                @Override
                public void onFailure(Exception error) {
                    callback.onFailure(error);
                }
            }
        );
    }

    public String getPluginVersion() {
        return "native";
    }

    public String getLoadedSiteKey() {
        return loadedSiteKey;
    }

    public static String errorMessage(Exception error) {
        if (error instanceof RecaptchaException) {
            RecaptchaException recaptchaError = (RecaptchaException) error;
            return recaptchaError.getErrorMessage();
        }

        String message = error.getMessage();
        return message == null || message.isEmpty() ? error.getClass().getSimpleName() : message;
    }

    private void executeLoadedClient(String action, Long timeout, ExecuteCallback callback) {
        if (client == null) {
            callback.onFailure(new IllegalStateException("reCAPTCHA client is not loaded."));
            return;
        }

        RecaptchaAction recaptchaAction = actionFromString(action);
        if (timeout == null) {
            client.executeTask(recaptchaAction).addOnSuccessListener(callback::onSuccess).addOnFailureListener(callback::onFailure);
            return;
        }

        long timeoutMs = Math.max(5000L, timeout);
        client.executeTask(recaptchaAction, timeoutMs).addOnSuccessListener(callback::onSuccess).addOnFailureListener(callback::onFailure);
    }

    private RecaptchaAction actionFromString(String action) {
        String normalized = action.trim().toLowerCase();
        switch (normalized) {
            case "login":
                return RecaptchaAction.LOGIN;
            case "signup":
            case "sign_up":
            case "sign-up":
                return RecaptchaAction.SIGNUP;
            default:
                return RecaptchaAction.custom(action.trim());
        }
    }
}
