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
* Add status to patterns. Default: in progress, done, deprecated

## Getting Started

To run **Neutron** you just need to download it and run:

    $ npm install

After successfully load your own implementation, just run:

    $ npm run start -- -w -s

It will compile your patterns, copy your assets and automatically load a [browsersync](https://www.browsersync.io/) server in *http://localhost:3000* and watch your changes

## Tips

Check the items below to understand **Neutron's** functionalities and structure.

* Write patterns - TBD
* Document your patterns - TBD
* Project structure - TBD
* Keyboard shortcuts - TBD
* Add status to a pattern - TBD

### Add status to a pattern

It’s useful for team work to define the status of every particular pattern to allow/disallow usage by other team members. To add status to your pattern, simply do the following:

1. Create a json file with the same name of your pattern. Example: atoms/text/headline.hbs should be atoms/text/headline.json 
2. You may include everything you need as data to your pattern and include the property **_status**. Example:

    ```json
    {
      "_status": "in-progress",
      "...": "..."
    }
    ```
3. The standard keywords included by default are: *in-progress*, *done* and *deprecated*. The tool automatically replaces the (-) by a whitespace.
4. To customize your own keywords, just add your *custom-keyword* as *_status* in your json file and create the following css rules to add styles:
    ```css
	.neutron-custom-keyword::before {
	  color: /* any color */;
	  /* what ever you want to do */
	}
	
	#neutron-status .neutron-custom-keyword {
		background-color: /* any color */;
		/* what ever you want to do */
	}
    ```

## Command line

Neutron has a friendly command line setup.

TODO: Add more documentation.

* **neutron run**: Renders your patterns, generates the navigation module and copy your assets folder.
* **neutron run -s**: Renders your patterns, generates the navigation module, copy your assets folder and runs a server.
* **neutron run -w**: Renders your patterns, generates the navigation module, copy your assets folder and watch your files.
* **neutron run -w -s**: Do everything as documented above.

## Prerequisities

**Neutron** requires [node.js](https://nodejs.org/).

## Running the tests

TODO

## Contributing

Please, contribute! We'd love to have you as a contributor! Before contribue, read the blog post [10 tips for better Pull Requests](http://blog.ploeh.dk/2015/01/15/10-tips-for-better-pull-requests/) to provide good Pull Requests.

## Authors

* **André Dias** - *Support in navigation module* - [andrehNSFW](https://github.com/andrehNSFW)
* **Mateus Vahl** - *Support in core* - [mateuspv](https://github.com/mateuspv)
* **Vinícius Ebersol** - *Initial work* - [vebersol](https://github.com/vebersol)

See also the list of [contributors](https://github.com/vebersol/neutron/graphs/contributors) and [members](https://github.com/vebersol/neutron/network/members) who participated in this project.

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
