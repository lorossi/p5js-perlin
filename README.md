# Looping Perlin Noise in p5js
*A collection of looping noisy gifs made with p5js*
# [Try it here](https://lorenzoros.si/p5js-perlin/index.html)

## What am I looking at?
Perlin noise is a *"special function"* created by Ken Perlin, an american computer scientist, in 1983.

It can be seen as a particular *random function* with the peculiarity of generating sequences of *smooth* pseudo-random values.

**But what does it mean?**

Well, compared to a more canonical random function, the Perlin noise creates a more organic and natural effect. By tying the noise value to some physical features of each "symbol" in the sketch (like position, rotation or transparency) and by giving them a slight offset over each other, we can create "breathing-like" animations and videos that behave almost like living creatures.

**Understood! Is that all?**

Well, no.

As a matter of fact, I used a variation of the Perlin noise called *Simplex noise* that features a 4-dimensional input. By adding time as 3rd and 4th variables, I managed to create looping videos with a set duration.

**Well, where can I see it in action?**

You can watch some rendered videos *down below*, on my [*Instagram page*](https://www.instagram.com/lorossi97/), inside the *output/videos* folder or by visiting [my website](https://lorenzoros.si/p5js-perlin/index.html) to try it out in real time!

## Example outputs
![first video](https://github.com/lorossi/p5js-perlin/blob/master/output/gifs/1.gif)  
![second video](https://github.com/lorossi/p5js-perlin/blob/master/output/gifs/2.gif)  
![third video](https://github.com/lorossi/p5js-perlin/blob/master/output/gifs/3.gif)  
![fourth video](https://github.com/lorossi/p5js-perlin/blob/master/output/gifs/4.gif)  

## Notes
The JS script might run very slowly on your device. Not much I can do, since p5js isn't the fastest framework available. From now on I'll move to using vanilla JS on HTML5 canvas. It's waaaay faster and it doesn't completely lag out mobile devices

## Credits
Open Simplex Noise provided by [jwagner](https://github.com/jwagner/) in his wonderful [repo](https://github.com/jwagner/simplex-noise.js/).

Videos created using [ccapture.js by spite](https://github.com/spite/ccapture.js/) for saving frames and [FFMPEG](https://ffmpeg.org/) for rendering.

This project is distributed under Attribution 4.0 International (CC BY 4.0) license.
