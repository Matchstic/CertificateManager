#!/bin/bash

# Requirements:
# - electron-packager

# macOS build
electron-packager . CertificateManager --overwrite --asar --platform=darwin --arch=x64 --icon=Icon.icns --out=build --app-bundle-id=com.matchstic.certificatemanager 

# Linux build
electron-packager . CertificateManager --overwrite --asar --platform=linux --arch=ia32,x64 --icon=Icon.png --out=build

# Windows build - needs wine!
electron-packager . CertificateManager --overwrite --asar --platform=win32 --arch=ia32,x64 --icon=Icon.ico --out=build 