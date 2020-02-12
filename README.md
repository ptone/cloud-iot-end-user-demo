# Code for Next Demo 19

This code was used in this presentation: https://www.youtube.com/watch?v=10Nelw2nL-Q

The sample code is provided as was used in the demo, and will not be updated or supported.

## There are Several folders/components

1. `device` - has the python code that ran on the demo device, HW was based on [this board](https://coral.ai/products/environmental)
1. `functions` contains code that glue Firestore and Devices - written in typescript, runs as Firebase functions
1. `src` contains the [Ionic](https://ionicframework.com/getting-started) web front end

## setup

### serve locally:

1. npm i
2. ionic serve


### other notes

 - The site can be deployed to Firebase hosting
 - Firestore rules and Firestore auth were used.
 - the device private key included in the repo is for illustration/placeholder, it is no longer valid
 - This readme does not represent a complete tutorial or a set of steps that can be re-used to replicate the environment, but the code should be complete.
 

Not a Google Product

Copyright 2019 Google Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.