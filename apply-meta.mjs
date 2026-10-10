// Run from project root:  node apply-meta.mjs
import fs from "node:fs";
const FILE = "src/data/toolSeo.js";
const META = {
  "audio-trimmer": "Drag the waveform markers with this audio trimmer to cut any clip from MP3, WAV, AAC, or OGG files, then download only the part you need.",
  "baby-feeding-schedule-generator": "Build a newborn feeding schedule from your baby's age and feeding method. Get a daily routine with feed times and amounts to share with your pediatrician.",
  "baby-name-generator": "Find a name with our baby name generator. Filter by origin, starting letter, and style, then read the meaning behind every boy, girl, or unisex pick.",
  "baking-conversion-calculator": "Convert grams to cups for flour, sugar, butter, and 30+ ingredients. This baking conversion calculator also gives ounces, so every recipe turns out right.",
  "carbon-footprint-calculator": "Use this carbon footprint calculator to estimate your yearly CO2 from home energy, driving, flights, and diet, then see which habit to change first.",
  "carpet-area-calculator": "Measure any room with this carpet calculator. Enter length and width to get square feet and square yards, with a waste margin added before you order.",
  "cat-age-calculator": "Turn your cat's age into human years. This cat years to human years tool follows real life stages from kitten to senior, not a flat seven-year rule.",
  "child-growth-percentile-checker": "Enter age, height, and weight in this height percentile calculator to see where your child falls on standard growth charts, from toddler to teen.",
  "clothing-size-converter": "Convert tops, dresses, and pants between US, UK, EU, and Asian sizes. This clothing size converter also reads your body measurements to suggest a fit.",
  "coffee-water-ratio-calculator": "Dial in your coffee to water ratio for pour over, drip, French press, or espresso. Enter your water volume and get the exact grams of coffee to grind.",
  "coin-flip-dice-roller": "Settle any decision with heads or tails, or roll up to six dice at once. Every flip and roll is random, fair, and shows its result in one tap.",
  "college-savings-calculator": "Project your 529 balance at enrollment with this 529 calculator. Enter your child's age, savings so far, and monthly deposit to see if you are on track.",
  "cooking-time-calculator": "Use this turkey cooking time calculator to get roasting time and oven temperature by weight. It also covers chicken, beef, pork, and lamb roasts.",
  "countdown-timer-generator": "Create a countdown to date for a launch, wedding, or sale. Pick a time and style, then copy the embed code to put the live timer on your own website.",
  "cycling-speed-calculator": "Enter distance and ride time in this cycling speed calculator to get your average speed in mph or km/h, then compare rides and track your progress.",
  "daylight-saving-countdown": "Find out when do clocks go back or forward. This live countdown shows the days, hours, and minutes left until the next daylight saving change in your area.",
  "diaper-changes-estimator": "Log wet and dirty nappies with this diaper calculator to see daily totals and weekly patterns, plus the numbers a pediatrician asks about at checkups.",
  "dog-age-calculator": "Our dog age calculator turns dog years to human years by size and breed. Small and giant dogs age at different rates, so the result fits your own pup.",
  "dog-food-safety-checker": "Wondering can my dog eat this? Search a food and see if it is safe, fine in small amounts, or toxic, with the reason and what to do if your dog ate it.",
  "dog-walking-time-calculator": "Not sure how long should I walk my dog? Enter size, age, and energy level to get a daily walking time, split into walks that suit your dog's breed.",
  "electricity-bill-estimator": "Add your appliances and daily hours to this electricity cost calculator. See what each device costs per day, month, and year at your own rate per kWh.",
  "ev-vs-petrol-calculator": "Compare an EV vs gas calculator side by side. Enter miles driven, fuel price, and electricity rate to see yearly running costs and the break-even point.",
  "event-seating-planner": "Make a seating chart generator layout for weddings and parties. Add guests and table sizes, keep groups together, and print a clear plan for the venue.",
  "fantasy-name-generator": "Get a fantasy name generator that fits your world. Choose elf, dwarf, orc, or human and receive DnD character names with a lore-friendly sound.",
  "fantasy-points-calculator": "Score any player with this fantasy points calculator. Enter the stat line, pick PPR or standard fantasy football rules, and get the exact league total.",
  "flight-co2-calculator": "Find the carbon footprint of a flight from your route and cabin class. See CO2 per passenger in kg and compare it with driving or taking the train.",
  "food-calorie-burn-calculator": "Pick any food and this steps to calories calculator shows how many steps or miles it takes to burn it off, based on your weight and walking pace.",
  "freezing-time-estimator": "Check how long does it take to freeze meat, bread, soup, or leftovers, and how long each stays good in the freezer. Get safe storage times by food type.",
  "gaming-session-time-calculator": "Enter start and end times in this playtime calculator to see how long you played, including overnight sessions, and add up your total hours per week.",
  "garden-soil-calculator": "Size any raised bed with this topsoil calculator. Enter length, width, and depth to get cubic yards and the number of 1 or 2 cubic foot bags to buy.",
  "gif-maker": "Turn a video to GIF online with this gif maker. Upload a clip, trim the start and end, set frame rate and size, and download a looping animated GIF.",
  "gpa-to-percentage-converter": "Use this GPA to percentage calculator to convert a 4.0, 5.0, or 10-point GPA into a percentage. See the letter grade too, for applications and resumes.",
  "grade-percentage-calculator": "Enter points earned and points possible in this grade percentage calculator to see your score and letter grade, and check what a test result means.",
  "invitation-word-counter": "Draft graduation invitation wording and count every word and character as you type. See if your text fits a card before you send it to the printer.",
  "json-diff-checker": "Run a JSON compare on two objects and see every added, removed, and changed key in color. Paste both versions to find the difference in nested data fast.",
  "license-plate-generator": "Design a custom plate with this license plate generator. Type your vanity text, choose a state style, and download a realistic mockup to preview your idea.",
  "luggage-weight-checker": "Add each item to see your total against the baggage weight limit of your airline. Check carry-on and checked bag weight in kg or lb before you leave home.",
  "markdown-editor-previewer": "Write in this markdown editor and see the formatted preview update as you type. It supports headings, tables, code blocks, and lists, with HTML export.",
  "moving-box-calculator": "Use this moving box calculator to pick a home size and how much you own. Get a box count by small, medium, large, and wardrobe sizes before you pack.",
  "nickname-generator": "Type any name into this nickname generator and get cool, funny, and gamer-style handles to copy for Discord, Instagram, Fortnite, or your next tag.",
  "oven-temperature-converter": "Use this oven temperature converter to switch between Fahrenheit, Celsius, and gas mark. Match any recipe, fan oven setting included, to your oven dial.",
  "paint-quantity-calculator": "Wondering how much paint for a bedroom? Enter wall sizes, doors, windows, and coats to get the gallons needed, so you buy the right amount first time.",
  "party-food-calculator": "Use this party food calculator to plan how much pizza for 20 people, plus wings, sides, and drinks. Amounts scale to your guest count and event length.",
  "password-generator": "Create a password generator result you can trust. Choose length, symbols, and numbers, and the tool builds a random password that runs in your browser.",
  "password-strength-checker": "Run a password strength checker test to see entropy, estimated crack time, and weak patterns. Get clear tips to make your password harder to guess.",
  "pet-calorie-calculator": "Use this dog food calculator for cats and dogs. Enter weight, age, and activity to get daily calories, then split the amount into meals for your pet.",
  "pet-name-generator": "Our dog name generator also names cats, rabbits, and more. Pick a style, from cute to funny to classic, and find a short name your pet will answer to.",
  "placeholder-image-generator": "Generate a placeholder image in any size. Set width, height, colors, and label text, then download a PNG or copy the URL for mockups and web layouts.",
  "plastic-usage-estimator": "Answer a few questions in this plastic footprint calculator to see how much single-use plastic you use per year, and which swaps cut the most waste.",
  "pregnancy-due-date-calculator": "Use this IVF due date calculator with your transfer date and embryo age. It also works from your last period to estimate your due date and each trimester.",
  "property-tax-estimator": "Estimate your yearly bill with this property tax calculator. Enter assessed value and your local mill rate to see annual tax and a monthly escrow amount.",
  "random-team-generator": "Paste a list of names into this random group generator and split them into fair teams. Set the number of groups or people per team and reshuffle anytime.",
  "reaction-time-test": "Take the reaction time test and click as soon as the screen turns green. See your speed in milliseconds and compare it with the average human score.",
  "reading-time-calculator": "Paste your article into this reading time calculator to see how long it takes to read aloud or silently. Use it to add a read time to blogs and posts.",
  "recipe-scaler": "Double, halve, or resize any dish with this recipe scaler. Enter your ingredients and a new serving count, and each quantity updates in cups, grams, or oz.",
  "recycling-savings-calculator": "Estimate what you save with this recycling calculator. Enter weekly paper, plastic, glass, and metal to see energy, water, and landfill space you keep.",
  "ring-size-converter": "Use this ring size converter to match US, UK, EU, and Japanese sizes. Enter a size or the inner diameter in mm, and get your size for any jeweler's chart.",
  "road-trip-cost-calculator": "Use this trip gas calculator to price your drive. Enter distance, miles per gallon, and fuel price to get the total gas cost, then split it between riders.",
  "robots-txt-generator": "Use this robots.txt generator to build a file without syntax errors. Set allow and disallow rules, add your sitemap URL, and download it ready to upload.",
  "running-pace-calculator": "Find the pace you need with this running pace calculator. Enter distance and goal time to get per mile and per km splits for a 5K, 10K, or marathon.",
  "scholarship-eligibility-checker": "Use this scholarship calculator to check your odds. Enter GPA, test scores, and background to see which common award criteria you meet before you apply.",
  "screen-recorder": "Capture your display with this screen recorder. Record a full screen, one window, or a tab, add microphone audio, and save the video without an app.",
  "shoe-size-converter": "Use this shoe size chart converter for men, women, and kids. Switch between US, UK, EU, and cm, or enter foot length to find a fit when buying online.",
  "sleep-cycle-calculator": "Try this sleep cycle calculator to pick a bedtime or wake time based on 90-minute cycles. It also works as a nap calculator, so you wake up less groggy.",
  "snow-day-predictor": "Check your odds with this snow day calculator. Enter snowfall, temperature, and region to get the chance of a school closing, for fun and planning ahead.",
  "social-security-fra-calculator": "Use this Social Security calculator to find your full retirement age by birth year, then compare benefits if you claim at 62, at full age, or at 70.",
  "standing-vs-sitting-calculator": "Does standing burn calories? Enter your weight and workday hours to see the extra calories burned versus sitting, as a daily, weekly, and yearly total.",
  "stretching-routine-generator": "Get a stretching routine for beginners built around your goal and tight areas. Each move comes with a hold time to follow at home or at your desk.",
  "study-time-calculator": "Turn your exam date into a study planner. Enter topics and hours free per day, and get a day-by-day schedule that spreads revision evenly before test day.",
  "text-binary-converter": "Use this binary translator to turn text into 0s and 1s, or decode binary back to words. It handles letters, numbers, and symbols, with one-click copy.",
  "timezone-meeting-planner": "Plan a call across cities with this timezone meeting planner. Add each location and see overlapping work hours to pick a time that suits the whole team.",
  "tournament-bracket-generator": "Build a chart with this tournament bracket generator for single or double elimination. Add teams, seed or shuffle them, and print the full match tree.",
  "travel-budget-planner": "Use this travel cost calculator to total flights, hotels, food, and activities. Set your trip length and get a full budget plus a daily spending limit.",
  "tree-planting-impact-calculator": "How much CO2 does a tree absorb? Enter your yearly emissions and see how many mature trees you would need to plant to offset them, with the math shown.",
  "typing-speed-test": "Take this typing speed test to measure your words per minute and accuracy. Choose a 1, 3, or 5 minute round, then track your score and see how to improve.",
  "us-holiday-countdown": "See how many days until Christmas, Thanksgiving, July 4, or any federal holiday. This live clock shows days, hours, minutes, and seconds left to go.",
  "video-compressor": "Use this video compressor to shrink MP4, MOV, AVI, and WebM files. Pick a quality level and compress video online for email, Discord, or social uploads.",
  "vin-decoder": "Run a Ford vin decoder lookup, or any make, on a 17-character code. See model, year, engine, and plant details with this VIN decoder before you buy.",
  "wedding-budget-calculator": "Use this wedding budget calculator to split your total across venue, catering, photo, and more. Enter guest count to see what each category should cost."
};
let src = fs.readFileSync(FILE, "utf8");
let done = 0, missing = [];
for (const [slug, text] of Object.entries(META)) {
  const re = new RegExp('("' + slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"\\s*:\\s*\\{[\\s\\S]*?seoDescription:\\s*)"(?:[^"\\\\]|\\\\.)*"');
  if (!re.test(src)) { missing.push(slug); continue; }
  src = src.replace(re, (_, pre) => pre + JSON.stringify(text));
  done++;
}
fs.writeFileSync(FILE + ".bak", fs.readFileSync(FILE));
fs.writeFileSync(FILE, src);
console.log("Updated " + done + " of " + Object.keys(META).length + " meta descriptions.");
if (missing.length) console.log("Not found:", missing.join(", "));
console.log("Backup saved as " + FILE + ".bak");
