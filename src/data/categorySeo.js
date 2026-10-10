// Per-category SEO copy, written specifically for the real tools in each category
// (not a generic template). Used by the category description shown on the homepage
// cards and category page meta description, plus the "About this category" intro
// and FAQ block on /category/<slug>.
//
// `description` doubles as the homepage card excerpt and the page meta description,
// so it's kept to roughly 130-155 characters.
// `intro` is [lead, ...4 supporting paragraphs] rendered by AboutSection.
// `faq` is 4 { q, a } items rendered by FaqAccordion.

export const CATEGORY_SEO = {
  "image-pdf-tools": {
    description:
      "Convert PDFs to images, compress and resize photos, remove backgrounds, add watermarks and pull text out of scanned pages, free and in your browser.",
    intro: [
      "Image & PDF Tools covers the file-level jobs that come up almost every day: turning a PDF into JPGs, shrinking a photo before you email it, pulling text out of a screenshot, or stripping the background off a product photo. All 16 tools run as JavaScript in your own browser tab, so a file never has to leave your device just to get resized or converted.",
      "PDF to Image Converter and Image to PDF cover the most common back-and-forth between the two formats, while Image Compressor and Bulk Image Resizer handle the cleanup work that follows, shrinking file sizes or resizing a whole batch at once without opening a desktop editor.",
      "Image to Text (OCR) and Screenshot to Text read the actual characters out of a picture, which saves retyping a quote from a scanned page or a paragraph you only have as a phone photo.",
      "Background Remover, Image Watermark Adder and Photo Collage Maker handle editing tasks people usually reach for Photoshop or a paid app for, at no cost and with no export watermark of their own.",
      "Favicon Generator and SVG to PNG Converter round out the set for anyone building a website who needs an icon set or a rasterized image from vector art.",
    ],
    faq: [
      {
        q: "Do I need to upload my files to a server?",
        a: "No. Every tool in this category processes your file directly in your browser. Nothing is uploaded, which matters if the document contains anything private.",
      },
      {
        q: "Is there a file size limit?",
        a: "There's no server-enforced cap, since nothing uploads. Very large files are limited only by your own device's memory, so a modest phone may struggle where a laptop won't.",
      },
      {
        q: "Can I use these tools on my phone?",
        a: "Yes, all of them work in a mobile browser. Image Crop Tool and Photo Collage Maker in particular are often used straight from a phone's camera roll.",
      },
      {
        q: "Will converting a PDF to images lose quality?",
        a: "PDF to Image Converter lets you choose the output resolution, so you can export at a high DPI for print or a smaller size for web use without unnecessary compression.",
      },
    ],
  },

  "video-audio-tools": {
    description:
      "Shrink video files, trim audio clips, turn a clip into a GIF and record your screen, processed locally with nothing uploaded to a server.",
    intro: [
      "Video & Audio Tools is a small, focused set, four tools that cover the editing tasks people need most often: making a video small enough to send, cutting an audio file down to the clip you actually want, turning a short recording into a GIF, and capturing your own screen.",
      "Video Compressor reduces file size for sharing over email or messaging apps that choke on large uploads, while keeping the result watchable rather than aggressively degraded.",
      "GIF Maker converts a short video clip into a looping GIF, trimmed to the exact section you select, which is faster than exporting from a video editor for something that small.",
      "Audio Trimmer cuts a clip down to a precise start and end point, useful for pulling a ringtone, a sound bite or a podcast excerpt out of a longer recording.",
      "Screen Recorder captures your screen directly through the browser and lets you download the result, with nothing recorded going anywhere except your own downloads folder.",
    ],
    faq: [
      {
        q: "Does compressing a video reduce its quality?",
        a: "Some quality loss is unavoidable with compression, but Video Compressor is tuned to cut file size significantly while keeping the result clearly watchable rather than blocky.",
      },
      {
        q: "Can I record my screen without installing software?",
        a: "Yes. Screen Recorder uses your browser's own recording capability, so there's nothing to download or install beyond opening the page.",
      },
      {
        q: "Is there a maximum clip length for the GIF maker?",
        a: "Longer source clips produce larger GIF files, so very long videos may run slowly. For a typical short clip of a few seconds to a minute, it runs smoothly.",
      },
      {
        q: "Are my video or audio files uploaded anywhere?",
        a: "No. All four tools process files locally in your browser. Nothing is sent to a server during compression, trimming or recording.",
      },
    ],
  },

  "text-writing-tools": {
    description:
      "Count words and characters, convert case, check readability, translate Morse code and clean up messy text for writing, social posts and everyday typing.",
    intro: [
      "Text & Writing Tools covers the small, constant tasks around working with text: counting words against a limit, fixing inconsistent capitalization, checking how readable a draft actually is, or cleaning up text copied from somewhere that left extra line breaks and spaces behind.",
      "Word Counter and Character Counter track length against real platform limits, including the 280-character cap on X/Twitter, which matters when a caption or post needs to fit exactly.",
      "Case Converter, Duplicate Line Remover, Text Sorter and Whitespace Remover handle the repetitive cleanup that comes up when text is copied from a PDF, a spreadsheet or another app and arrives with formatting you don't want.",
      "Readability Score Checker and Text Diff Checker help before anything gets published: one scores how easy a draft is to read, the other shows exactly what changed between two versions of the same text.",
      "A handful of tools cover more specific needs: Morse Code Translator and NATO Phonetic Alphabet Converter for reference and learning, Pig Latin Translator and Anagram Solver for wordplay, and Text to Speech and Speech to Text for converting between typed and spoken text.",
    ],
    faq: [
      {
        q: "Is there a limit on how much text I can paste in?",
        a: "No. Since processing happens in your browser rather than on a server, you can paste in anything from a sentence to a full document without hitting a size cap.",
      },
      {
        q: "Do these tools store or save what I type?",
        a: "No. Text is processed locally as you type or paste it in, and nothing is saved or transmitted once you close the tab.",
      },
      {
        q: "Which tool checks character limits for social media?",
        a: "Character Counter tracks platform-specific limits, including X/Twitter's 280-character cap, so you can see exactly how close you are before you post.",
      },
      {
        q: "Can I use these tools to clean up text copied from a PDF or spreadsheet?",
        a: "Yes. Whitespace Remover, Duplicate Line Remover and Text Sorter are built for exactly that kind of cleanup, where copied text brings along extra spacing or repeated lines.",
      },
    ],
  },

  "developer-tools": {
    description:
      "Format and validate JSON, XML and SQL, decode JWTs, generate hashes and UUIDs, and handle the small utilities that come up constantly during development.",
    intro: [
      "Developer Tools collects the utilities that come up in almost every project: formatting minified JSON or CSS so it's readable, validating a config file's syntax, decoding a JWT to check its payload, or converting data between CSV, JSON, YAML and XML.",
      "JSON Formatter & Validator, XML Formatter & Validator and SQL Formatter / Minifier handle the most common formatting and validation work, pointing out exactly where a syntax error is rather than just saying something is broken.",
      "URL Encoder/Decoder, Base64 Encoder/Decoder and JWT Decoder solve the recurring problem of staring at an encoded string, whether it's a tracking link, an API payload or an auth token, and needing to read what's actually inside it.",
      "Hash Generator, UUID/GUID Generator and Cron Expression Generator cover small tasks that are easy to get wrong by hand: hashing a string correctly, generating a properly formatted UUID, or writing a cron expression that actually fires on schedule.",
      "A set of CSS-focused generators (CSS Gradient Generator, CSS Box-Shadow Generator, CSS clamp() Calculator) and site utilities (Robots.txt Generator, XML Sitemap Generator, .htaccess Generator) round out the category for front-end and deployment work.",
    ],
    faq: [
      {
        q: "Is my code or data sent to a server when I use these tools?",
        a: "No. Parsing, formatting and validation all run in your browser's own JavaScript engine, which matters when you're pasting in something like an API key or a token you'd rather not upload anywhere.",
      },
      {
        q: "Can I use the JSON formatter on a large API response?",
        a: "Yes. Since everything runs client-side, performance depends on your device rather than a server queue, so even a sizeable response formats in well under a second on most machines.",
      },
      {
        q: "Does the JWT decoder verify the token's signature?",
        a: "No, it decodes and displays the header and payload so you can read the claims inside, but it doesn't verify the signature. Use a dedicated JWT library for signature verification.",
      },
      {
        q: "Which tool should I use to convert between JSON, CSV, XML and YAML?",
        a: "JSON to CSV, CSV to JSON Converter, YAML to JSON Converter and XML Formatter & Validator cover the common conversions. Check the specific tool for the direction you need.",
      },
    ],
  },

  calculators: {
    description:
      "Work out your BMI, loan payments, GPA, take-home pay and dozens of other everyday numbers, with the formula shown alongside every result.",
    intro: [
      "Calculators & Converters is the largest category on Toolslay, 45 tools covering finance, health, school and everyday unit conversion. Each one shows the formula or method behind the answer, so you're not just trusting a black-box number.",
      "Loan Calculator, Mortgage Calculator, EMI Calculator and Compound Interest Calculator cover the core finance math people look up before a major purchase, alongside more specific tools like Car Depreciation Calculator and Lease vs Buy Car Calculator.",
      "BMI Calculator, Calorie Calculator (TDEE), Macro Calculator and Heart Rate Zone Calculator cover health and fitness numbers, while GPA Calculator and 529 College Savings Growth Calculator handle school and education planning.",
      "Salary / Take-Home Pay Calculator, Freelance Hourly Rate Calculator and Overtime Pay Calculator cover income and pay math, useful for checking a job offer, setting a freelance rate or verifying a paycheck.",
      "Everyday conversions round out the set: Unit Converter, Currency Converter, Shoe Size Converter, Clothing Size Converter and Oven Temperature Converter, for the smaller numbers that come up while shopping, cooking or traveling.",
    ],
    faq: [
      {
        q: "Are the calculators accurate for official or legal use?",
        a: "They're built for quick, practical estimates using standard public formulas. For anything with legal or tax consequences, such as a mortgage closing or a tax filing, confirm the figure with a licensed professional or official source.",
      },
      {
        q: "Do I need to enter my financial details anywhere unsafe?",
        a: "No. Every calculation runs locally in your browser. Numbers you enter, including income, loan amounts or savings figures, are never transmitted to or stored on a server.",
      },
      {
        q: "Which calculator should I use to check a loan payment?",
        a: "Loan Calculator covers general loans, Mortgage Calculator is built specifically for home loans with property tax and insurance fields, and Car Loan Calculator handles auto-loan specific inputs like trade-in value.",
      },
      {
        q: "Can I use these on mobile while shopping or at a bank?",
        a: "Yes, all of the calculators work on mobile browsers, which is common for things like Discount Calculator and Tip Calculator that get used in the moment, out shopping or at a restaurant.",
      },
    ],
  },

  "generators-security": {
    description:
      "Generate strong passwords, QR codes, barcodes and fair random picks for names, teams and raffles, all created locally in your browser.",
    intro: [
      "Generators & Random Tools covers two related needs: creating something secure, like a password or passphrase, and creating something fairly random, like a name drawn from a list or a dice roll. Both rely on your browser's cryptographic random number source rather than a weaker pseudo-random fallback.",
      "Secure Password Generator, Passphrase Generator and Password Strength Checker cover account security, letting you generate a strong credential and then check how resistant it actually is to guessing.",
      "QR Code Generator and Barcode Generator produce scannable codes for links, Wi-Fi details or product codes, while VIN Decoder reads the structured data encoded in a vehicle identification number.",
      "Wheel of Names / Random Picker, Coin Flip & Dice Roller and Random Team Generator handle fair, verifiable random selection for classrooms, raffles, games and splitting people into teams.",
      "A set of naming tools, Business Name Generator, Fantasy Name Generator, Baby Name Generator and Pet Name Generator, help with the harder problem of finding a name you actually like rather than just a random one.",
    ],
    faq: [
      {
        q: "Are the generated passwords actually secure?",
        a: "Yes. Secure Password Generator uses your browser's cryptographically secure random number source, the same standard used by password managers, and nothing generated is logged or transmitted anywhere.",
      },
      {
        q: "Is the random picker in Wheel of Names truly fair?",
        a: "The stopping point is determined by a cryptographically secure random value, giving every entry on the wheel an equal, unbiased chance regardless of its position.",
      },
      {
        q: "Do you store any of the passwords or codes I generate?",
        a: "No. Generation happens entirely in your browser. There's no database or history of what you've generated, not on our end and not in your account, since there is no account.",
      },
      {
        q: "Can I scan the QR and barcode outputs with a regular phone camera?",
        a: "Yes, both generate standard-format codes readable by any modern phone's built-in camera or a dedicated scanning app, no special reader required.",
      },
    ],
  },

  "design-color-tools": {
    description:
      "Pick exact colors from an image, convert between HEX and RGB, build a matching palette and identify any color by name, all in your browser.",
    intro: [
      "Design & Color Tools is a small set built around one recurring task: getting the exact color value you need, whether that's picking it out of an image, converting it to a different format, or finding a name for a color you're trying to describe.",
      "Color Picker samples an exact pixel from an uploaded image and returns its HEX, RGB and HSL values, along with a WCAG contrast check against white or black text.",
      "HEX to RGB Converter handles the format conversion directly when you already have a value and just need it in a different notation for CSS, design software or a style guide.",
      "Palette Generator builds a coordinated set of colors from a starting value, useful for a website theme, a brand palette or matching an existing design.",
      "Color Name Finder works in the other direction, taking a HEX or RGB value and returning the closest named color, handy when you need to describe a shade in words rather than a code.",
    ],
    faq: [
      {
        q: "Can I pick a color from a photo I upload?",
        a: "Yes, Color Picker lets you upload an image and click anywhere on it to sample the exact pixel color underneath your cursor.",
      },
      {
        q: "Does the color picker check accessibility contrast?",
        a: "Yes, it includes a WCAG contrast ratio check against both white and black text, so you can confirm a color works for body text or needs adjusting.",
      },
      {
        q: "Is my uploaded image sent to a server?",
        a: "No. Images are read and sampled directly in your browser using the Canvas API. Nothing is uploaded anywhere.",
      },
      {
        q: "What formats can I convert colors between?",
        a: "HEX to RGB Converter covers HEX and RGB directly, and Color Picker additionally shows HSL values for any sampled or entered color.",
      },
    ],
  },

  "seo-marketing-tools": {
    description:
      "Build UTM tracking links, preview how a page looks when shared, check keyword density and meta description length before a page goes live.",
    intro: [
      "SEO & Marketing Tools covers the on-page checks worth running before content or a campaign goes live: tagging a link so you can track where clicks came from, previewing how a page looks when shared on social media, and checking that a meta description or keyword usage falls in a sensible range.",
      "UTM Link Builder adds source, medium and campaign tags to any URL, so Google Analytics or another platform can attribute clicks back to the specific email, ad or post that sent them.",
      "Open Graph Preview Generator shows exactly how a page's title, description and image will look when shared on platforms like Facebook, LinkedIn or X, which catches a missing image or an awkwardly truncated title before it goes live.",
      "Keyword Density Checker and Meta Description Length Checker run quick on-page checks, flagging keyword stuffing on one side and a meta description that's too short or will get truncated in search results on the other.",
      "X/Twitter Thread Splitter breaks a longer piece of writing into individually sized posts that fit the platform's character limit, numbered in order so a thread posts cleanly.",
    ],
    faq: [
      {
        q: "Do UTM tags affect my page's SEO ranking?",
        a: "No. Search engines generally treat a tagged URL as a copy of the original page, and a canonical tag keeps them from treating it as duplicate content. Reserve UTM tags for ads, emails and social posts rather than internal links.",
      },
      {
        q: "Why would my page preview look wrong when shared on social media?",
        a: "Usually a missing or incorrectly sized Open Graph image, or a title and description that weren't set at all, causing the platform to guess from the page content instead.",
      },
      {
        q: "What's a safe keyword density to aim for?",
        a: "There's no single official number, but Keyword Density Checker flags unusually high repetition that reads as keyword stuffing, which search engines can penalize rather than reward.",
      },
      {
        q: "How long should a meta description be?",
        a: "Generally 130 to 155 characters. Shorter risks wasting space, longer risks getting cut off with an ellipsis in search results. Meta Description Length Checker measures yours against that range.",
      },
    ],
  },

  "life-everyday-tools": {
    description:
      "Plan a trip, scale a recipe, check if a food is safe for your dog, track a pregnancy due date and work out everyday numbers around pets and family.",
    intro: [
      "Life & Everyday Tools is a wide-ranging category, 44 calculators and planners for the numbers that come up around pets, pregnancy, cooking, travel, home projects and events, the kind of math people usually estimate by hand or search for individually.",
      "Pet-focused tools cover a lot of ground: Can My Dog Eat This? (Food Safety Checker), Dog Age to Human Years Calculator, Cat Age to Human Years Calculator and Pet Calorie Needs Calculator, all aimed at everyday pet ownership questions.",
      "Pregnancy Due Date Calculator, Baby Feeding Schedule Generator, Diaper Changes Per Day Estimator and Child Growth Percentile Checker support the early planning and tracking that comes with a new baby.",
      "Kitchen and travel tools handle the practical side of daily life: Recipe Scaler, Baking Conversion Calculator and Coffee to Water Ratio Calculator for cooking, and Road Trip Cost Calculator, Luggage Weight Checker and Travel Budget Planner for getting somewhere.",
      "Home and event planning round out the category with Paint Quantity Calculator, Moving Box Calculator, Wedding Budget Calculator and Party Food Quantity Calculator, alongside environmental tools like Carbon Footprint Calculator and EV vs Petrol Cost Calculator.",
    ],
    faq: [
      {
        q: "Is the dog food safety checker a substitute for a vet's advice?",
        a: "No. It's a quick reference for common foods, not a substitute for veterinary advice. If your dog has already eaten something you're unsure about, contact a vet or an animal poison control line directly.",
      },
      {
        q: "How accurate is the pregnancy due date calculator?",
        a: "It estimates based on standard methods like last menstrual period or conception date, the same starting point a doctor typically uses, but an ultrasound-confirmed date from your provider is more precise.",
      },
      {
        q: "Can I use these tools to plan a budget for travel or a wedding?",
        a: "Yes, Travel Budget Planner and Wedding Budget Calculator are both built for that, letting you break a total down by category so you can see where the money is actually going before you commit to anything.",
      },
      {
        q: "Is my personal data, like pregnancy or pet details, stored anywhere?",
        a: "No. Every calculator in this category runs locally in your browser. Nothing you enter, including personal or health-related figures, is transmitted to or stored on a server.",
      },
    ],
  },
};

export function getCategorySeo(slug) {
  return CATEGORY_SEO[slug] || null;
}
