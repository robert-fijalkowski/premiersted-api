HOST?=api.premiersted.schibsted.ga

run-local:
	npx nf npm run 

build:
	docker build -t premiersted:latest .

run:
	docker rm -f premiersted
	docker run --name premiersted -d premiersted:latest

run-dev: build
	docker rm -f premiersted-dev || true
	docker run -e LETSENCRYPT_HOST=$(HOST) -e LETSENCRYPT_HOST=$(HOST) --name premiersted-dev --rm -d  premiersted:latest

logs:
	docker logs -f premiersted

logs-dev:
	docker logs -f premiersted-dev