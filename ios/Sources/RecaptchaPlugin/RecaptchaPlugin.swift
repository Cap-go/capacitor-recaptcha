import Foundation
import Capacitor
import RecaptchaEnterprise

@objc(RecaptchaPlugin)
public class RecaptchaPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RecaptchaPlugin"
    public let jsName = "Recaptcha"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "load", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "execute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = RecaptchaBridge()

    @objc func load(_ call: CAPPluginCall) {
        guard resolveEnterprise(call) else {
            rejectStandardNativeMode(call)
            return
        }

        guard let siteKey = resolveSiteKey(call) else {
            call.reject("siteKey is required. Pass siteKey/iosSiteKey or set Recaptcha.iosSiteKey/siteKey in Capacitor config.")
            return
        }

        Task {
            do {
                try await implementation.load(siteKey: siteKey)
                call.resolve(loadResult(siteKey: siteKey))
            } catch {
                reject(call, error: error, fallbackMessage: "Failed to load reCAPTCHA.")
            }
        }
    }

    @objc func execute(_ call: CAPPluginCall) {
        guard resolveEnterprise(call) else {
            rejectStandardNativeMode(call)
            return
        }

        guard let siteKey = resolveSiteKey(call) else {
            call.reject("siteKey is required. Pass siteKey/iosSiteKey or set Recaptcha.iosSiteKey/siteKey in Capacitor config.")
            return
        }

        guard let action = call.getString("action")?.trimmingCharacters(in: .whitespacesAndNewlines), !action.isEmpty else {
            call.reject("action is required.")
            return
        }

        let timeout = call.getInt("timeout")

        Task {
            do {
                let token = try await implementation.execute(siteKey: siteKey, action: action, timeout: timeout)
                call.resolve(executionResult(token: token, action: action, siteKey: siteKey))
            } catch {
                reject(call, error: error, fallbackMessage: "Failed to execute reCAPTCHA.")
            }
        }
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve([
            "version": implementation.getPluginVersion()
        ])
    }

    private func resolveSiteKey(_ call: CAPPluginCall) -> String? {
        firstNonEmpty(
            call.getString("iosSiteKey"),
            call.getString("siteKey"),
            call.getString("sitekeyIos"),
            call.getString("sitekeyIOS"),
            getConfig().getString("iosSiteKey"),
            getConfig().getString("siteKey"),
            getConfig().getString("sitekeyIos"),
            getConfig().getString("sitekeyIOS")
        )
    }

    private func resolveEnterprise(_ call: CAPPluginCall) -> Bool {
        call.getBool("enterprise") ?? getConfig().getBoolean("enterprise", true)
    }

    private func rejectStandardNativeMode(_ call: CAPPluginCall) {
        call.reject(
            "Regular reCAPTCHA v3 is only supported on Web. iOS uses Google's mobile reCAPTCHA SDK, which requires an Enterprise/mobile site key.",
            "UNSUPPORTED_MODE"
        )
    }

    private func loadResult(siteKey: String) -> [String: Any] {
        [
            "loaded": true,
            "siteKey": siteKey,
            "enterprise": true,
            "platform": "ios"
        ]
    }

    private func executionResult(token: String, action: String, siteKey: String) -> [String: Any] {
        [
            "token": token,
            "action": action,
            "siteKey": siteKey,
            "enterprise": true,
            "platform": "ios"
        ]
    }

    private func firstNonEmpty(_ values: String?...) -> String? {
        for value in values {
            guard let trimmedValue = value?.trimmingCharacters(in: .whitespacesAndNewlines), !trimmedValue.isEmpty else {
                continue
            }
            return trimmedValue
        }
        return nil
    }

    private func reject(_ call: CAPPluginCall, error: Error, fallbackMessage: String) {
        if let recaptchaError = error as? RecaptchaError {
            call.reject(
                recaptchaError.errorMessage,
                String(describing: recaptchaError.errorCode),
                recaptchaError
            )
            return
        }

        call.reject(error.localizedDescription.isEmpty ? fallbackMessage : error.localizedDescription, nil, error)
    }
}
