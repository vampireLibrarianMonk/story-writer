.PHONY: diagrams install dev test serve

diagrams:
	JAVA_TOOL_OPTIONS="-Djava.awt.headless=true" java -jar ~/.local/lib/plantuml.jar -tpng docs/diagrams/*.puml

install:
	pip install -e .

dev:
	pip install -e ".[dev]"

test:
	python -m pytest tests/ -v

serve:
	uvicorn story_writer.api:app --reload --host 0.0.0.0 --port 8000
