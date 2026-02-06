FROM node:24-trixie-slim

# See https://developer.android.com/tools/releases/build-tools
ENV ANDROID_BUILD_TOOLS_VERSION=36.0.0
# See https://developer.android.com/studio/index.html#command-tools
ENV ANDROID_SDK_VERSION=11076708
# See https://developer.android.com/studio/releases/platforms
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_PLATFORMS_VERSION=36
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH=$PATH:${ANDROID_HOME}/cmdline-tools:${ANDROID_HOME}/platform-tools

RUN corepack prepare pnpm@latest --activate \
    && corepack enable

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl \
    openjdk-21-jdk \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK tools
RUN curl -sL https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip -o commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip \
    && unzip commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip \
    && rm commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip \
    && mkdir $ANDROID_HOME && mv cmdline-tools $ANDROID_HOME \
    && yes | $ANDROID_HOME/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses \
    && $ANDROID_HOME/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME \
        "platform-tools" \
        "build-tools;34.0.0" \
        "build-tools;35.0.0" \
        "build-tools;${ANDROID_BUILD_TOOLS_VERSION}" \
        "platforms;android-34" \
        "platforms;android-35" \
        "platforms;android-${ANDROID_PLATFORMS_VERSION}"

# Set working directory
WORKDIR /build

CMD [ "./entrypoint.sh" ]
