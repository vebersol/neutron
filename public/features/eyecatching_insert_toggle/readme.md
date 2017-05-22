# Intro

Haptikdesign has been tasked with developing a component to increase newsletter subscriptions on cioview.deutscheawm.com in a creative, eye-catching manner.

A current test can be viewed here: [http://haptikdesign.com/dev/deawm/newsletter/rc/test/](http://haptikdesign.com/dev/deawm/newsletter/rc/test/)
Username: **deawm**
Password: **proto**

PMs - please refer to [Confluence Initiative](https://deawm-confluence.smarthouse-media.de/pages/viewpage.action?title=Newsletter+Teaser+-+Eyecatcher&spaceKey=CV) for more info. 

## Description (plain language)

When the user scrolls down on the page, an empty box moves up from the bottom along with the subscription link. In the box, a chart moves in from left to right. After a few interesting points get briefly highlighted on the chart, the best time to invest is marked. At any point in time, the user can open or close this insert. If the animation has been shown recently, the animation will not automatically trigger when scrolling down, neither when bringing up the insert manually.

## Description (technical)

Please refer to the **eyecatching\_insert** folder for full uncompressed sources with comments, particularly **eyecatching\_insert.js** for a procedural description.

## Missing Dependencies

- Modernizr test **csstransitions**. The display  of the insert relies on CSS3-Transitions, if those are not present (<IE10), jQuery animations handle the fallback. Those are already implemented and tested, only the CSS3-Transition test has to be added to Modernizr.
- The link(s) to the subscription form page to be displayed inside the box.

## Present Dependencies used

- Modernizr
- jQuery
- jQuery Cookie ([https://github.com/carhartl/jquery-cookie](https://github.com/carhartl/jquery-cookie))



## Authors

[Christopher Kamper](mailto:c.kamper@haptikdesign.com)
