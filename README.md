# polito-se2-24-Kiruna-eXplorer-18
Software Engineering 2 - main project - Kiruna eXplorer - group 18

![dev](https://github.com/GiuseppeArbore/polito-se2-24-Kiruna-eXplorer-18//actions/workflows/main.yml/badge.svg?branch=dev)
![main](https://github.com/GiuseppeArbore/polito-se2-24-Kiruna-eXplorer-18//actions/workflows/main.yml/badge.svg?branch=main)


[Documentation](https://storage.veebor.dev/s/AJegs4BtiMGxpqZ)
---

### Running the project without docker

You can use `npm run dev` to run the project with authentication disabled.
Running with `npm start` will leave authentication enabled.

### Fake users
You can find a collection ready to be imported in mongodb in `test_users`. The collection name should be
`users`.

### Run the project with docker
1. Clone the repository
2. Run the following command in the root folder of the project:
```
docker compose up
```
3. Open a browser and go to the following address:
```
http://localhost:80/
```
4. To stop the project, run the following command in the root folder of the project:
```
docker compose down
```
### Run mongoDB with docker
1. Run the following command:
```
docker compose up -d db
```
2. To stop the container, run the following command:
```
docker stop mongo
```
3. To remove the container, run the following command:
```
docker rm mongo
```
