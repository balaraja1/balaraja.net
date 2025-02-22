
---
title: A humbling and exhilarating experience as a brand new vibe coder
date: 2025-02-22
---

I had a humbling and exhilarating experience as a brand new "AI vibe coding" SW developer over the last 12ish hours. The task I set for myself to do starting around 8:30pm last night seemed simple: update [Arrow's basic static learning website](https://learn.arrowraja.com) with a couple of new videos and figure out how to cache those videos locally on the iPad for our Sayulita trip. I naively assumed it would take an hour or two at most. However, the task extended to over seven hours!

First, I encountered a hurdle when YouTube changed its code, making it difficult to download videos using the usual methods. After spending about 30 minutes selecting four new videos—two phonics and two counting—I realized traditional KeepVid type web services no longer worked as expected. It took an additional hour, at least, to figure out how to use the command line tools yt-dlp and ffmpeg to get the job done.

With the videos downloaded, integrating them into the code base was straightforward, taking about 10 to 15 minutes. But then the real challenge began: caching content on the iPad. Initially, I considered building an iPad app and putting it on TestFlight, but that would have been too complicated and among other things needed spending $99 on an Apple developer account. But then I dug in and discovered the awesomeness of progressive web apps (PWAs), which allow websites to function like standalone apps and enable caching.

I added a manifest JSON to the root with necessary parameters and created a service worker JavaScript file. After setting it up, testing it on the iPad proved problematic—the videos wouldn't play full-screen. This started a painful cycle of code changes, commits, and deployment on Vercel, involving cache clearing and login verifications, only for the videos to still not work correctly. I probably did 6-8 iterations of fixes last night, mainly relying on Claude 3.5 Sonnet within Cursor. 

Frustrated, I gave up for the night, only to return with renewed resolve the next morning after deciding Arrow wouldn’t have to learn a new UX because of my failure. I decided to rely on o1-pro inside ChatGPT instead of Clause 3.5 inside Cursor to solve the problem. Utilizing a fantastic tool I recently discovered called [Repo Prompt](https://www.repoprompt.com/), I could integrate the entire code base into o1-pro, iterate several times, while simultaneously deep-searching other developers’ issues with iPad PWA apps that play video through Perplexity w/ Deepseek-R1 and ChatGPT.

o1-pro didn’t solve the issue in one or two tries. It took perhaps 5 tries, and it required my problem-solving skills, creativity, and the ability to synthesize diverse information from a bunch of sources into a coherent plan. o1-pro could NOT have figured it out on its own, though a future agentic version of it with access to testing the issue on a virtual iPad environment may have figured it out in a couple of tries. The key was specific, targeted prompting, moving beyond general solutions to deeply investigate the issue.

Ultimately, my learning is that both Claude 3.5 and o1-pro propose increasingly complex and bound-to-fail solutions if initial attempts fail unless you direct them in a focused manner. Success comes from understanding the technical intricacies and crafting precise technical prompts. I believe that with experience, what took me nearly four hours to fix today could be accomplished in one hour in the future as I better converge on effective approaches.

Reflecting on this intense, seven-hour session, I’m optimistic about becoming more proficient at navigating such challenges with time and experience. The fact that I was able to fix the issue at all is a testament to the power of SOTA LLMs and apps like Cursor/Perplexity.

I had o1-pro write up a summary of our efforts together this morning, reproduced below. The “two different approaches” it mentions are the ones with Cursor and Claude 3.5. There were perhaps 4-5 approaches attempted last night that I didn’t document. 

> The conversation began with a request to fix a problem in an educational website. This website contains various instructional videos and is designed to operate offline as a Progressive Web App (PWA). Specifically, the user noted that videos refused to enter fullscreen mode on iPad when installed as a PWA. The user confirmed fullscreen mode worked properly on iPhone PWA and in Safari on iPad, but on iPad PWA they would only play inline.
> 
> Originally, the user had tried two different approaches internally but neither worked:
> 
> 1. ​**First Attempt**​:
> 	- Detected iPad PWA by checking `(display-mode: standalone)` and iOS platform details.
> 	- Temporarily removed `playsinline` and `webkit-playsinline` attributes, then used standard fullscreen APIs and restored everything upon exit.
> 	- Unfortunately, this did not fix the problem for iPad PWA.
> 2. ​**Second Attempt**​:
> 	- Created separate files ( `video-enhancement.css` and `video-enhancement.js` ) to isolate the iPad PWA logic and styles.
> 	- Tried forcing presentation mode by calling `video.webkitSetPresentationMode('fullscreen')` and then `requestFullscreen()` .
> 	- Despite that modular approach, iPad PWA still would not truly display fullscreen.
> 
> After these two internal attempts, the user requested fresh approaches. Several new strategies were explored in the conversation:
> 
> - ​**Fake Fullscreen Overlay**​: One proposed solution involved simulating fullscreen by creating a large overlay `<div>` that covers the screen and placing the video within that overlay. This was intended to replicate "true fullscreen" in scenarios where official APIs failed. Although it was a creative approach, it still did not solve the specific iPad PWA issue where the video continued to play in a small inline window.
> - ​**Double-Tap Zoom**​: Another subsequent approach involved detecting a rapid double-tap on a video to "zoom" it, effectively scaling the video to cover nearly the entire screen. A second double-tap was designed to revert everything to the initial inline, muted state. While this also mimicked a form of fullscreen, it still did not fully address the iPad PWA constraints.
> 
> All of these attempts failed to produce the desired result for iPad PWA. The user was then open to considering a different method. The eventual success came after deciding to eliminate iPad-specific detection entirely and rely on a reordering of play and fullscreen requests:
> 
> 1. ​**Starting from the Original Codebase**​: The site's default logic already supported inline playback, auto-playing videos while muted, and returning them to a muted, inline state after fullscreen ended. Instead of forcibly customizing behavior for iPad PWA, the new solution began by returning to the original setup.
> 2. ​**Ensuring Metadata Loaded**​: A critical component was to wait for the `loadedmetadata` event before requesting fullscreen. By listening for `video.addEventListener('loadedmetadata', ...)` , the code only attempts fullscreen once the video has enough information about its duration and format. This helps avoid potential race conditions or incomplete loading.
> 3. ​**Calling**​ ​**`video.play()`**​ ​**Before Fullscreen**​: The order of operations was changed so that `video.play()` was invoked first, and the subsequent `.then(...)` callback included the call to `video.requestFullscreen()` , `video.webkitEnterFullscreen()` , or whichever fullscreen API was available. This ensures the video is already in an active playback state, which appears to be a requirement on some devices to reliably grant fullscreen access.
> 4. ​**Manifest Display Mode**​: The code changes initially set the manifest's `display` to `"browser"` . However, it was later discovered that even when leaving it as `"standalone"` , the fix still worked. The user tested it under `"standalone"` and confirmed that the iPad PWA was now capable of entering fullscreen as desired.
> 
> Hence, the key to solving the fullscreen obstacle was to ensure:
> 
> - Metadata is loaded prior to requesting fullscreen (so the device sees the video as valid and playable).
> - Playback is explicitly started ( `video.play()` ) before calling the fullscreen APIs.
> - No extra logic specific to iPad or PWA detection was needed once the right ordering of calls was applied.
> 
> This final fix restored all desired behaviors:
> 
> - Inline, muted autoplay on page load.
> - Tap triggers the video to restart from zero, unmute, and go fullscreen smoothly, even in iPad PWA.
> - When the user exits fullscreen or when the video ends, it returns to inline, muted playback automatically.
> 
> In summary, multiple attempts were made along the way, each targeting subtle iOS or PWA constraints—particularly iPad's refusal to allow a true fullscreen environment. From removing inline attributes, using overlay illusions, and exploring specialized PWA checks, none solved the persistent inline playback. Eventually, the straightforward strategy of loading metadata first and then sequencing `play()` before `requestFullscreen()` delivered the correct result. Even with the manifest set to `"standalone"` , the key ordering approach proved sufficient for true fullscreen on iPad PWA.