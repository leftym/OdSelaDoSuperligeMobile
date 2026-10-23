plugins {
    id("com.android.application")
}

android {
    namespace = "com.odsela.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.odsela.game"
        minSdk = 26
        targetSdk = 36
        // GitHub numbers each build itself, so every new APK has a higher number and installs over the last one.
        versionCode = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull() ?: 1
        versionName = "0.72"
    }

    // One fixed key for every build, so each new version installs over the old one and your saves are kept.
    // Fine for your own phone; Google Play will need its own upload key later.
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
