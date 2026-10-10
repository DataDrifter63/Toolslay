// Run from project root:  node apply-category-seo.mjs
import fs from "node:fs";
const DATA = {
  "image-pdf-tools": {
    "seoTitle": "Free Image & PDF Tools Online",
    "description": "Convert PDF to JPG, compress and resize images, remove backgrounds, add watermarks, and extract text from photos with 16 free image and PDF tools.",
    "intro": [
      "Image and PDF jobs show up in every workday. You need a PDF turned into pictures, a photo shrunk before an email bounces it, or text pulled out of a screenshot. These 16 free tools handle those jobs in your browser, with no software to install and no account to create.",
      "Start with conversion. The PDF to Image Converter turns each page into a JPG or PNG, and Image to PDF merges pictures into one document in the order you choose. Text to PDF builds a clean file from plain text, and the Image Converter switches between JPG, PNG, and WebP while keeping transparent backgrounds intact.",
      "Size and shape come next. The Image Resizer changes dimensions by pixels or percentage with the aspect ratio locked, and the Bulk Image Resizer does the same for a whole folder and hands back a ZIP. The Image Compressor offers lossy and lossless modes, and the Image Crop Tool cuts freeform or to fixed ratios with rotation.",
      "Reading and editing tools cover the rest of the daily work. Image to Text (OCR) and Screenshot to Text pull words out of pictures, while Background Remover cleans up product shots. Image Watermark Adder stamps text or a logo on one photo or a batch, and Photo Collage Maker arranges photos into ready-made grids.",
      "Web builders get two extras. Favicon Generator exports the full icon set that browsers and phones expect, and SVG to PNG Converter rasterizes vector art at any resolution you pick. Meme Generator rounds out the category when you just want a caption on a picture."
    ],
    "faq": [
      {
        "q": "How do I convert a PDF to JPG online?",
        "a": "Open the PDF to Image Converter, add your file, and choose JPG or PNG as the output format. Each page becomes its own image that you can download. Pick a higher resolution when you plan to print the pages and a smaller one for web use."
      },
      {
        "q": "What is the best way to compress an image without losing quality?",
        "a": "Use the Image Compressor in lossless mode when sharpness matters most, since it trims file size without changing pixels. Lossy mode shrinks files much further and works well for photos on websites. Compare the result at full size before you save so you can spot visible artifacts."
      },
      {
        "q": "How do I combine several JPGs into one PDF?",
        "a": "Open Image to PDF, add your pictures, and drag them into the order you want. The tool places each image on its own page and builds one PDF to download. Rename the pictures by number first if you want a predictable page order."
      },
      {
        "q": "Can I extract text from a photo or screenshot?",
        "a": "Yes. Image to Text (OCR) reads the characters in an uploaded picture, and Screenshot to Text accepts an image pasted straight from your clipboard. Clear, high contrast images with straight lines of text give the best results, while blurry or angled shots produce more mistakes."
      },
      {
        "q": "How do I resize an image to an exact pixel size?",
        "a": "Open the Image Resizer, choose pixels as the unit, and type the width and height you need. Lock the aspect ratio to avoid stretching the picture. For a fixed shape such as a square profile photo, crop first with the Image Crop Tool, then resize."
      },
      {
        "q": "What is the difference between JPG, PNG, and WebP?",
        "a": "JPG suits photos because it compresses well, but it has no transparency. PNG keeps sharp edges and transparent backgrounds, which fits logos and screenshots. WebP is a newer format that usually produces smaller files than either one, and the Image Converter switches between all three."
      },
      {
        "q": "How do I remove the background from a photo?",
        "a": "Upload the picture to Background Remover and wait for it to detect the subject and cut away the rest. Download the result as a PNG to keep the transparent area. Photos with a clear subject and good lighting give the cleanest edges."
      },
      {
        "q": "What size should a favicon be?",
        "a": "Browsers use several sizes, from 16 by 16 pixels for tabs up to 180 by 180 for Apple touch icons and larger sizes for Android. Favicon Generator exports the whole set from one image, so start with a square picture of at least 512 pixels."
      }
    ]
  },
  "video-audio-tools": {
    "seoTitle": "Free Video & Audio Tools Online",
    "description": "Compress video files, turn clips into GIFs, trim MP3 and WAV audio, and record your screen with four free video and audio tools that run in your browser.",
    "intro": [
      "Video and audio files cause small problems with big consequences. An email will not send a 200 MB clip, a podcast intro needs ten seconds cut, and a tutorial needs a screen recording by lunch. These four free tools cover those jobs in your browser, so you skip heavy editing software.",
      "Video Compressor shrinks a file while keeping the picture watchable. You upload an MP4, MOV, AVI, or WebM clip, pick a quality level, and download a smaller version that fits chat apps, email limits, and social uploads. Lower quality settings give smaller files, so test one clip before you process a batch.",
      "GIF Maker turns a short video into a looping animated GIF. You trim the start and end, set the frame rate and size, and download the result. Short clips with a lower frame rate keep the file light enough for forums, documentation, and messaging apps.",
      "Audio Trimmer cuts a clip down to the part you need. You drag markers on the waveform, preview the section, and export it as a new file. It works with common formats such as MP3, WAV, AAC, and OGG, which makes it handy for ringtones, voice notes, and sound effects.",
      "Screen Recorder captures your full display, one window, or a single browser tab, with microphone audio when you want narration. You stop the recording, download the video, and share it with a teammate or student. All four tools suit quick jobs, while long films still belong in a full editor."
    ],
    "faq": [
      {
        "q": "How do I compress a video to send by email?",
        "a": "Open Video Compressor, add your file, and choose a lower quality level. Most email services cap attachments near 25 MB, so aim for a file below that size. Test a short clip first to find the best balance between size and clarity."
      },
      {
        "q": "What video formats can I compress online?",
        "a": "Video Compressor accepts common formats including MP4, MOV, AVI, and WebM. MP4 is the safest choice for sharing because nearly every phone, browser, and chat app plays it. Convert unusual formats to MP4 before you upload them to a social platform."
      },
      {
        "q": "How do I turn a video into a GIF?",
        "a": "Open GIF Maker, upload your clip, and drag the trim handles to the exact moment you want. Set the frame rate and output size, then export the GIF. Keep clips under ten seconds and use a smaller width so the file stays easy to share."
      },
      {
        "q": "Why is my GIF file so large?",
        "a": "GIFs store every frame as an image, so long clips, high frame rates, and large dimensions add up fast. Cut the clip shorter, lower the frame rate to around 10 or 12, and reduce the width. Those three changes usually cut the size by more than half."
      },
      {
        "q": "How do I cut a section out of an MP3 file?",
        "a": "Open Audio Trimmer, load the MP3, and drag the waveform markers around the part you want to keep. Press play to preview the selection, adjust the markers if needed, and export the clip. The original file stays untouched on your device."
      },
      {
        "q": "Which audio formats does the trimmer support?",
        "a": "Audio Trimmer works with MP3, WAV, AAC, and OGG files. MP3 gives small files for sharing, while WAV keeps full quality for editing. Choose the format that matches where you will use the clip, such as a phone ringtone or a video project."
      },
      {
        "q": "Can I record my screen with sound?",
        "a": "Screen Recorder captures your screen, a window, or a tab and can include microphone audio for narration. Pick your sources, start recording, and press stop when you finish. Browsers may ask for permission first, and system sound capture depends on your browser and operating system."
      },
      {
        "q": "What is the best frame rate for screen recordings?",
        "a": "Thirty frames per second suits most tutorials and software demos, and it keeps files at a reasonable size. Use 60 frames per second only for fast action such as gameplay. Lower rates around 15 work for slow walkthroughs where small files matter more."
      }
    ]
  },
  "text-writing-tools": {
    "seoTitle": "Free Text & Writing Tools Online",
    "description": "Count words and characters, convert text case, compare drafts, generate fancy text and bios, and clean messy text with 23 free online writing tools.",
    "intro": [
      "Writers, students, and social media managers all handle small text problems every day. A draft has to hit 500 words, a caption has to fit a character limit, and a pasted list has to be sorted and cleaned. These 23 free tools solve those jobs in a few clicks.",
      "Counting and checking tools come first. Word Counter and Character Counter (Platform Limits) track length against targets, while Readability Score Checker shows how hard your writing is to read. Text Diff Checker compares two versions of a draft, and Letter Frequency Counter breaks any passage into its character counts.",
      "Cleanup tools save time on messy text. Case Converter switches between upper, lower, title, and sentence case, and Duplicate Line Remover and Text Sorter (A-Z) tidy lists. Extra Space / Whitespace Remover strips stray gaps, Text Reverser flips a string, and Slug Generator turns a title into a URL friendly slug.",
      "Creative tools help you stand out online. Fancy Text Generator makes stylish Unicode text for bios and posts, Instagram Bio Generator and Hashtag Generator speed up profile work, and Text to Handwriting produces a handwritten look. Lorem Ipsum Generator fills mockups with placeholder copy.",
      "Language tools cover the fun and practical edges. Text to Speech reads your words aloud, Speech to Text turns spoken words into text, and Morse Code Translator, NATO Phonetic Alphabet Converter, and Pig Latin Translator handle codes and wordplay. Anagram Solver and Text Repeater finish the set."
    ],
    "faq": [
      {
        "q": "How do I count words in a document?",
        "a": "Paste your text into Word Counter and read the live total of words, characters, sentences, and paragraphs. The count updates as you type or edit. Use it to check essay limits, article lengths, and meta descriptions before you submit or publish."
      },
      {
        "q": "What is the character limit for Instagram, X, and other platforms?",
        "a": "Limits change by platform and by post type, from 280 characters for a standard X post to 2,200 for an Instagram caption. Character Counter (Platform Limits) checks your text against these limits, so you can trim a caption before you post."
      },
      {
        "q": "How do I change text to uppercase or title case?",
        "a": "Paste your text into Case Converter and click the format you want, such as UPPERCASE, lowercase, Title Case, or Sentence case. The result appears right away, ready to copy. This fixes text typed with caps lock on without retyping it."
      },
      {
        "q": "How do I remove duplicate lines from a list?",
        "a": "Paste your list into Duplicate Line Remover and run it. Each repeated line is deleted and the first copy stays. Pair it with Text Sorter (A-Z) when you want the cleaned list in alphabetical order, which suits email lists and keyword sets."
      },
      {
        "q": "What is a good readability score?",
        "a": "Most web writing aims for a Flesch Reading Ease score between 60 and 70, which reads as plain English for a general audience. Readability Score Checker also shows grade level. Shorter sentences and simpler words raise the score, while long sentences lower it."
      },
      {
        "q": "How do I compare two versions of a text?",
        "a": "Open Text Diff Checker, paste the original in one box and the revised text in the other, and run the comparison. Added, removed, and changed parts are highlighted. This helps when you review edits from an editor or compare drafts of a contract or article."
      },
      {
        "q": "How do I turn a title into a URL slug?",
        "a": "Paste the title into Slug Generator and it returns a lowercase, hyphenated version without special characters. For example, a title with punctuation becomes a short, clean path. Short slugs that contain your main keyword are easier to read and share."
      },
      {
        "q": "How does a fancy text generator work?",
        "a": "Fancy Text Generator swaps normal letters for similar looking Unicode characters, such as bold, italic, or script styles. You copy the result and paste it into a bio or post. Some apps and screen readers handle these characters poorly, so use them sparingly."
      }
    ]
  },
  "developer-tools": {
    "seoTitle": "Free Developer Tools Online",
    "description": "Format and validate JSON, test regex, decode JWTs, generate hashes and UUIDs, and convert CSV, YAML, and Base64 with 34 free online developer tools.",
    "intro": [
      "Developers repeat the same small tasks all day. A JSON response needs formatting, a regex needs testing, and a token needs decoding before the next meeting. These 34 free tools handle those jobs in one tab, so you skip installs, extensions, and throwaway scripts.",
      "Data tools cover the formats you meet most. JSON Formatter & Validator, XML Formatter & Validator, and SQL Formatter / Minifier turn messy input into readable code and flag syntax errors. JSON to CSV, CSV to JSON Converter, and YAML to JSON Converter move data between formats, while JSON Diff Checker shows exactly what changed between two objects.",
      "Encoding and security tools handle the plumbing. Base64 Encoder/Decoder and URL Encoder/Decoder fix escaped strings, JWT Decoder reads token headers and claims, and Hash Generator (MD5/SHA-256) creates checksums. UUID/GUID Generator makes unique identifiers, and Timestamp Converter, Number Base Converter, and Text to Binary Converter translate values between systems.",
      "Front end tools speed up styling and markup. HTML Formatter/Beautifier, CSS Formatter/Minifier, and JS Formatter/Minifier clean up code, while CSS Gradient Generator, CSS Box-Shadow Generator, and CSS clamp() Calculator write the rules for you. Color Contrast Checker (WCAG) tests accessibility, and Markdown tools convert between Markdown and HTML.",
      "Site setup tools finish the list. Meta Tags Generator, Robots.txt Generator, XML Sitemap Generator, and .htaccess Generator produce files that search engines and servers read. Regex Tester, Cron Expression Generator, Fake Data Generator, and Placeholder Image Generator support testing and design work."
    ],
    "faq": [
      {
        "q": "How do I format and validate JSON online?",
        "a": "Paste your JSON into JSON Formatter & Validator and run it. The tool indents the data for easy reading and points to syntax errors such as a missing comma or an extra bracket. Fix the flagged line and run it again until the JSON validates."
      },
      {
        "q": "What is the difference between JSON and YAML?",
        "a": "JSON uses braces, brackets, and quotes, so it is strict and common in APIs. YAML relies on indentation and reads more cleanly, which makes it popular for configuration files. YAML to JSON Converter moves data from one format to the other without retyping."
      },
      {
        "q": "How do I decode a JWT token?",
        "a": "Paste the token into JWT Decoder and it splits the three parts, then shows the header and payload as readable JSON. You can check claims such as expiry time and issuer. Decoding does not verify the signature, so it cannot prove a token is genuine."
      },
      {
        "q": "What is the difference between MD5 and SHA-256?",
        "a": "MD5 produces a 128 bit hash and is fast, but researchers have found collisions, so it no longer suits security work. SHA-256 produces a 256 bit hash and remains the standard choice. Hash Generator (MD5/SHA-256) creates both for checksums and comparisons."
      },
      {
        "q": "How do I convert a Unix timestamp to a date?",
        "a": "Paste the number into Timestamp Converter (Unix ↔ Date) and read the date and time it represents. You can also enter a date to get its Unix value. A 10 digit value counts seconds, and a 13 digit value counts milliseconds."
      },
      {
        "q": "How do I write a cron expression?",
        "a": "A cron expression has five fields for minute, hour, day of month, month, and day of week. Cron Expression Generator lets you pick a schedule from options and returns the correct string. For example, 0 9 * * 1 runs every Monday at 9:00."
      },
      {
        "q": "How do I test a regular expression?",
        "a": "Open Regex Tester, enter your pattern, and paste sample text to see every match highlighted. Adjust flags such as global or case insensitive to change behavior. Testing against both matching and non matching examples catches patterns that match too much."
      },
      {
        "q": "Which meta tags matter most for SEO?",
        "a": "The title tag and meta description matter most, because search results display them. Open Graph tags control how links look when shared on social networks. Meta Tags Generator builds all of these in one block that you paste into your page head."
      }
    ]
  },
  "calculators": {
    "seoTitle": "Free Online Calculators & Converters",
    "description": "Free calculators for loans, mortgages, salary, BMI, and interest, plus unit and currency converters. Get accurate results from 45 online tools.",
    "intro": [
      "Money, health, and measurement questions come up all the time. How much is this loan going to cost, what is my take home pay, or how many cups are in a liter? These 45 free calculators and converters give you answers with clear inputs and no spreadsheet setup.",
      "Money tools lead the list. Loan Calculator, Mortgage Calculator, EMI Calculator, and Car Loan Calculator show monthly payments and total interest. Compound Interest Calculator, Simple Interest Calculator, and Investment Return Calculator project growth, while Debt Payoff Calculator, Retirement Savings Calculator, and 401(k) Contribution Calculator help you plan ahead.",
      "Work and business tools cover pay and profit. Salary / Take-Home Pay Calculator, Hourly to Salary Converter, Overtime Pay Calculator, and Freelance Hourly Rate Calculator turn rates into real income. Break-Even Calculator, Profit Margin Calculator, Discount Calculator, Invoice Generator, and Bill Splitter Calculator handle daily business math.",
      "Health and daily life tools sit alongside them. BMI Calculator, Calorie Calculator (TDEE), Macro Calculator, Water Intake Calculator, and Heart Rate Zone Calculator support fitness goals. Age Calculator, Date Difference Calculator, Work Days Calculator, and Time Duration Calculator count time, and GPA Calculator and Percentage Calculator help students.",
      "Converters finish the category. Unit Converter, Currency Converter, Roman Numeral Converter, Oven Temperature Converter, and the Shoe, Clothing, and Ring Size converters translate values between systems. Property Tax Estimator, Social Security Full Retirement Age Calculator, 529 College Savings Growth Calculator, and Car Depreciation Calculator cover bigger planning questions."
    ],
    "faq": [
      {
        "q": "How do I calculate my monthly loan payment?",
        "a": "Enter the loan amount, interest rate, and term in Loan Calculator. It returns the monthly payment and the total interest you will pay over the loan. A longer term lowers the monthly payment but raises total interest, so compare a few terms."
      },
      {
        "q": "What is the difference between simple and compound interest?",
        "a": "Simple interest pays only on the original amount, while compound interest also pays on earlier interest. Over long periods compounding grows money much faster. Compare both with Simple Interest Calculator and Compound Interest Calculator using the same figures."
      },
      {
        "q": "How do I calculate take home pay after taxes?",
        "a": "Enter your gross salary and location details in Salary / Take-Home Pay Calculator. It estimates deductions and shows net pay per year, month, and paycheck. Results are estimates, because benefits, filing status, and local rules change the final amount."
      },
      {
        "q": "How do I calculate a percentage of a number?",
        "a": "Multiply the number by the percentage and divide by 100. For example, 15 percent of 80 is 12. Percentage Calculator does this for you and also finds percentage change and what percent one number is of another."
      },
      {
        "q": "What is a healthy BMI range?",
        "a": "A BMI between 18.5 and 24.9 falls in the normal weight range for most adults. BMI Calculator takes your height and weight and returns the number plus its category. BMI ignores muscle mass and body shape, so treat it as a screening tool."
      },
      {
        "q": "How many calories do I need each day?",
        "a": "Your daily need depends on age, sex, height, weight, and activity. Calorie Calculator (TDEE) estimates total daily energy expenditure from those inputs. Eating below that number leads to weight loss over time, and eating above it leads to weight gain."
      },
      {
        "q": "How do I calculate profit margin?",
        "a": "Subtract cost from revenue to get profit, divide profit by revenue, and multiply by 100. A product that sells for 50 and costs 30 has a 40 percent margin. Profit Margin Calculator also shows markup so you can compare both."
      },
      {
        "q": "How do I convert between currencies?",
        "a": "Pick the two currencies in Currency Converter, enter the amount, and read the converted value. Exchange rates change throughout the day, so the figure suits planning and estimates. Banks and card providers add fees and use their own rates for real payments."
      }
    ]
  },
  "generators-security": {
    "seoTitle": "Free Generators & Random Tools Online",
    "description": "Generate secure passwords, QR codes, names, and random picks, or test typing speed and reaction time with 25 free online generators and random tools.",
    "intro": [
      "Some tools exist to give you something new on demand. A strong password, a QR code for a menu, a name for a business, or a fair random pick for a classroom. These 25 free generators and random tools do that work quickly and without sign ups.",
      "Security tools help you protect accounts. Secure Password Generator builds random passwords from the length and character rules you set, Passphrase Generator makes memorable word combinations, and Password Strength Checker estimates how hard a password is to guess. QR Code Generator and Barcode Generator create scannable codes for links, menus, and products.",
      "Random tools settle choices fairly. Random Number Generator, Coin Flip & Dice Roller, and Wheel of Names / Random Picker give unbiased results for games, giveaways, and decisions. Random Team Generator splits a list into balanced groups, and Tournament Bracket Generator builds a full match tree for an event.",
      "Naming tools fill the creative gaps. Business Name Generator, Nickname Generator, Fantasy Name Generator, Baby Name Generator, and Pet Name Generator offer ideas by style and theme. License Plate Generator renders a vanity plate mockup, and Countdown Timer Generator makes a live countdown you can embed.",
      "The rest are small tests and trackers. Typing Speed Test (WPM) and Reaction Time Test measure your skills, VIN Decoder reads a 17 character vehicle code, and Snow Day Predictor, US Public Holiday Countdown, and Daylight Saving Time Countdown answer date questions. Fantasy Points Calculator and Gaming Session Time Calculator serve players."
    ],
    "faq": [
      {
        "q": "How do I create a strong password?",
        "a": "Use a password of at least 14 characters that mixes uppercase and lowercase letters, numbers, and symbols, and never reuse it. Secure Password Generator builds one from the length and rules you set. A password manager helps you store long random passwords."
      },
      {
        "q": "What is a passphrase and is it safer than a password?",
        "a": "A passphrase strings several random words together, such as four or five unrelated words. Length makes it hard to crack, and it is easier to remember than random symbols. Passphrase Generator picks the words for you so the combination stays truly random."
      },
      {
        "q": "How do I make a QR code for a link?",
        "a": "Open QR Code Generator, type or paste the URL, and the code appears for you to download. Test it with your phone before printing. Keep the code large enough and leave a blank margin around it, so cameras scan it reliably."
      },
      {
        "q": "What is a good typing speed?",
        "a": "The average typist reaches about 40 words per minute. Skilled office typists score 60 to 80, and professionals often exceed 100. Typing Speed Test (WPM) reports your net speed and accuracy, which counts mistakes against your score."
      },
      {
        "q": "What is a normal reaction time?",
        "a": "Most people react to a visual signal in about 200 to 270 milliseconds. Tiredness, distraction, and age change the result. Reaction Time Test measures your speed when the screen changes color, and averaging several attempts gives a fairer number."
      },
      {
        "q": "How do I pick a random winner for a giveaway?",
        "a": "List all entries in Wheel of Names / Random Picker and spin it, or use Random Number Generator with a number for each entrant. Both give each entry an equal chance. Screen recording the spin gives your audience proof the pick was fair."
      },
      {
        "q": "What does a VIN tell you about a car?",
        "a": "A 17 character VIN encodes the manufacturer, vehicle type, model year, assembly plant, and a serial number. VIN Decoder breaks the code into these parts so you can confirm a listing matches the car. Always compare the decoded details with the title."
      },
      {
        "q": "How do I split a group into random teams?",
        "a": "Paste your names into Random Team Generator, choose the number of teams, and run it. The tool shuffles everyone into groups of near equal size. Press the button again to reshuffle until the teams feel balanced for your game or class."
      }
    ]
  },
  "design-color-tools": {
    "seoTitle": "Free Design & Color Tools Online",
    "description": "Pick colors from images, convert HEX to RGB, build color palettes, and find color names with four free design and color tools for designers and developers.",
    "intro": [
      "Color decisions slow down every design project. You need the exact code for a shade in a screenshot, a matching palette for a brand, or the RGB value for a HEX code in a stylesheet. These four free tools answer those questions in seconds.",
      "Color Picker selects any shade and returns its codes in common formats. It also checks contrast for accessibility and can simulate color blindness, which helps you judge whether text stays readable. You can sample a color from an uploaded screenshot or logo, so matching a brand tone takes one click.",
      "HEX to RGB Converter translates color codes in both directions. Developers use it to move a value from a design file into CSS, and it supports transparency through alpha values. Keeping both formats handy saves time when different tools or style sheets expect different notation.",
      "Palette Generator builds a set of colors that work together. You can extract a palette from a photo, lock colors you like, and randomize the rest until the set feels right. When you finish, you copy or export the palette for your project.",
      "Color Name Finder returns the closest named color for any HEX or RGB value and lets you explore lighter tints and darker shades. Names help teams talk about a color without sharing codes, and standard CSS names keep your stylesheets readable."
    ],
    "faq": [
      {
        "q": "How do I convert HEX to RGB?",
        "a": "Split the six digit HEX code into three pairs and convert each pair from base 16 to base 10. For example, #FF8800 becomes 255, 136, 0. HEX to RGB Converter does this for you and converts RGB values back to HEX."
      },
      {
        "q": "How do I find the color of something in an image?",
        "a": "Upload the image to Color Picker, click the spot you want to sample, and read its HEX and RGB codes. Zoom in on small details for accuracy. Screenshots and logos work well because their colors stay consistent across large areas."
      },
      {
        "q": "What makes a good color palette?",
        "a": "A good palette usually has one main color, one or two supporting colors, and a neutral for backgrounds and text. Contrast between them keeps content readable. Palette Generator lets you lock the colors you like and refresh the others."
      },
      {
        "q": "What is the difference between HEX, RGB, and HSL?",
        "a": "HEX writes color as a six digit code, RGB gives red, green, and blue levels from 0 to 255, and HSL describes hue, saturation, and lightness. Web code accepts all three. HSL feels the most natural when you adjust a shade."
      },
      {
        "q": "How much contrast does text need to be readable?",
        "a": "WCAG guidelines ask for a contrast ratio of at least 4.5 to 1 for normal text and 3 to 1 for large text. Color Picker includes a contrast checker, so you can test a text and background pair before you publish a design."
      },
      {
        "q": "How do I extract a color palette from a photo?",
        "a": "Upload the photo to Palette Generator and it pulls the main colors into a set of swatches. Pick a photo with clear, distinct colors for the best result. You can then lock favorites and export the palette for your project."
      },
      {
        "q": "What does color blindness mean for design?",
        "a": "Color blindness affects how people see certain hues, most often red and green. About 1 in 12 men has some form of it. Color Picker can simulate color blindness, so you can confirm your design does not rely on color alone."
      },
      {
        "q": "What is the name of this color?",
        "a": "Enter the HEX or RGB value in Color Name Finder and it returns the closest named color, such as slate gray or coral. Exact matches are rare, so the tool shows the nearest name. CSS color names work directly in your stylesheets."
      }
    ]
  },
  "seo-marketing-tools": {
    "seoTitle": "Free SEO & Marketing Tools Online",
    "description": "Build UTM links, preview Open Graph cards, check keyword density, test meta description length, and split X threads with five free SEO and marketing tools.",
    "intro": [
      "Small SEO and marketing mistakes cost real traffic. A campaign link without tracking, a social card with the wrong image, or a meta description cut off in search results all weaken your work. These five free tools help you catch those problems before you publish.",
      "UTM Link Builder adds campaign parameters such as source, medium, and campaign name to any URL. Consistent tagging lets analytics platforms report which email, ad, or post produced each visit. Build the link, copy it, and use the same naming pattern across your whole team to keep reports clean.",
      "Open Graph Preview Generator shows how a page appears when someone shares it on social networks. You enter a title, description, and image, then preview the card and copy the matching tags. Checking the preview first prevents blank thumbnails and cut off headlines.",
      "Keyword Density Checker counts how often words and phrases appear in your copy. Use it to spot a keyword you repeat too often or an important term you barely mention. Meta Description Length Checker measures your snippet against search display limits so the ending is not truncated.",
      "X/Twitter Thread Splitter breaks a long piece of writing into numbered posts that fit the character limit. You paste the text, review the split, and copy each post in order. Together these tools cover link tracking, sharing, on page checks, and social publishing."
    ],
    "faq": [
      {
        "q": "What are UTM parameters and why do they matter?",
        "a": "UTM parameters are tags added to a URL, such as utm_source, utm_medium, and utm_campaign. Analytics tools read them to show where visitors came from. Without them, traffic from email or social posts often appears as direct or gets lumped together."
      },
      {
        "q": "How long should a meta description be?",
        "a": "Aim for about 130 to 155 characters so search results show the whole snippet. Google may rewrite the text or truncate longer ones. Meta Description Length Checker counts characters for you and shows whether your text fits the display limit."
      },
      {
        "q": "What is keyword density and what is a good percentage?",
        "a": "Keyword density is the share of words on a page that match a phrase. No ideal percentage exists, and stuffing hurts readability. Most writers keep a target phrase natural and below 2 to 3 percent, which Keyword Density Checker lets you verify."
      },
      {
        "q": "How do Open Graph tags work?",
        "a": "Open Graph tags are meta tags in your page head that tell social networks which title, description, and image to display for a link. Open Graph Preview Generator shows the card and creates the tags, so you can paste them into your site."
      },
      {
        "q": "What size should an Open Graph image be?",
        "a": "Use an image of 1200 by 630 pixels, which matches a 1.91 to 1 ratio and displays well on most platforms. Keep important text away from the edges because some apps crop the picture. Preview the card before you share it."
      },
      {
        "q": "How do I tag links for Google Analytics?",
        "a": "Add at least source, medium, and campaign parameters to each link you share, using lowercase and consistent names. UTM Link Builder assembles the URL for you. Keep a shared sheet of approved names so your reports do not split into duplicates."
      },
      {
        "q": "How do I turn a long post into an X thread?",
        "a": "Paste your text into X/Twitter Thread Splitter, which divides it into numbered posts under the character limit. Review each break so ideas stay together, then copy the posts in order. Start with a hook that makes people want to read the rest."
      },
      {
        "q": "Does keyword density still affect SEO rankings?",
        "a": "Search engines read meaning and context, so a fixed density no longer drives rankings. Still, using your main term in the title, a heading, and the opening text helps relevance. Keyword Density Checker helps you spot overuse, not hit a magic number."
      }
    ]
  },
  "life-everyday-tools": {
    "seoTitle": "Free Life & Everyday Tools Online",
    "description": "Check if a food is safe for your dog, scale recipes, estimate a due date, plan a trip, and budget a wedding with 44 free everyday calculators and planners.",
    "intro": [
      "Everyday life runs on small calculations. How old is my dog in human years, how much paint does a bedroom need, or what will this road trip cost in gas? These 44 free calculators and planners answer those questions in seconds, so you stop guessing.",
      "Pet tools cover common owner questions. Can My Dog Eat This? (Food Safety Checker) flags safe and toxic foods, and Dog Age to Human Years Calculator and Cat Age to Human Years Calculator convert ages by life stage. Pet Calorie Needs Calculator sets a daily food target, and Dog Walking Time Calculator suggests a realistic routine.",
      "Family and health tools support new parents and students. Pregnancy Due Date Calculator, Baby Feeding Schedule Generator, Diaper Changes Per Day Estimator, and Child Growth Percentile Checker track early milestones. Sleep Cycle Bedtime Calculator, Stretching Routine Generator, Running Pace Calculator, and Cycling Speed & Distance Calculator help you stay active and rested.",
      "Kitchen and study tools handle daily routines. Recipe Scaler, Baking Conversion Calculator, Coffee to Water Ratio Calculator, Cooking Time by Weight Calculator, and Freezing Time Estimator remove kitchen guesswork. Study Time Calculator, Reading Time Calculator, Grade Percentage Calculator, GPA to Percentage Converter, and Scholarship Eligibility Checker serve students.",
      "Travel, home, and event tools finish the set. Road Trip Cost Calculator, Travel Budget Planner, Luggage Weight Checker, Flight CO2 Emissions Calculator, and Timezone Meeting Planner prepare your trips. Paint Quantity Calculator, Carpet Area Calculator, Moving Box Calculator, Wedding Budget Calculator, and eco tools such as EV vs Petrol Cost Calculator plan bigger projects."
    ],
    "faq": [
      {
        "q": "What foods are toxic to dogs?",
        "a": "Chocolate, grapes and raisins, onions, garlic, xylitol sweetener, macadamia nuts, and alcohol are common dangers. Can My Dog Eat This? (Food Safety Checker) lets you search a food and see if it is safe or risky. Call your vet right away if your dog eats something toxic."
      },
      {
        "q": "How do I convert dog years to human years?",
        "a": "The old rule of multiplying by seven is too simple. Dogs age faster in the first two years, and size matters, since large breeds age faster than small ones. Dog Age to Human Years Calculator uses your dog's size and age for a closer estimate."
      },
      {
        "q": "How do I calculate my due date?",
        "a": "Doctors add 280 days, or 40 weeks, to the first day of your last menstrual period. This is called Naegele's rule and it assumes a 28 day cycle. Pregnancy Due Date Calculator applies it, though your provider may adjust the date after an ultrasound."
      },
      {
        "q": "How many hours of sleep cycles do I need?",
        "a": "A sleep cycle lasts about 90 minutes, and most adults need four to six cycles, or 6 to 9 hours. Sleep Cycle Bedtime Calculator works backward from your wake time to suggest bedtimes. Waking at the end of a cycle often feels easier than waking in the middle."
      },
      {
        "q": "How do I scale a recipe up or down?",
        "a": "Divide the new serving count by the original count to get a multiplier, then multiply every ingredient by it. Recipe Scaler does this for all ingredients at once. Spices, baking times, and pan sizes may need adjusting when you scale far from the original."
      },
      {
        "q": "How much paint do I need for a room?",
        "a": "Multiply the room perimeter by wall height to get wall area, subtract doors and windows, and divide by about 350 square feet, which one gallon usually covers. Paint Quantity Calculator does this and adds your coat count, so you buy the right amount."
      },
      {
        "q": "How do I estimate the cost of a road trip?",
        "a": "Divide the trip distance by your car's miles per gallon to find the gallons needed, then multiply by the fuel price. Road Trip Cost Calculator handles this math, and you can add tolls, food, and lodging separately with Travel Budget Planner."
      },
      {
        "q": "How much does a wedding cost and how do I split the budget?",
        "a": "Wedding costs vary widely by location and guest count. Planners often give the venue and catering about half of the budget, with the rest split among photography, attire, flowers, music, and extras. Wedding Budget Calculator allocates your total across these categories."
      }
    ]
  }
};

const bak = (f) => fs.writeFileSync(f + ".bak", fs.readFileSync(f));

// 1) src/data/categorySeo.js (full rewrite, 8 FAQs per category)
const SEO = "src/data/categorySeo.js";
bak(SEO);
fs.writeFileSync(
  SEO,
  "// Per-category SEO copy: seoTitle, meta description, 5 intro paragraphs, 8 FAQs.\n" +
    "export const CATEGORY_SEO = " + JSON.stringify(DATA, null, 2) + ";\n\n" +
    "export function getCategorySeo(slug) {\n  return CATEGORY_SEO[slug] || null;\n}\n"
);
console.log("categorySeo.js rewritten (" + Object.keys(DATA).length + " categories)");

// 2) src/data/categories.js: description (homepage cards + category header)
const CAT = "src/data/categories.js";
let cat = fs.readFileSync(CAT, "utf8");
bak(CAT);
let n = 0;
for (const [slug, v] of Object.entries(DATA)) {
  const re = new RegExp('(slug:\\s*"' + slug + '"[\\s\\S]*?description:\\s*)"(?:[^"\\\\]|\\\\.)*"');
  if (re.test(cat)) { cat = cat.replace(re, (_, p) => p + JSON.stringify(v.description)); n++; }
  else console.log("categories.js: slug not found " + slug);
}
fs.writeFileSync(CAT, cat);
console.log("categories.js descriptions updated: " + n);

// 3) src/app/category/[slug]/page.js: use seoTitle + description from categorySeo
const PAGE = "src/app/category/[slug]/page.js";
let page = fs.readFileSync(PAGE, "utf8");
bak(PAGE);
const oldMeta = /return buildMetadata\(\{\s*title: `\$\{category\.name\}[^`]*`,\s*description: category\.description,/;
if (oldMeta.test(page)) {
  page = page.replace(
    oldMeta,
    "const seo = getCategorySeo(category.slug);\n  return buildMetadata({\n    title: seo?.seoTitle || category.name,\n    description: seo?.description || category.description,"
  );
  fs.writeFileSync(PAGE, page);
  console.log("page.js metadata patched");
} else {
  console.log("page.js: metadata block not found (already patched?). Skipped.");
}
console.log("Backups saved as *.bak. Delete them after checking.");
