#!/usr/bin/env sh

pnpm install
pnpm build
npx cap telemetry off
# npx cap add android
npx cap sync android
# npx @capacitor/assets generate --iconBackgroundColor '#FFFFFF' --iconBackgroundColorDark '#17171C' --splashBackgroundColor '#FFFFFF' --splashBackgroundColorDark '#17171C' --android

cd ./android
# ./gradlew clean assembleRelease
./gradlew clean assembleDebug
