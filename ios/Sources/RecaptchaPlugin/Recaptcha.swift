import Foundation
import RecaptchaEnterprise

public final class RecaptchaBridge: NSObject {
    private var client: RecaptchaClient?
    private var loadedSiteKey: String?

    public func load(siteKey: String) async throws {
        if client != nil && loadedSiteKey == siteKey {
            return
        }

        client = try await RecaptchaEnterprise.Recaptcha.fetchClient(withSiteKey: siteKey)
        loadedSiteKey = siteKey
    }

    public func execute(siteKey: String, action: String, timeout: Int?) async throws -> String {
        try await load(siteKey: siteKey)

        guard let client = client else {
            throw NSError(
                domain: "Recaptcha",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "reCAPTCHA client is not loaded."]
            )
        }

        let recaptchaAction = actionFromString(action)
        if let timeout = timeout {
            return try await client.execute(withAction: recaptchaAction, withTimeout: Double(max(5000, timeout)))
        }

        return try await client.execute(withAction: recaptchaAction)
    }

    public func getPluginVersion() -> String {
        return "native"
    }

    private func actionFromString(_ action: String) -> RecaptchaAction {
        switch action.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() {
        case "login":
            return .login
        case "signup", "sign_up", "sign-up":
            return .signup
        default:
            return RecaptchaAction(customAction: action.trimmingCharacters(in: .whitespacesAndNewlines))
        }
    }
}
