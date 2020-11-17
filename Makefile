build: docker/build
	@docker run --rm -ti --user $(shell id -u):$(shell id -g) -v $(PWD):/docs:ro -v $(PWD)/site:/docs/site:rw -w /docs $(shell grep "Successfully built" .buildlog | cut -d ' ' -f 3)

docker/build:
	@docker build . | tee .buildlog
