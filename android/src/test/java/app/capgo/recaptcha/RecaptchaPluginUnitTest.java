package app.capgo.recaptcha;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;

public class RecaptchaPluginUnitTest {

    @Test
    public void testLongOptionFromCallCoercesIntegerBridgeValue() throws JSONException {
        JSObject data = new JSObject();
        data.put("timeout", 10_000);

        PluginCall call = new PluginCall(null, "Recaptcha", "test-callback", "execute", data);

        assertEquals(
            "JS numbers within Integer range must be read as timeout",
            Long.valueOf(10_000L),
            RecaptchaPlugin.longOptionFromCall(call, "timeout")
        );
        assertNull("PluginCall.getLong misses Integer bridge values", call.getLong("timeout"));
    }

    @Test
    public void testLongOptionFromCallReturnsNullWhenMissing() {
        PluginCall call = new PluginCall(null, "Recaptcha", "test-callback", "execute", new JSObject());

        assertNull(RecaptchaPlugin.longOptionFromCall(call, "timeout"));
    }

    @Test
    public void testLongOptionFromCallReturnsNullForExplicitNull() throws JSONException {
        JSObject data = new JSObject();
        data.put("timeout", JSONObject.NULL);

        PluginCall call = new PluginCall(null, "Recaptcha", "test-callback", "execute", data);

        assertNull(RecaptchaPlugin.longOptionFromCall(call, "timeout"));
    }

    @Test
    public void testLongOptionFromCallReturnsNullForNonNumericValue() throws JSONException {
        JSObject data = new JSObject();
        data.put("timeout", "not-a-number");

        PluginCall call = new PluginCall(null, "Recaptcha", "test-callback", "execute", data);

        assertNull(RecaptchaPlugin.longOptionFromCall(call, "timeout"));
    }
}
