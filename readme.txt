npm init -y para crear package.json
tsc --init para crear tsconfig.json

#Configurando tsconfig.json
Cambia "rootDir": "./ts" y  "outDir": "./public/js" para que al transcompilar (tsc) los archivos .js vayan a la carpeta deseada.
Cambia "module": "ES6" para para que el navegador pueda entender el code.

tsc -w: poner en modo watch, así no tendrás que transcompilar manualmente cada vez