# Site15Ru

## Start in dev infra

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
nvm use
npm i --force
cd devops
nvm use
npm i --force
npm run docker:dev:clean-restart
```

Open http://localhost:9090

## Start in prod infra

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
nvm use
npm i --force
cd devops
nvm use
npm i --force
npm run docker:prod:clean-restart
```

Open http://localhost:9090

## Start in host infra

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
nvm use
npm i --force
cd devops
nvm use
npm i --force
npm run docker:host:clean-restart
```

Open http://localhost:4200
