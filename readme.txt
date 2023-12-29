#Build a Pokedex using Vanilla JS and Typescript
- Load a list of pokemon´✔
- Every pokemon must show: ✔
    - Img
    - Id number
    - Name
    - Types
- Filter pokemon by Types
- Single page for every pokemon showing data and stats ✔
- Search engine ✔

#ToDos
- Improve pokemon data builder
- Improve url manipulation

npm init -y para crear package.json
tsc --init para crear tsconfig.json

#Configurando tsconfig.json
Cambia "rootDir": "./ts" y  "outDir": "./public/js" para que al transcompilar (tsc) los archivos .js vayan a la carpeta deseada.
Cambia "module": "ES6" para para que el navegador pueda entender el code.

tsc -w: poner en modo watch, así no tendrás que transcompilar manualmente cada vez