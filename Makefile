.PHONY: all
all: build run

.PHONY: build
build:
	docker buildx build --platform=linux/amd64 --tag torrplay-android:latest .

.PHONY: run
run:
	docker run --platform=linux/amd64 --rm --volume `pwd`:/build torrplay-android:latest
