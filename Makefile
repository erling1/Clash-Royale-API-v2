IMAGE      := clashroyale-api
CONTAINER  := clashroyale-api
PORT       := 3000
DATA_DIR   := $(CURDIR)/database/data
DUCKDB     := $(DATA_DIR)/mydb.duckdb

.PHONY: build run stop logs prune duck pipeline help

help:
	@echo "Targets:"
	@echo "  build      Build the API Docker image ($(IMAGE))"
	@echo "  run        Build (if needed) and run the API container in the background"
	@echo "  stop       Stop and remove the running API container"
	@echo "  logs       Tail the API container's logs"
	@echo "  prune      Stop the container and remove the API image"
	@echo "  duck       Open the DuckDB CLI on $(DUCKDB)"
	@echo "  pipeline   Run extract + dbt run (the full daily refresh)"

build:
	docker build -t $(IMAGE) .

run: build
	@mkdir -p $(DATA_DIR)
	@docker rm -f $(CONTAINER) >/dev/null 2>&1 || true
	docker run -d \
		--name $(CONTAINER) \
		-p 127.0.0.1:$(PORT):$(PORT) \
		-v $(DATA_DIR):/app/database/data \
		$(IMAGE)
	@echo "API running on http://localhost:$(PORT). Logs: make logs"

stop:
	-docker rm -f $(CONTAINER)

logs:
	docker logs -f $(CONTAINER)

prune: stop
	-docker rmi $(IMAGE)

duck:
	duckdb $(DUCKDB)

pipeline:
	$(CURDIR)/extract/run_pipeline.sh
