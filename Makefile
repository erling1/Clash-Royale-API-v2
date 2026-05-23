IMAGE      := clashroyale-db
CONTAINER  := clashroyale-db
PORT       := 4213
DATA_DIR   := $(CURDIR)/data
CONTEXT    := database
DUCKDB     := $(CURDIR)/database/data/mydb.duckdb

.PHONY: build run stop logs clean prune help duck

help:
	@echo "Targets:"
	@echo "  build   Build the Docker image ($(IMAGE))"
	@echo "  run     Build (if needed) and run the container in the background"
	@echo "  stop    Stop and remove the running container"
	@echo "  logs    Tail the container's logs"
	@echo "  clean   Remove this project's container and image"
	@echo "  prune   clean + 'docker system prune -f' (removes ALL unused Docker resources)"
	@echo "  duck    Open the DuckDB CLI on $(DUCKDB)"

duck:
	duckdb $(DUCKDB)

build:
	docker build -t $(IMAGE) $(CONTEXT)

run: build
	@if [ -z "$$QUACK_TOKEN" ]; then echo "QUACK_TOKEN is not set (try 'direnv allow' or 'source .envrc')"; exit 1; fi
	@mkdir -p $(DATA_DIR)
	@docker rm -f $(CONTAINER) >/dev/null 2>&1 || true
	docker run -d \
		--name $(CONTAINER) \
		-p 127.0.0.1:$(PORT):$(PORT) \
		-e QUACK_TOKEN=$$QUACK_TOKEN \
		-v $(DATA_DIR):/data \
		$(IMAGE)
	@echo "Running on localhost:$(PORT). Logs: make logs"

stop:
	-docker rm -f $(CONTAINER)

logs:
	docker logs -f $(CONTAINER)

clean: stop
	-docker rmi $(IMAGE)

prune: clean
	docker system prune -f
