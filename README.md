# html3pdf.js

html3pdf.js converts any webpage or element into a printable PDF entirely client-side using [html2canvas](https://github.com/niklasvh/html2canvas) and [jsPDF](https://github.com/MrRio/jsPDF).

This library is a continuation of, and is compatible with the API for, [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) by [Erik Koopmans](https://github.com/eKoopmans).  The majority of this README was written by Erik Koopmans.
## Differences from html2pdf.js:

- Dropped support for environments that don't have native Promises.
- Progress-tracking API implemented.
- PRs from the original library merged: 170, 260, 261, 340, 447, 503, 516, 531, 569, 635, 641.  These include: some fixes to the pagebreak calculations, the option to change what elements are used for pagebreaks and assign a class to those elements, the addition of the jsPDF documentProperties to the api, and a fix for the bug where long documents are blank - by rendering one canvas per page.

## Table of contents

- [Getting started](#getting-started)
  - [CDN](#cdn)
  - [Raw JS](#raw-js)
  - [NPM](#npm)
  - [Bower](#bower)
  - [Console](#console)
- [Usage](#usage)
  - [Advanced usage](#advanced-usage)
    - [Workflow](#workflow)
    - [Worker API](#worker-api)
- [Options](#options)
  - [Page-breaks](#page-breaks)
    - [Page-break settings](#page-break-settings)
    - [Page-break modes](#page-break-modes)
    - [Example usage](#example-usage)
  - [Image type and quality](#image-type-and-quality)
- [Progress tracking](#progress-tracking)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
  - [Issues](#issues)
  - [Tests](#tests)
  - [Pull requests](#pull-requests)
- [Credits](#credits)
- [License](#license)

## Getting started

#### CDN

The simplest way to use html3pdf.js is to include it as a script in your HTML by using cdnjs:

```html
<script src="" integrity="" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
```
// TODO - add to CDN and add link here


*Note: [Read about dependences](#dependencies) for more information about using the unbundled version `dist/html2canvas.min.js`.*

#### Raw JS

 You may also download `dist/html3pdf.bundle.min.js` directly to your project folder and include it in your HTML with:

```html
<script src="html3pdf.bundle.min.js"></script>
```

#### NPM

Install html3pdf.js and its dependencies using NPM with `npm install --save html3pdf.js` (make sure to include `.js` in the package name).

*Note: You can use NPM to create your project, but html3pdf.js **will not run in Node.js**, it must be run in a browser.*


#### Console

If you're on a webpage that you can't modify directly and wish to use html3pdf.js to capture a screenshot, you can follow these steps:

1. Open your browser's console (instructions for different browsers [here](https://webmasters.stackexchange.com/a/77337/94367)).
2. Paste in this code:
    ```js
    function addScript(url) {
        var script = document.createElement('script');
        script.type = 'application/javascript';
        script.src = url;
        document.head.appendChild(script);
    }
    addScript('');  // TODO add cdn link here
    ```
3. You may now execute html3pdf.js commands directly from the console. To capture a default PDF of the entire page, use `html2pdf(document.body)`.

## Usage

Once installed, html3pdf.js is ready to use. The following command will generate a PDF of `#element-to-print` and prompt the user to save the result:

```js
var element = document.getElementById('element-to-print');
html2pdf(element);
```

### Advanced usage

Every step of html3pdf.js is configurable, using a Promise-based API. If html3pdf.js is called without arguments, it will return a `Worker` object:

```js
var worker = html2pdf();  // Or:  var worker = new html2pdf.Worker;
```

This worker has methods that can be chained sequentially, as each Promise resolves, and allows insertion of your own intermediate functions between steps. A prerequisite system allows you to skip over mandatory steps (like canvas creation) without any trouble:

```js
// This will implicitly create the canvas and PDF objects before saving.
var worker = html2pdf().from(element).save();
```

#### Workflow

The basic workflow of html3pdf.js tasks (enforced by the prereq system) is:

```
.from() -> .toContainer() -> .toCanvas() -> .toImg() -> .toPdf() -> .save()
```

#### Worker API

| Method       | Arguments          | Description |
|--------------|--------------------|-------------|
| from         | src, type          | Sets the source (HTML string or element) for the PDF. Optional `type` specifies other sources: `'string'`, `'element'`, `'canvas'`, or `'img'`. |
| to           | target             | Converts the source to the specified target (`'container'`, `'canvas'`, `'img'`, or `'pdf'`). Each target also has its own `toX` method that can be called directly: `toContainer()`, `toCanvas()`, `toImg()`, and `toPdf()`. |
| output       | type, options, src | Routes to the appropriate `outputPdf` or `outputImg` method based on specified `src` (`'pdf'` (default) or `'img'`). |
| outputPdf    | type, options      | Sends `type` and `options` to the jsPDF object's `output` method, and returns the result as a Promise (use `.then` to access). See the [jsPDF documentation](https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html#output) for more info. |
| outputImg    | type, options      | Returns the specified data type for the image as a Promise (use `.then` to access). Supported types: `'img'`, `'datauristring'`/`'dataurlstring'`, and `'datauri'`/`'dataurl'`. |
| save         | filename, documentProperties           | Saves the PDF object (creates user download prompt) with the optional filename and document properties (see [jsPDF DocumentProperties](https://github.com/parallax/jsPDF/blob/2d9a91916471f1fbe465dbcdc05db0cf22d720ec/types/index.d.ts#L677)). Ex. `html2pdf().save('output.pdf', { title: 'My PDF' })` |
| set          | opt                | Sets the specified properties. See [Options](#options) below for more details. |
| get          | key, cbk           | Returns the property specified in `key`, either as a Promise (use `.then` to access), or by calling `cbk` if provided. |
| then         | onFulfilled, onRejected | Standard Promise method, with `this` re-bound to the Worker, and with added progress-tracking (see [Progress](#progress) below). Note that `.then` returns a `Worker`, which is a subclass of Promise. |
| thenCore     | onFulFilled, onRejected | Standard Promise method, with `this` re-bound to the Worker (no progress-tracking). Note that `.thenCore` returns a `Worker`, which is a subclass of Promise. |
| thenExternal | onFulfilled, onRejected | True Promise method. Using this 'exits' the Worker chain - you will not be able to continue chaining Worker methods after `.thenExternal`. |
| catch, catchExternal | onRejected | Standard Promise method. `catchExternal` exits the Worker chain - you will not be able to continue chaining Worker methods after `.catchExternal`. |
| error        | msg                | Throws an error in the Worker's Promise chain. |
| listen       | (progress) => void | Lets you pass a callback that will be called after each step of the html2pdf process completes.  Useful for making progress bars, etc. |

A few aliases are also provided for convenience:

| Method    | Alias     |
|-----------|-----------|
| save      | saveAs    |
| set       | using     |
| output    | export    |
| then      | run       |



## Options

html3pdf.js can be configured using an optional `opt` parameter:

```js
var element = document.getElementById('element-to-print');
var opt = {
  margin:             1,
  filename:           'myfile.pdf',
  image:              { type: 'jpeg', quality: 0.98 },
  html2canvas:        { scale: 2 },
  jsPDF:              { unit: 'in', format: 'letter', orientation: 'portrait' }
  documentProperties: { title: 'My PDF' }
};

// New Promise-based usage:
html2pdf().set(opt).from(element).save();

// Old monolithic-style usage:
html2pdf(element, opt);
```

The `opt` parameter has the following optional fields:

|Name        |Type            |Default                         |Description                                                                                                 |
|------------|----------------|--------------------------------|------------------------------------------------------------------------------------------------------------|
|margin      |number or array |`0`                             |PDF margin (in jsPDF units). Can be a single number, `[vMargin, hMargin]`, or `[top, left, bottom, right]`. |
|filename    |string          |`'file.pdf'`                    |The default filename of the exported PDF.                                                                   |
|pagebreak   |object          |`{mode: ['css', 'legacy']}`     |Controls the pagebreak behaviour on the page. See [Page-breaks](#page-breaks) below.                        |
|image       |object          |`{type: 'jpeg', quality: 0.95}` |The image type and quality used to generate the PDF. See [Image type and quality](#image-type-and-quality) below.|
|enableLinks |boolean         |`true`                          |If enabled, PDF hyperlinks are automatically added ontop of all anchor tags.                                |
|html2canvas |object          |`{ }`                           |Configuration options sent directly to `html2canvas` ([see here](https://html2canvas.hertzen.com/configuration) for usage).|
|jsPDF       |object          |`{ }`                           |Configuration options sent directly to `jsPDF` ([see here](http://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html) for usage).|
|documentProperties |object |`{ }` | Configuration options applied directly to `jsPDF` pdf ([see here](https://www.rotisedapsales.com/snr/cloud_staging/website/jsPDF-master/docs/global.html#setProperties) for usage).

### Page-breaks

html3pdf.js has the ability to automatically add page-breaks to clean up your document. Page-breaks can be added by CSS styles, set on individual elements using selectors, or avoided from breaking inside all elements (`avoid-all` mode).

By default, html3pdf.js will respect most CSS [`break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before), [`break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after), and [`break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside) rules, and also add page-breaks after any element with class `html2pdf__page-break` (for legacy purposes).

#### Page-break settings

|Setting   |Type            |Default             |Description |
|----------|----------------|--------------------|------------|
|mode      |string or array |`['css', 'legacy']` |The mode(s) on which to automatically add page-breaks. One or more of `'avoid-all'`, `'css'`, and `'legacy'`. |
|before    |string or array |`[]`                |CSS selectors for which to add page-breaks before each element. Can be a specific element with an ID (`'#myID'`), all elements of a type (e.g. `'img'`), all of a class (`'.myClass'`), or even `'*'` to match every element. |
|after     |string or array |`[]`                |Like 'before', but adds a page-break immediately after the element. |
|avoid     |string or array |`[]`                |Like 'before', but avoids page-breaks on these elements. You can enable this feature on every element using the 'avoid-all' mode. |

#### Page-break modes

| Mode      | Description |
|-----------|-------------|
| avoid-all | Automatically adds page-breaks to avoid splitting any elements across pages. |
| css       | Adds page-breaks according to the CSS `break-before`, `break-after`, and `break-inside` properties. Only recognizes `always/left/right` for before/after, and `avoid` for inside. |
| legacy    | Adds page-breaks after elements with class `html2pdf__page-break`. This feature may be removed in the future. |

#### Example usage

```js
// Avoid page-breaks on all elements, and add one before #page2el.
html2pdf().set({
  pagebreak: { mode: 'avoid-all', before: '#page2el' }
});

// Enable all 'modes', with no explicit elements.
html2pdf().set({
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'], elementType: 'div', className: 'page_break' }  // you can change what kind of element is injected as a pagebreak, and add a class name to style those elements
});

// No modes, only explicit elements.
html2pdf().set({
  pagebreak: { before: '.beforeClass', after: ['#after1', '#after2'], avoid: 'img' }
});
```

### Image type and quality

You may customize the image type and quality exported from the canvas by setting the `image` option. This must be an object with the following fields:

|Name        |Type            |Default                       |Description                                                                                  |
|------------|----------------|------------------------------|---------------------------------------------------------------------------------------------|
|type        |string          |'jpeg'                        |The image type. HTMLCanvasElement only supports 'png', 'jpeg', and 'webp' (on Chrome).       |
|quality     |number          |0.95                          |The image quality, from 0 to 1. This setting is only used for jpeg/webp (not png).           |

These options are limited to the available settings for [HTMLCanvasElement.toDataURL()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL), which ignores quality settings for 'png' images. To enable png image compression, try using the [canvas-png-compression shim](https://github.com/ShyykoSerhiy/canvas-png-compression), which should be an in-place solution to enable png compression via the `quality` option.

## Progress tracking

The Worker object returned by `html2pdf()` has a built-in progress-tracking mechanism. Call the .listen() method at the end of your chain, e.g:  
```
html2pdf().set(opt).from(element).save().listen(progressCallback);
```

The `progressCallback` should be a void function that accepts a single argument, which is this object:
```
 {
  val:    number   -  The current progress step.
  state:  string   -  A string describing the current step.
  n:      number   -  The number of total steps that will be completed.
  stack:  string[] -  The current stack of functions to be executed.
  ratio:  number   -  The current progress ratio. (val/n) -> Use this for progress bars!
 }
```

## Dependencies

html3pdf.js depends on the external packages [html2canvas](https://github.com/niklasvh/html2canvas), and [jsPDF](https://github.com/MrRio/jsPDF)). These dependencies are automatically loaded when using NPM or the bundled package.

If using the unbundled `dist/html3pdf.min.js` (or its un-minified version), you must also include each dependency. Order is important, otherwise html2canvas will be overridden by jsPDF's own internal implementation:

```html
<script src="jspdf.min.js"></script>
<script src="html3canvas.min.js"></script>
<script src="html3pdf.min.js"></script>
```

## Contributing

### Issues

When submitting an issue, please remember that html3pdf.js is a wrapper around [html2canvas](https://github.com/niklasvh/html2canvas) and [jsPDF](https://github.com/MrRio/jsPDF), so it's a good idea to check each of those repositories' issue trackers to see if your problem has already been addressed.

#### Known issues

1. **Rendering:** The rendering engine html2canvas isn't perfect (though it's pretty good!). If html2canvas isn't rendering your content correctly, we can't fix it.

2. **Node cloning (CSS etc):** The way html3pdf.js clones your content before sending to html2canvas is buggy. A fix was being developed in html2pdf.js

3. **Resizing:** Currently, html3pdf.js resizes the root element to fit onto a PDF page (causing internal content to "reflow"). This is often desired behaviour, but not always.

4. **Rendered as image:** html3pdf.js renders all content into an image, then places that image into a PDF.  This means text is *not selectable or searchable*, and causes large file sizes.  This is the unavoidable reality of the html3pdf.js system of using html2canvas to render everything first.  jsPDF may be used as the renderer in the future to avoid this.

### Tests
Any contributions or suggestions of automated (or manual) tests are welcome. This is high on the to-do list for this project.

### Pull requests
If you want to create a new feature or bugfix, please feel free to fork and submit a pull request! Create a fork, branch off of `master`, and make changes to the `/src/` files (rather than directly to `/dist/`). You can test your changes by rebuilding with `npm run build`.

## Credits

[Erik Koopmans](https://github.com/eKoopmans), [html2pdf.js](https://github.com/eKoopmans/html2pdf.js), and all other contributors to that project!

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2017-2019 Erik Koopmans <[http://www.erik-koopmans.com/](http://www.erik-koopmans.com/)>
