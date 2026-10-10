// Copy for the category tabs on the /tools page (shown under the tool grid when a
// category button is selected). Written for the tools that actually exist in each
// category. `lead` takes the tool count; `paragraphs` are rendered in two columns, so
// each category has an even number of them.

export const TOOLS_PAGE_CATEGORY = {
  "image-pdf-tools": {
    lead: (n) =>
      `Need to convert a PDF, shrink a photo or pull text out of a screenshot? These ${n} free image and PDF tools do it right in your browser. There is no upload step, no sign-up and no watermark on your result, so you can finish most jobs in a few clicks.`,
    paragraphs: [
      "PDF to Image turns pages into JPG or PNG, while Image to PDF and Text to PDF go the other way. Image Converter switches between JPG, PNG and WebP and keeps transparent backgrounds, and SVG to PNG gives you a raster copy of vector art at the resolution you choose. Together they cover most format swaps without a desktop app.",
      "Image Compressor offers lossy and lossless modes and works on a whole batch. Image Resizer sets exact pixels or a percentage with the aspect ratio locked, and Bulk Image Resizer hands many files back as one ZIP. Image Crop Tool trims freehand or to a fixed ratio, which helps when a website or form asks for specific dimensions.",
      "Image to Text (OCR) and Screenshot to Text read the characters out of a picture on your device, so you can copy a quote from a scanned page or a phone photo instead of retyping it. Clear, well lit images with printed text give the best results, and handwriting is much harder for any OCR tool to read.",
      "Background Remover cuts the background out of a photo automatically. Image Watermark Adder stamps text or a logo on one image or a batch, Photo Collage Maker drops pictures into grid layouts, Meme Generator adds captions, and Favicon Generator builds every icon size a website needs. All of them work without a design app.",
    ],
    faq: [
      {
        q: "How do I convert a PDF to JPG or PNG for free?",
        a: "Open PDF to Image Converter, add your PDF, choose JPG or PNG and download the pages. It runs in your browser, so there is no sign-up and no upload. Pick PNG for sharp text and JPG when you want a smaller file.",
      },
      {
        q: "How can I reduce an image's file size without losing quality?",
        a: "Use Image Compressor in lossless mode to keep every pixel, or lossy mode for a much smaller file with a small quality trade. Resizing the image to the dimensions you actually need also cuts the file size a lot.",
      },
      {
        q: "Are my files uploaded when I use these tools?",
        a: "No. Image and PDF files are processed on your own device, so your documents are not sent to a server. Large files depend on your device's memory, so a laptop copes with big PDFs better than an older phone.",
      },
      {
        q: "How accurate is the image to text tool?",
        a: "It works best on clear, high contrast images with printed text. Blurry photos, curved pages, unusual fonts and handwriting lower the accuracy, so read the result through and fix any mistakes before you use it.",
      },
      {
        q: "Can I use these tools on my phone?",
        a: "Yes. They work in mobile browsers, including picking photos straight from your camera roll. For big batches or long PDFs a laptop is faster, because all the work happens on your own device.",
      },
    ],
  },

  "video-audio-tools": {
    lead: (n) =>
      `Compress a video, trim an audio clip, make a short looping animation or record your screen with these ${n} free video and audio tools. They run in your browser, so your clips stay on your device, and there is no sign-up, no watermark and no upload wait.`,
    paragraphs: [
      "Video Compressor re-encodes your clip in the browser with simple presets. Balanced scales it to 75 percent at 30 fps, Ultra Compress goes smaller still, and High Quality keeps full size. It shows an estimated size before you start. The output is a WebM file, and one run handles the first 45 seconds of a clip.",
      "GIF Maker trims a video and renders a short looping animation. You choose the start and end, frame rate, size and play order, including reverse and ping pong. The result downloads as a WebM file rather than a true .gif, so run it through a converter if a chat app insists on GIF.",
      "Audio Trimmer cuts a file down to the exact section you need, with fade in, fade out and gain controls. It exports a 16-bit WAV with the same sample rate as the original, which suits ringtones, sound bites and podcast clips. WAV files are bigger than MP3, so convert afterwards if size matters.",
      "Screen Recorder captures a full screen, a window or a browser tab at 30 or 60 fps, with optional microphone and system audio. You can pause and resume, then download a WebM file. System audio works best when you share a Chrome tab, and there is no webcam overlay, so record your camera separately.",
    ],
    faq: [
      {
        q: "How do I compress a video for WhatsApp or email?",
        a: "Choose Ultra Compress in Video Compressor and check the estimated size first. Gmail allows attachments up to 25 MB and WhatsApp limits videos sent as media to about 16 MB. Trimming the clip before you compress shrinks the file the most.",
      },
      {
        q: "Why do these tools save WebM instead of MP4 or GIF?",
        a: "They use your browser's built in recorder, which outputs WebM. It plays in Chrome, Edge, Firefox and VLC. If an app needs MP4 or GIF, run the downloaded file through a converter.",
      },
      {
        q: "Does the screen recorder capture sound?",
        a: "Yes. Tick System Audio for computer sound and Microphone for your voice. In Chrome, tick Share tab audio in the browser prompt to record a tab's sound. Full screen system audio mainly works on Windows and ChromeOS.",
      },
      {
        q: "Are my videos or recordings uploaded anywhere?",
        a: "No. Compressing, trimming and recording all happen in your browser. The finished file goes only to your own downloads folder.",
      },
      {
        q: "Is there a length limit for clips?",
        a: "Video Compressor handles the first 45 seconds per run and GIF Maker stops at 120 frames. Screen Recorder has no built in limit, but long sessions use a lot of memory, so record in parts.",
      },
    ],
  },

  "text-writing-tools": {
    lead: (n) =>
      `Count words, change case, compare drafts, clean up pasted text or turn writing into speech with these ${n} free text and writing tools. Everything runs in your browser, so you can paste in as much text as you like without an account or a daily limit.`,
    paragraphs: [
      "Word Counter shows words, characters and paragraphs along with reading time, and Character Counter checks your text against live limits for X, SMS and meta descriptions. Readability Score Checker gives the Flesch-Kincaid grade of your writing, so you can see whether it suits your audience before you publish.",
      "Case Converter switches between uppercase, lowercase, title case and more. Duplicate Line Remover, Text Sorter and Whitespace Remover clean up lists and text copied from PDFs or spreadsheets, and Text Reverser, Text Repeater and Letter Frequency Counter handle the smaller jobs that come up while editing.",
      "Fancy Text Generator makes stylish fonts for bios and posts, and Hashtag Generator and Instagram Bio Generator suggest ideas from your keywords. Slug Generator turns a title into a clean URL, and Text to Handwriting puts typed text on paper style backgrounds for notes, mockups and creative projects.",
      "Text Diff Checker highlights exactly what changed between two versions of a text. Text to Speech turns writing into spoken audio, and Morse Code Translator, NATO Phonetic Alphabet Converter, Pig Latin Translator and Anagram Solver cover reference and wordplay. Speech to Text is coming soon.",
    ],
    faq: [
      {
        q: "What is the easiest way to count words and characters?",
        a: "Paste your text into Word Counter and you get words, characters and paragraphs straight away, plus reading time. For platform limits, use Character Counter, which tracks X, SMS and meta description limits as you type.",
      },
      {
        q: "Is there a limit on how much text I can paste?",
        a: "There is no set limit. Text is processed in your browser, so very long documents depend on your device's memory, but normal articles and essays work smoothly.",
      },
      {
        q: "How do I remove duplicate lines or extra spaces from a list?",
        a: "Paste the list into Duplicate Line Remover to drop repeated or blank lines, then use Whitespace Remover to strip extra spaces and tabs. Text Sorter can then put what is left in alphabetical order.",
      },
      {
        q: "How do I check how easy my writing is to read?",
        a: "Use Readability Score Checker to get the Flesch-Kincaid grade level. A lower grade means easier reading, and shorter sentences with plain words bring the score down. Aim for the level your readers are comfortable with.",
      },
      {
        q: "Do you save the text I type?",
        a: "No. Text is handled in your browser as you type or paste it, and nothing is stored once you close the tab.",
      },
    ],
  },

  "developer-tools": {
    lead: (n) =>
      `Format JSON, decode a JWT, test a regex, convert CSV to JSON or generate a UUID with these ${n} free developer tools. They run in your browser, so the code, tokens and payloads you paste in stay on your device while you debug, with no account and no waiting.`,
    paragraphs: [
      "JSON Formatter & Validator, XML Formatter & Validator, SQL Formatter / Minifier and the HTML, CSS and JS formatters make messy code readable, or small enough for production. The validators point to the line where a syntax error sits instead of just telling you that something is broken.",
      "JSON to CSV, CSV to JSON and YAML to JSON handle data format swaps, and Markdown to HTML and HTML to Markdown convert content both ways. JSON Diff Checker shows what changed between two objects, while Number Base Converter, Text to Binary and Data Storage Converter answer the small encoding and unit questions.",
      "JWT Decoder shows a token's header, payload and expiry. URL Encoder/Decoder and Base64 Encoder/Decoder unpack encoded strings, and Hash Generator makes MD5, SHA-1 and SHA-256 hashes from text or files. UUID/GUID Generator creates v4 IDs in bulk, and Regex Tester highlights matches live as you type.",
      "CSS Gradient Generator, CSS Box-Shadow Generator and CSS clamp() Calculator give you copy-ready CSS. Meta Tags Generator, Robots.txt Generator, XML Sitemap Generator and .htaccess Generator cover SEO and server files, and Cron Expression Generator explains a schedule in plain English. Fake Data Generator fills test databases.",
    ],
    faq: [
      {
        q: "How do I format and validate JSON online?",
        a: "Paste it into JSON Formatter & Validator. It pretty prints the data with syntax highlighting and shows an error with the location if the JSON is invalid. You can also minify it down to a single line.",
      },
      {
        q: "Does the JWT decoder verify the signature?",
        a: "No. It decodes the token and shows the header, payload and expiry so you can read the claims. It does not verify the signature, so use a JWT library on your server for that step.",
      },
      {
        q: "Is it safe to paste API responses or tokens?",
        a: "The tools process input in your browser instead of sending it to a server. Even so, avoid pasting live production secrets on a shared computer, and rotate any key that has been exposed in a screenshot or recording.",
      },
      {
        q: "Which tool converts JSON to CSV and back?",
        a: "JSON to CSV flattens nested objects and shows a live preview, and CSV to JSON Converter turns rows into flat or nested JSON. YAML to JSON Converter handles config files in both directions.",
      },
      {
        q: "Can the tools handle large files?",
        a: "Everything runs on your device, so speed depends on your computer, not a server queue. Typical API responses and config files format in well under a second, while very large files may slow down a phone.",
      },
    ],
  },

  calculators: {
    lead: (n) =>
      `Work out a loan payment, your BMI, take home pay or a unit conversion with these ${n} free calculators and converters. Each one shows the formula behind the answer, runs in your browser and needs no sign-up, so you can check the working instead of trusting a single number.`,
    paragraphs: [
      "Loan, Mortgage, Car Loan and EMI calculators show monthly payments, and EMI adds a prepayment and amortization schedule. Compound Interest, Simple Interest, Investment Return, Retirement Savings, 401(k) and 529 College Savings calculators project how money grows, while Debt Payoff compares the snowball and avalanche methods.",
      "Salary / Take-Home Pay, Hourly to Salary, Overtime Pay and Freelance Hourly Rate calculators cover income. Profit Margin, Break-Even, Discount, Tip and Bill Splitter calculators handle business and shopping maths, and Invoice Generator makes a PDF invoice. Property Tax, Car Depreciation and Lease vs Buy help with big purchases.",
      "BMI, Calorie (TDEE), Macro, Water Intake and Heart Rate Zone calculators cover health numbers, and GPA Calculator handles weighted credits and custom grading scales. Age Calculator, Date Difference, Work Days and Time Duration calculators sort out dates, deadlines and hours without counting on a calendar.",
      "Unit Converter, Currency Converter with live exchange rates, Shoe, Clothing and Ring Size converters, Oven Temperature Converter and Roman Numeral Converter handle everyday conversions. Percentage and Scientific calculators cover quick maths, and the Social Security Full Retirement Age and Love calculators round out the set.",
    ],
    faq: [
      {
        q: "Are these calculators accurate enough for real decisions?",
        a: "They use standard public formulas, so they are good for planning and comparing options. For tax, legal or lending decisions, confirm the final figure with your lender, accountant or an official source.",
      },
      {
        q: "Which calculator shows my monthly loan payment?",
        a: "Loan Calculator works for any loan, Mortgage Calculator adds taxes and insurance, Car Loan Calculator handles trade-in and down payment, and EMI Calculator shows an amortization schedule with prepayments.",
      },
      {
        q: "Is my financial information saved or shared?",
        a: "No. Calculations run in your browser and the numbers you enter are not stored. The one tool that goes online is Currency Converter, which fetches live exchange rates.",
      },
      {
        q: "How do I estimate my take home pay?",
        a: "Enter your gross pay in Salary / Take-Home Pay Calculator and it estimates what is left after common deductions. Real figures depend on your local tax rules and benefits, so treat it as an estimate and check your payslip.",
      },
      {
        q: "Do the calculators show how the answer was worked out?",
        a: "Yes. The formula or working sits next to the result, so you can check the maths and see which input changes the answer the most.",
      },
    ],
  },

  "generators-security": {
    lead: (n) =>
      `Generate a strong password, a QR code, a random team or a name idea with these ${n} free generators and random tools. Everything is created on your device, so what you generate is not stored or sent anywhere, and there is no sign-up to use any of it.`,
    paragraphs: [
      "Secure Password Generator makes random passwords and shows an entropy strength meter, and Passphrase Generator builds memorable Diceware style phrases. Longer is almost always stronger, and a password manager helps you keep a different one for every account. Password Strength Checker and Barcode Generator are coming soon.",
      "QR Code Generator creates custom codes with your logo, colors and several data types. VIN Decoder reads a vehicle's make, model and year, and License Plate Generator creates fictional plates for design work. Countdown Timer Generator makes a shareable countdown to any date and time.",
      "Random Number Generator, Coin Flip & Dice Roller and Random Team Generator give fair results for raffles, classroom picks and game nights. Tournament Bracket Generator builds a printable single elimination bracket for any number of teams, and Typing Speed Test and Reaction Time Test turn a spare minute into a quick challenge.",
      "Business Name, Fantasy Name, Baby Name, Pet Name, Nickname and Gamertag generators help you find a name you actually like. Snow Day Predictor, the US holiday and daylight saving countdowns, Fantasy Points Calculator and Gaming Session Time Calculator add a bit of fun for fans and gamers.",
    ],
    faq: [
      {
        q: "How do I generate a strong password?",
        a: "Open Secure Password Generator, choose a length (12 characters or more is a good start), pick the character types and copy the result. The strength meter shows the entropy, and a password manager makes it easy to keep a unique one for each account.",
      },
      {
        q: "Are the passwords and codes stored anywhere?",
        a: "No. They are created in your browser and are not saved or sent to a server, so there is no history to leak. Copy what you need before you leave the page.",
      },
      {
        q: "Can a phone camera scan the QR codes?",
        a: "Yes. QR Code Generator creates standard codes that any modern phone camera or scanner app can read. Test the code before you print it, especially if you add a logo or use low contrast colors.",
      },
      {
        q: "Is the random team generator fair?",
        a: "It shuffles your list at random and splits it into evenly sized teams, so everyone has the same chance of landing in any team. Run it again for a fresh draw.",
      },
      {
        q: "What is the difference between a password and a passphrase?",
        a: "A password is a short random string of mixed characters. A passphrase joins several random words, which is easier to remember and still strong when it is long enough. Use either one, but never reuse it across sites.",
      },
    ],
  },

  "design-color-tools": {
    lead: (n) =>
      `Pick a color from an image, convert HEX to RGB, build a palette or find the name of a shade with these ${n} free design and color tools. They run in your browser, so your images stay on your device, and every value is ready to paste into CSS, Figma or a style guide.`,
    paragraphs: [
      "Color Picker uses an eyedropper to sample any pixel from an image and shows the value in HEX, RGB and other formats. It also checks the contrast ratio, so you can see whether text will be readable on that color before you commit to it in a design.",
      "HEX to RGB Converter switches between HEX, RGB, HSL and CMYK. That helps when a design file, a CSS rule and a print brief each want a different format. Paste in one value and copy the others, with no need to work the maths out by hand.",
      "Palette Generator extracts a color palette from any image and lets you export it in one click. It is a quick way to match a website or brand to a photo, a product shot or a mood board, and it saves you from sampling each color one at a time.",
      "Color Name Finder returns the closest named color for any HEX or RGB value, which is handy when you need to describe a shade in words. Color Contrast Checker (WCAG) and CSS Gradient Generator in Developer Tools pair well with these when you move from picking colors to building a page.",
    ],
    faq: [
      {
        q: "How do I get the exact color from an image?",
        a: "Upload the image to Color Picker and click the spot you want with the eyedropper. You get the exact value to copy as HEX or RGB.",
      },
      {
        q: "How do I convert HEX to RGB?",
        a: "Enter the HEX code in HEX to RGB Converter and the RGB, HSL and CMYK values appear right away, ready to copy. For example, #FF5733 is rgb(255, 87, 51).",
      },
      {
        q: "How do I check if my text color is readable on a background?",
        a: "Use Color Contrast Checker (WCAG) in Developer Tools, or the contrast check in Color Picker. WCAG AA asks for at least 4.5 to 1 for normal text, and AAA asks for 7 to 1.",
      },
      {
        q: "Is my image uploaded to a server?",
        a: "No. Images are read in your browser, so colors are picked on your own device and nothing is uploaded.",
      },
      {
        q: "Can I export a color palette?",
        a: "Yes. Palette Generator extracts colors from an image and exports them in one click, so you can drop them into your design software or your CSS.",
      },
    ],
  },

  "seo-marketing-tools": {
    lead: (n) =>
      `Tag campaign links, preview social shares, check keyword use and test meta description length with these ${n} free SEO and marketing tools. Run the checks before a page or post goes live, with no sign-up, no watermark and no daily query limit to work around.`,
    paragraphs: [
      "UTM Link Builder adds source, medium and campaign tags to any URL, so your analytics can show which email, ad or post sent each click. Use consistent, lowercase names for each campaign so your reports stay clean, and keep UTM tags off links that stay inside your own site.",
      "Open Graph Preview Generator shows how a link will look when it is shared on Facebook, X or LinkedIn. It helps you catch a missing image, a cut off title or a weak description before the post is public, when it is still easy to fix.",
      "Keyword Density Checker shows how often a keyword or phrase appears in your content, which helps you spot stuffing. Meta Description Length Checker tells you whether a title or description will get cut off in search results. Treat both as a quick sanity check, not a ranking formula.",
      "For deeper work, pair them with Meta Tags Generator, Robots.txt Generator and XML Sitemap Generator in Developer Tools. X/Twitter Thread Splitter breaks long text into numbered, tweet sized posts, so a thread goes out in the right order without you counting characters by hand.",
    ],
    faq: [
      {
        q: "What is a UTM link and why use one?",
        a: "A UTM link is a normal URL with extra tags for source, medium and campaign. When someone clicks it, tools like Google Analytics record where the visit came from, so you can compare emails, ads and social posts.",
      },
      {
        q: "Do UTM parameters hurt SEO?",
        a: "Usually not, because search engines treat the tagged URL as a copy of the page, and a canonical tag helps with that. Use UTM tags for external campaigns, not for links inside your own site.",
      },
      {
        q: "How long should a meta description be?",
        a: "Around 130 to 155 characters is a safe range. Shorter wastes space, and longer can be cut off with an ellipsis in search results. Meta Description Length Checker measures yours.",
      },
      {
        q: "What is a good keyword density?",
        a: "There is no official number. Use your main phrase naturally and treat a very high count as a warning for keyword stuffing. Keyword Density Checker shows repetition that would read badly to a person.",
      },
      {
        q: "Why does my link preview look wrong on social media?",
        a: "Usually the Open Graph image, title or description is missing or the wrong size, so the platform guesses from the page. Preview it first, fix the tags, then ask the platform to refresh its cache for the link.",
      },
    ],
  },

  "life-everyday-tools": {
    lead: (n) =>
      `Plan a trip, scale a recipe, check a pet's age or food safety, estimate a due date or budget a wedding with these ${n} free everyday tools. They run in your browser, with no sign-up and no limit on how often you recalculate as your plans change.`,
    paragraphs: [
      "Dog Age and Cat Age calculators convert pet years to human years. Can My Dog Eat This? checks whether a food is safe, and the Pet Calorie Needs and Dog Walking Time calculators help with daily care. They give general guidance only, so ask your vet about anything specific to your pet.",
      "Pregnancy Due Date Calculator estimates a due date and trimester timeline, and Baby Feeding Schedule Generator, Diaper Changes Estimator and Child Growth Percentile Checker support early parenting. Sleep Cycle Bedtime, Running Pace, Cycling Speed, Standing vs Sitting and Stretching Routine tools cover everyday fitness.",
      "Recipe Scaler, Baking Conversion, Coffee to Water Ratio, Cooking Time and Freezing Time tools help in the kitchen. Paint Quantity, Carpet Area, Moving Box, Garden Soil and Electricity Bill estimators help with home projects, and Wedding Budget, Party Food and Event Seating planners take care of events.",
      "Road Trip Cost, Luggage Weight, Travel Budget, Flight CO2 and Timezone Meeting planners cover travel. Study Time, Reading Time, Grade Percentage and GPA to Percentage tools help students, and Carbon Footprint, Plastic Usage, Tree Planting, Recycling Savings and EV vs Petrol calculators show your impact.",
    ],
    faq: [
      {
        q: "Is the dog food checker a replacement for a vet?",
        a: "No. It gives a quick reference for common foods. If your dog has eaten something risky, call your vet or a pet poison helpline straight away.",
      },
      {
        q: "How accurate is the pregnancy due date calculator?",
        a: "It uses the standard method based on the first day of your last period, the same starting point many doctors use. An ultrasound or your provider's date is more precise, so treat this as an estimate.",
      },
      {
        q: "How do I convert my dog's age to human years?",
        a: "Dog Age Calculator counts the first two years as 15 and then 24 human years, then adds 4 to 7 years for every dog year depending on size. In this model, bigger dogs age faster than small ones.",
      },
      {
        q: "Can I plan a trip or wedding budget here?",
        a: "Yes. Travel Budget Planner builds a total from daily accommodation, food and transport costs, and Wedding Budget Calculator splits a budget by guest count and category, so you can see where the money goes before you commit.",
      },
      {
        q: "Is my personal information stored?",
        a: "No. Everything you enter is calculated in your browser and is not sent anywhere, including pet, pregnancy and budget details.",
      },
    ],
  },
};
