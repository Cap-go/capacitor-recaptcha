// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoCapacitorRecaptcha",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapgoCapacitorRecaptcha",
            targets: ["RecaptchaPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/GoogleCloudPlatform/recaptcha-enterprise-mobile-sdk.git", from: "18.9.0")
    ],
    targets: [
        .target(
            name: "RecaptchaPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "RecaptchaEnterprise", package: "recaptcha-enterprise-mobile-sdk")
            ],
            path: "ios/Sources/RecaptchaPlugin"),
        .testTarget(
            name: "RecaptchaPluginTests",
            dependencies: ["RecaptchaPlugin"],
            path: "ios/Tests/RecaptchaPluginTests")
    ]
)
