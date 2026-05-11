import XCTest
@testable import RecaptchaPlugin

class RecaptchaTests: XCTestCase {
    func testGetPluginVersion() {
        let implementation = RecaptchaBridge()
        let result = implementation.getPluginVersion()

        XCTAssertEqual("native", result)
    }
}
