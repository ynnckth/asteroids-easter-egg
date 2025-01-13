# Asteroids Game Easter Egg

Turns any website that loads the script into the asteroids game where you get to destroy the website's elements.

**Disclaimer**: Code is fully generated using ChatGPT o1

## How to include in your website?

Place the `asteroids.js` file into your frontend's static assets (where it can be loaded directly from the browser).

In your frontend, define the trigger that should load the easter egg and assign an id to it:
```html
<!-- Trigger element for the Easter egg -->
<div id="easter-egg-trigger">Launch Game</div>
```

Attach a click event listener to the trigger element and load the `asteroids.js` file when triggered. The file is configured to autorun when loaded:
```javascript
document.getElementById('easter-egg-trigger').addEventListener('click', () => {
    // Prevent loading multiple instances
    if (document.querySelector('canvas#spaceship-game')) return;

    const script = document.createElement('script');
    script.src = 'asteroids.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
});
```
