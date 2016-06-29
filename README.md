# Neutron Atomic Design Tool

Neutron is an Atomic Design tool based in [Brad Frost's concept](http://bradfrost.com/blog/post/atomic-web-design/) it is inspired in [Patternlab](http://patternlab.io/).

## Features

* Navigation isn't iframe based. It creates a single, stand alone script and css that loads with your pattern, without any interference to your Scripts or CSS
* Patterns markup: Handlebars.js
* Easy to document your patterns with Markdown
* Search your patterns quickly
* Easy to customize Neutron features with your own CSS
* Multiple CSS themes
* QRCode generator
* Loads your markup in Handlebars, HTML output and documentation under user action - not attached to the code

## Getting Started

To run **Neutron** you just need to download it and run:

    $ npm install

After successfully load your own implementation, just run:

    $ gulp server

It will compile your patterns, copy your assets and automatically load a [browsersync](https://www.browsersync.io/) server in *http://localhost:3000*

### Main gulp tasks

* **engine**: Renders your patterns
* **navigation**: Generate all navigation module files and copy to your styleguide folders
* **copy:all**: Copy all files (css, images, javascripts) aren't styleguides
* **server**: Runs all previous tasks, watch your files and serve it using browsersync.

### Prerequisities

**Neutron** requires [node.js](https://nodejs.org/) and [gulp.js](http://gulpjs.com/).

## Running the tests

TODO

## Contributing

We'd love to have you as a contributor! Before contribue, read the blog post [10 tips for better Pull Requests](http://blog.ploeh.dk/2015/01/15/10-tips-for-better-pull-requests/) to provide good Pull Requests.

## Authors

* **André Dias** - *Support in navigation module* - [andrehNSFW](https://github.com/andrehNSFW)
* **Mateus Vahl** - *Support in core* - [andrehNSFW](https://github.com/andrehNSFW)
* **Vinícius Ebersol** - *Initial work* - [mateuspv](https://github.com/mateuspv)

See also the list of [contributors](https://github.com/vebersol/neutron/graphs/contributors) and [members](https://github.com/vebersol/neutron/network/members) who participated in this project.

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
