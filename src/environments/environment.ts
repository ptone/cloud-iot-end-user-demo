// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBH9jWHpKntFUerTyJOAiek4RwmxNR3-fk",
    authDomain: "iot-end-user-demo.firebaseapp.com",
    databaseURL: "https://iot-end-user-demo.firebaseio.com",
    projectId: "iot-end-user-demo",
    storageBucket: "iot-end-user-demo.appspot.com",
    messagingSenderId: "108224824450"
  }
};
