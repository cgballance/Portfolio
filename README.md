# Introduction

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.3.
I created this project as a step in my quest to learn angular and doing some work with D3.  To keep myself occupied, i decided to enhance the
typical treemap(Schneiderman) with additional dimensions of information.  Being of financial market IT background, I found a source of some market
data, though not much.  I found a site that has S&P 500 data at datahub.io.  It provides the hierarchical data necessary to at least demonstrate my extension to the treemap.  Unfortunately, the breadth of the market that i would want to display is not emcompassed by the SP500, as it is much too narrow for any real application should include a more full representation of the US Market, such as the russell 3000 index, as well as foreign issues as well.  So, at this point i'm cutting short this learning endeavour after taking things about as far as i want.
I've left out authentication/authorization in this project, as i've journeyed through that in my first angular experiment.  The new things that I've
worked on here:
1. ag-grid drag and drop
2. D3 treemap with a custom graphic representing additional information.
3. Data service(portfolio) for modeling portfolio holdings.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
