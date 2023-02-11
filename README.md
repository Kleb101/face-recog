# face-recognition
A simple web app that detect faces through web camera 
and recognize if it is one of the faces listed in faces.json.

To add a new person's face, 
simply upload the image containing the person's face in `path/to/project/faces` folder then add the filename and the name of the person in `path/to/project/src/faces/faces.json`
## prerequisites
- Node version 16
- Yarn

## install dependencies
```
$ cd path/to/project
$ npm i
```

## development
```
$ cd path/to/project
$ yarn dev
```

## build production
```
$ cd path/to/project
$ yarn build
```
