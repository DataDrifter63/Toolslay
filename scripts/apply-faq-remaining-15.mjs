// Replaces the generic "Is this free / works on mobile / we don't store" FAQs of the last
// 15 tools with search-intent FAQs that match what each tool's code actually does.
//
//   node scripts/apply-faq-remaining-15.mjs      (run from the project root)
//   npm run check:seo -- --slug <slugs>          (verify, see list printed at the end)
//
// Only the `faq` array of each listed slug is touched. Nothing else in toolSeo.js changes.
import fs from "node:fs";

const FILE = "src/data/toolSeo.js";

const FAQS = {
  "baby-feeding-schedule-generator": [
    {
      q: "How often should a newborn eat in 24 hours?",
      a: "Newborns usually feed 8 to 12 times a day, about every 2 to 3 hours, including at night. For babies under one month this planner spaces feeds 2.5 hours apart and builds the day from your wake-up time. Breastfed babies often feed on demand, so treat the times as a guide, not a rule.",
    },
    {
      q: "How many ounces of formula does a baby need per feeding?",
      a: "Choose Formula or Pumped and the planner shows 2 to 3 oz per feed under one month, 4 to 5 oz at 1 to 3 months, 5 to 7 oz at 4 to 6 months, and 6 to 8 oz from 6 to 12 months. Breastmilk mode shows on demand, since nursing amounts vary.",
    },
    {
      q: "When should I start solid foods?",
      a: "Most pediatric guidance points to around 6 months, once a baby sits with support and shows interest in food. The planner lists an intro and tasting stage at 4 to 6 months and adds three solid meals between milk feeds from 6 to 12 months. Ask your pediatrician before starting early.",
    },
    {
      q: "What is a wake window and why does the schedule show one?",
      a: "A wake window is how long a baby can stay awake between naps before getting overtired. The planner lists about 45 to 60 minutes for newborns, 1.5 to 2 hours at 1 to 3 months, 2 to 2.5 hours at 4 to 6 months, and 3 to 4 hours from 6 to 12 months.",
    },
    {
      q: "Can I use this schedule if I breastfeed?",
      a: "Yes, but breastfed babies often feed more often and on demand, so the times work best as a rough rhythm. Pick Breastmilk and the tool shows on demand in place of a set amount. Feed sooner when you see hunger cues such as rooting, hand to mouth movements, or lip smacking.",
    },
    {
      q: "How accurate is a baby feeding schedule?",
      a: "It is a general estimate built from average pediatric guidelines, not a plan for your own baby's weight or health. Premature babies, babies with reflux, and babies who gain weight slowly often need different amounts and timing. Use the schedule as a starting point and follow your pediatrician's advice.",
    },
  ],

  "diaper-changes-estimator": [
    {
      q: "How many diapers does a newborn use per day?",
      a: "Newborns go through about 10 to 12 diapers a day, the range this estimator uses for the first month. At 11 changes a day that adds up to roughly 330 diapers in 30 days, so plan for more than one pack of newborn size before the baby arrives.",
    },
    {
      q: "How many diapers does a baby use at each age?",
      a: "The estimator uses 10 to 12 a day for newborns, 8 to 10 at 1 to 3 months, 7 to 8 at 3 to 6 months, 6 to 7 at 6 to 9 months, and 5 to 6 at 9 to 12 months. It drops to 4 to 5 in the second year and 3 to 4 at ages 2 to 3. Your own count may run higher or lower.",
    },
    {
      q: "How much do diapers cost per month and per year?",
      a: "Enter the price per diaper and the estimator multiplies it by the daily average and 30.4 days. At the default 0.25 per diaper, a newborn using 11 a day costs about 83.50 a month. The results also show a yearly total, and you can change the currency symbol.",
    },
    {
      q: "How many wipes do I need for diaper changes?",
      a: "The tool assumes 3 wipes per change, and you can set anything from 1 to 6. At 11 changes a day that is about 33 wipes daily, or roughly 1,000 in a month of newborn care. The stockpile list totals wipes together with diapers so you can buy both at once.",
    },
    {
      q: "What diaper size should I buy for my baby's age?",
      a: "The estimator suggests newborn or size 1 for the first month and size 1 or 2 at 1 to 3 months. Next come size 2 or 3 up to 6 months, size 3 at 6 to 9 months, and size 3 or 4 near the first birthday. Weight matters most, so check the pack label.",
    },
    {
      q: "How accurate is the estimate, and how much should I stock up?",
      a: "It is a rough average, since feeding habits, diet, and illness change daily counts. The stockpile slider plans from 1 to 12 months of supply. Avoid buying many months of one size, because babies outgrow diaper sizes quickly, and mix sizes when you stock up for a long period.",
    },
  ],

  "child-growth-percentile-checker": [
    {
      q: "What does a growth percentile mean for my child?",
      a: "A percentile compares your child with other children of the same age and sex. At the 40th percentile for weight, a child weighs more than about 40 out of 100 children. It is a comparison, not a grade, so the 15th percentile and the 85th can both be healthy.",
    },
    {
      q: "What is a normal weight and height percentile for a toddler?",
      a: "This checker treats the 5th to the 95th percentile as the healthy range. Below the 5th it flags underweight or short, and above the 95th it flags overweight or tall. One reading matters less than whether your child follows a steady curve across several checkups.",
    },
    {
      q: "What ages does this growth checker cover?",
      a: "It covers birth to 5 years for boys and girls, using weight and height only. The age fields stop at 5 years and 11 months, and the tool does not calculate BMI or head circumference. For older children, use the growth charts your pediatrician or the CDC provides.",
    },
    {
      q: "Should I enter pounds and inches or kilograms and centimeters?",
      a: "Either works. Switch between imperial and metric and the tool converts what you entered, so 30 lb becomes about 13.6 kg. Use the latest measurement from a clinic if you can, because a home scale or tape measure can be off by enough to move the percentile.",
    },
    {
      q: "My child dropped a percentile. Should I worry?",
      a: "A small shift is common, especially after an illness, during a growth spurt, or in the first two years. Doctors look closer when a child crosses two major percentile lines, such as from the 75th to below the 25th, or stays under the 5th. Bring the numbers to your pediatrician.",
    },
    {
      q: "How accurate is this percentile compared with the WHO chart?",
      a: "It is an estimate. The tool uses average and spread values at seven ages from birth to 5 years and fills in the months between, so results can differ by a few points from the official WHO or CDC chart. Treat it as a quick check before an appointment.",
    },
  ],

  "carbon-footprint-calculator": [
    {
      q: "What is the average carbon footprint per person?",
      a: "This calculator compares your yearly total with three benchmarks: about 2 tons as a sustainable target, 4.5 tons as the global average, and 15 tons as a typical US or UK level. Your result lands in one of those bands, so you can see how far you are from each.",
    },
    {
      q: "How does the calculator estimate my emissions?",
      a: "It adds five parts. Driving counts 0.0004 tons per mile, and each short or medium round-trip flight adds 0.8 tons. Diet adds 1.5 to 3.3 tons and home energy 1.0 to 3.5 tons. A fixed 2.0 tons covers shared services such as infrastructure and goods.",
    },
    {
      q: "How much CO2 does driving a car produce per year?",
      a: "At roughly 400 grams of CO2 per mile, the default 8,000 miles a year comes to about 3.2 tons, and 12,000 miles comes to 4.8 tons. The tool uses one average figure for every vehicle, so an efficient hybrid will emit less and a large truck will emit more.",
    },
    {
      q: "Does what I eat really change my carbon footprint?",
      a: "Yes. The tool assigns about 1.5 tons a year to a vegan diet, 1.7 to vegetarian, 2.5 to average meat eating, and 3.3 to eating meat almost daily. Moving from heavy to average meat saves about 0.8 tons a year, the same as driving 2,000 fewer miles.",
    },
    {
      q: "How many trees would offset my carbon footprint?",
      a: "The calculator divides your total by 22 kg, the CO2 one mature tree absorbs in a year, and rounds up. With the default inputs of 8,000 miles, two flights, and average diet and home use, that gives about 514 trees. Young trees absorb less, so this shows the size of the gap.",
    },
    {
      q: "How accurate is an online carbon footprint calculator?",
      a: "It is an estimate built on averages, not a measured audit. This one does not read your electricity bill, car model, or flight distance, so real numbers can be higher or lower. Use it to compare habits and see which change cuts the most, such as flying less or eating less meat.",
    },
  ],

  "plastic-usage-estimator": [
    {
      q: "How much single-use plastic does a household use in a year?",
      a: "With its default habits for two people, the estimator gives about 30 kg of single-use plastic a year, or 15 kg per person. That comes from bottles, bags, takeout containers, snack wrappers, toiletry bottles, and delivery bags. Enter your own weekly counts to see your real total.",
    },
    {
      q: "How much does a plastic bottle or bag weigh in this calculation?",
      a: "The estimator assumes a 500 ml PET bottle weighs 15 grams, a grocery bag 6 grams, a takeout container with cutlery 35 grams, a snack wrapper 4 grams, a shampoo or lotion bottle 50 grams, and a delivery polybag 20 grams. Real items vary by brand and size.",
    },
    {
      q: "What does Eco Mode change in the estimate?",
      a: "Eco Mode simulates switching to reusables. It assumes 90 percent fewer plastic bottles and grocery bags and 70 percent fewer takeout containers, while wrappers, toiletries, and deliveries stay the same. With the default habits it cuts the yearly total from about 30 kg to about 16 kg.",
    },
    {
      q: "What happens to the plastic I throw away?",
      a: "The tool splits your total using global averages: about 9 percent is recycled, 19 percent is incinerated, and 72 percent ends up in landfill or the environment. Local rates differ, so recycling where you live may be higher or lower. The split shows why cutting use matters most.",
    },
    {
      q: "Which plastic items should I cut first?",
      a: "Check the breakdown. With the default habits, bottles are the largest share at about 7.8 kg a year, followed by snack wrappers and takeout containers, so a refillable bottle gives the biggest single drop. Bags and delivery packaging add up too, but each item weighs far less.",
    },
    {
      q: "How accurate is a plastic footprint estimate?",
      a: "This is a rough estimate based on fixed average weights, so it will not match a measured household audit. The tool covers six common single-use items and leaves out other plastic you buy, such as packaging inside larger purchases. Use it to compare habits over time, not as an exact total.",
    },
  ],

  "tree-planting-impact-calculator": [
    {
      q: "How much CO2 does a tree absorb per year?",
      a: "This calculator uses 22 kg a year for a mature mixed-forest tree, 30 kg for mangroves, 26 kg for hardwoods such as oak, and 16 kg for conifers such as pine. Real rates vary with climate, soil, and age, so treat them as planning averages rather than measurements.",
    },
    {
      q: "How many trees do I need to offset one ton of CO2?",
      a: "At 22 kg per mature tree per year, you would need about 46 trees to absorb one metric ton in a year. Switch the species to mangroves and the number drops to about 34. Young trees absorb less, so the real number is higher in the early years.",
    },
    {
      q: "How long does a tree take to reach full carbon absorption?",
      a: "The calculator assumes about 10 years. Absorption starts at 10 percent of the maximum in year one and rises in even steps to 100 percent in year ten. That is why 100 trees over 10 years absorb far less than 100 trees would at full maturity for ten years.",
    },
    {
      q: "Why does the survival rate matter in the results?",
      a: "Not every planted tree lives. The tool uses an 80 percent survival rate by default, so planting 100 trees counts 80 growing ones. Lower the rate to model a project with poor aftercare, or raise it for watered and protected planting. Dropping from 80 to 50 percent cuts the result by more than a third.",
    },
    {
      q: "What do the car and flight comparisons mean?",
      a: "The tool divides the total CO2 absorbed by 4.6 tons, a typical passenger car's emissions in one year, and by 1.0 ton, about one transatlantic flight. For 100 mixed-forest trees over 10 years at 80 percent survival, that is about 9.7 tons, or roughly 2 cars for a year and 9 flights.",
    },
    {
      q: "How accurate is a tree carbon offset calculator?",
      a: "It is an estimate. Real absorption depends on species, rainfall, soil, fires, and how well the trees are looked after, and it can differ widely from these averages. Use it to compare planting plans, and do not count on it to cancel a large footprint without also cutting emissions.",
    },
  ],

  "recycling-savings-calculator": [
    {
      q: "How much money can I get back from recycling cans and bottles?",
      a: "The tool multiplies your yearly container count by the deposit refund you pick: $0.05 for a standard US deposit, $0.10 as used in Michigan, Oregon, and Australia, or $0.25 as in the German Pfand system. With 15 cans, 10 plastic bottles, and 5 glass bottles a week at $0.05, that is about $78 a year.",
    },
    {
      q: "Which material saves the most CO2 when recycled?",
      a: "Per item, this tool credits a glass bottle with 0.15 kg of CO2, an aluminum can with 0.1 kg, and a plastic bottle with 0.06 kg. Paper is counted by weight at 3.5 kg of CO2 per kilogram, so recycling 2 kg of paper a week outweighs all the containers in the default setup.",
    },
    {
      q: "How much energy does recycling an aluminum can save?",
      a: "The tool credits 0.4 kWh for each aluminum can, against 0.15 kWh for a plastic bottle and 0.05 kWh for a glass bottle. Aluminum leads because making it from raw ore takes far more energy than melting used cans. At 15 cans a week, that is about 312 kWh a year.",
    },
    {
      q: "How is the water saved by recycling paper calculated?",
      a: "The calculator assumes 7 gallons of water saved for every kilogram of paper or cardboard you recycle. At 2 kg a week that comes to about 728 gallons a year. Water savings apply only to paper in this tool, not to cans, plastic bottles, or glass.",
    },
    {
      q: "What do the laptop hours in my results mean?",
      a: "Laptop hours turn your energy savings into something familiar. The tool assumes a laptop draws about 65 watts, so one kilowatt-hour runs it for roughly 15 hours. Saving 403 kWh a year, the default result, equals about 6,000 hours of laptop use.",
    },
    {
      q: "How accurate is a recycling savings calculator?",
      a: "It is an estimate based on fixed per-item averages, not a measurement of your local recycling system. Real savings depend on item size, how the material is processed, and how much is rejected as contaminated. Use it to see which habits count most, and check your local deposit scheme for refund values.",
    },
  ],

  "ev-vs-petrol-calculator": [
    {
      q: "How much cheaper is an EV to run than a petrol car?",
      a: "With the default inputs, 12,000 miles a year at 25 mpg and $3.50 a gallon costs $1,680 in petrol, while an EV at 3.5 miles per kWh costs about $720 in electricity. That saves roughly $960 a year, or about 6 cents a mile against 14. Enter your local prices for a real figure.",
    },
    {
      q: "How long until an EV pays back its higher price?",
      a: "The tool divides the extra purchase price by your yearly fuel saving. A $5,000 premium and $960 saved per year gives a break-even of 5 years and 3 months. Driving more miles or paying more for fuel shortens the payback, so set the premium to match the two cars you are comparing.",
    },
    {
      q: "Does home or public charging change the cost?",
      a: "Yes, a lot. The calculator splits charging between home and public points, with 80 percent at home by default. Home power at $0.15 per kWh and public charging at $0.45 give a blended rate of about $0.21 per kWh. Move more charging to public stations and the savings shrink.",
    },
    {
      q: "How accurate is the EV vs petrol cost comparison?",
      a: "This is an estimate covering fuel, charging, and the purchase price gap you enter. The tool leaves out maintenance, insurance, tires, and battery replacement outside warranty. EVs usually need less servicing, but add those costs yourself if they differ much between your two cars.",
    },
    {
      q: "How much CO2 does a petrol car produce compared with an EV?",
      a: "The tool counts tailpipe emissions only, at 19.6 pounds of CO2 per gallon burned. A 25 mpg car driving 12,000 miles uses 480 gallons and emits about 9,400 pounds. It does not count emissions from generating electricity, so an EV's real footprint is above zero where the grid burns fossil fuels.",
    },
    {
      q: "What efficiency numbers should I enter?",
      a: "This tool works in miles and gallons, so enter miles per gallon for the petrol car and miles per kWh for the EV. If your EV shows kWh per 100 miles, divide 100 by it: 28 kWh per 100 miles is about 3.6 miles per kWh. For litres per 100 km, divide 235 by it to get US mpg.",
    },
  ],

  "video-compressor": [
    {
      q: "How do I reduce a video's file size without ruining quality?",
      a: "Start with the Balanced preset, which scales the video to 75 percent at 30 fps. Ultra Compress drops to 50 percent size and 24 fps for the smallest file, and High Quality keeps full size at 60 fps. Check the estimated size and savings first, since lower resolution and frame rate shrink files the most.",
    },
    {
      q: "Why is the compressed file a WebM and not an MP4?",
      a: "The compressor re-records your clip with your browser's built-in video encoder, which outputs WebM using VP9 or VP8. WebM plays in Chrome, Edge, Firefox, and VLC. Some phone apps and editors prefer MP4, so convert the result if you need that format, because this page does not produce MP4 files.",
    },
    {
      q: "How long can the video be, and how long does compression take?",
      a: "The compressor works in real time, so a 30 second clip takes about 30 seconds. A single run handles only the first 45 seconds of a clip, so longer videos are cut off at that point. For longer files, split the video first or use desktop software.",
    },
    {
      q: "How do I make a video small enough for WhatsApp or email?",
      a: "Choose Ultra Compress and check the estimated size. Gmail caps attachments at 25 MB and WhatsApp limits videos sent as media to about 16 MB, so aim below those numbers. Trimming the clip before you upload helps most, because file size grows with length.",
    },
    {
      q: "Which video formats can I upload?",
      a: "The tool plays your file in the browser, so it accepts anything your browser can play. MP4 and WebM work almost everywhere, and MOV works in Safari and often in Chrome. Rare formats such as AVI often fail to load. If a file will not open, convert it to MP4 first.",
    },
    {
      q: "How accurate is the estimated size before I compress?",
      a: "It is a prediction from the preset, resolution, and frame rate. The real file can come out larger or smaller depending on how much motion the video has. Screen recordings and still scenes shrink a lot, while fast action shrinks less, so compare the final size shown after the run.",
    },
  ],

  "gif-maker": [
    {
      q: "Does this tool create a real .gif file?",
      a: "No. It renders your trimmed clip as a short looping WebM video using your browser's recorder, and the file downloads as .webm. WebM plays and loops in browsers, but it is not a .gif file. If a chat app needs a true GIF, run the downloaded file through a converter.",
    },
    {
      q: "How long can the clip be?",
      a: "Rendering stops at 120 frames. At 15 fps that is 8 seconds, at 10 fps it is 12 seconds, and at 24 fps it is 5 seconds. The shortest clip is 0.5 seconds and the default selection is the first 5 seconds. Pick the part you want with the start and end sliders.",
    },
    {
      q: "What frame rate and size give the smallest file?",
      a: "Use 10 FPS with the 0.35 or 0.5 resolution scale for the smallest result. 15 FPS is the standard setting, and 24 FPS looks smoother but makes a larger file. Cutting the scale from 1.0 to 0.5 leaves a quarter of the pixels, which shrinks the file the most.",
    },
    {
      q: "What do Loop, Reverse, and Ping-Pong do?",
      a: "Loop plays your selection forward and repeats. Reverse plays it backward. Ping-Pong plays forward and then backward like a boomerang, which hides the jump at the end of clips that do not loop naturally. The speed setting runs from 0.5x slow motion to 2x fast.",
    },
    {
      q: "Does the output include sound?",
      a: "No. The tool draws frames from your video onto a canvas, so the result is silent. If you need the audio, keep the original clip. Looping animations like GIFs do not carry sound either, so silent output is normal for this kind of clip.",
    },
    {
      q: "Which video files can I use, and are there size limits?",
      a: "Choose any video your browser can play, such as MP4 or WebM. Your browser opens the file directly, so device memory is the real cap, and very long or high resolution videos can run slowly. Trim to a few seconds and lower the scale to keep things quick.",
    },
  ],

  "audio-trimmer": [
    {
      q: "What format is the trimmed audio saved in?",
      a: "The tool always exports a 16-bit WAV file with the same sample rate and channel count as your original, even if you upload an MP3. WAV holds uncompressed audio, so the file runs larger than the MP3. Convert the result to MP3 or M4A afterward if you need a smaller file.",
    },
    {
      q: "How big will the trimmed file be?",
      a: "WAV audio at 44.1 kHz stereo uses about 10 MB per minute. A 30 second ringtone clip comes to roughly 5 MB, and a 3 minute song is about 32 MB. Because MP3 files are compressed, the trimmed WAV is usually several times bigger than the file you uploaded.",
    },
    {
      q: "How do I make a ringtone from a song?",
      a: "Drag the start and end markers around the 20 to 30 seconds you want, add a short fade in and out, and download. iPhone ringtones must be M4R files under 40 seconds, so convert the WAV afterward. Many Android phones accept WAV, while others need MP3.",
    },
    {
      q: "Does trimming reduce sound quality?",
      a: "Cutting does not damage the audio. The tool decodes the file, copies the selected section, and saves it as 16-bit WAV. A compressed source such as MP3 keeps whatever the MP3 held. Changing the gain or adding fades does alter the samples, so leave them off for an untouched cut.",
    },
    {
      q: "What do the fade and gain controls do?",
      a: "Fade in and fade out each run from 0 to 3 seconds and default to 0.2 seconds, which removes the click you hear when a cut lands mid-sound. Gain raises or lowers volume from minus 10 to plus 10 dB. Boosting too far can cause clipping, so preview first.",
    },
    {
      q: "Which audio files can I upload, and is there a size limit?",
      a: "Upload any audio file your browser can decode, such as MP3, WAV, M4A, AAC, or OGG, and MP4 files with sound. There is no fixed size cap, but the whole file is decoded in memory, so very long recordings can be slow on a phone. Trim long files in parts if the page struggles.",
    },
  ],

  "screen-recorder": [
    {
      q: "How do I record my screen with sound?",
      a: "Keep System Audio ticked to capture computer sound and tick Microphone to add your voice, then choose a tab, window, or full screen. In Chrome, tick Share tab audio in the browser prompt to record a tab's sound. Full-screen system audio works mainly on Windows and ChromeOS, not on most Macs.",
    },
    {
      q: "Why is there no sound in my screen recording?",
      a: "The usual cause is that the share prompt did not include audio. Choose a Chrome tab and tick Share tab audio, and allow microphone access when asked. If the microphone prompt is denied, the tool carries on with screen audio only. The microphone is off by default, so tick it first.",
    },
    {
      q: "What format is the recording, and how large is it?",
      a: "The recorder saves a WebM file, which plays in Chrome, Edge, Firefox, and VLC. It targets a 5 Mbps video bitrate, so expect up to about 37 MB per minute. For an MP4 or a smaller file, run the recording through a converter or a video compressor.",
    },
    {
      q: "Can I record my webcam with the screen?",
      a: "Not in this tool. It records a screen, window, or browser tab plus an optional microphone, and it has no webcam overlay. To show your face, record the webcam separately with a camera app and combine the two clips in a video editor.",
    },
    {
      q: "Can I pause the recording or choose 60 FPS?",
      a: "Yes to both. Use Pause and Resume to skip parts you do not want, and pick 30 or 60 FPS before you start. 30 FPS suits tutorials and meetings, while 60 FPS makes games and scrolling look smoother but creates a bigger file. Slower computers may not reach 60.",
    },
    {
      q: "Is there a time limit on recordings?",
      a: "There is no built-in time limit. Your device's memory and storage set the ceiling, because the whole recording stays in the browser until you download it. At about 37 MB per minute, a 30 minute recording is roughly 1 GB, so record long sessions in parts.",
    },
  ],

  "daylight-saving-countdown": [
    {
      q: "When do the clocks go back in 2026?",
      a: "In the USA and Canada, clocks go back on Sunday, November 1, 2026 at 2:00 AM. Europe changes earlier, on Sunday, October 25, 2026. Australian states that use daylight saving moved forward on October 4, 2026 and go back on April 4, 2027.",
    },
    {
      q: "When does daylight saving time start in 2027?",
      a: "In the US and Canada it starts on Sunday, March 14, 2027, and in Europe on Sunday, March 28, 2027. Clocks move forward one hour, so you lose an hour of sleep and gain evening light. The countdown picks the next change for your region automatically.",
    },
    {
      q: "Do we gain or lose an hour when the clocks change?",
      a: "Clocks jump forward in spring, so 2:00 AM becomes 3:00 AM and you lose an hour. In autumn they fall back, so 2:00 AM becomes 1:00 AM and you gain an hour. Remember it as spring forward, fall back. Australia has the seasons reversed because it is in the southern hemisphere.",
    },
    {
      q: "Which regions does this countdown cover?",
      a: "It covers three rule sets: USA and Canada, the European Union, and Australia. The UK follows the same last Sunday rule as the EU, so its dates match. Countries without daylight saving time, such as Pakistan, India, and Japan, are not listed because their clocks never change.",
    },
    {
      q: "Which places skip daylight saving time?",
      a: "Hawaii and most of Arizona stay on standard time all year, as do Puerto Rico and Guam. Across Australia, Queensland, Western Australia, and the Northern Territory keep their clocks fixed, while New South Wales, Victoria, Tasmania, South Australia, and the ACT change them.",
    },
    {
      q: "How accurate is the countdown timer?",
      a: "It follows your device's clock and the standard rule for each region, and it updates every second. Local exceptions, such as a government changing the rule, are not tracked. Confirm the date with your local authority before you plan anything important around the change.",
    },
  ],

  "dog-age-calculator": [
    {
      q: "How do I convert my dog's age to human years?",
      a: "The calculator counts the first year as 15 human years and the second as 9 more, reaching 24 at age two. After that each dog year adds 4 human years for small dogs, 5 for medium, 6 for large, and 7 for giant breeds. A 10 year old medium dog comes out at about 64.",
    },
    {
      q: "Why does a big dog age faster than a small dog?",
      a: "Large breeds grow quickly and show signs of aging earlier, and their average lifespan is shorter than that of small breeds. That is why the tool adds more human years per dog year for bigger dogs. A 10 year old giant dog comes out around 80, while a small dog of the same age is about 56.",
    },
    {
      q: "Is the rule of 7 human years per dog year true?",
      a: "No. It is a rough average that ignores both size and the fast growth of the first two years. A one year old dog is closer to a teenager at about 15 than to a 7 year old child. This calculator uses the first two years and a size-based rate afterward for a closer match.",
    },
    {
      q: "What size category should my dog be in?",
      a: "Use adult weight. Small is under 20 lb, medium is 21 to 50 lb, large is 51 to 100 lb, and giant is over 100 lb. For a mixed-breed puppy, estimate adult weight from the parents or ask your vet. A Beagle counts as medium and a Labrador as large.",
    },
    {
      q: "When is a dog considered a senior?",
      a: "In this tool a dog becomes a senior once its human age passes 55. That happens at about 9.8 years for small dogs, 8.2 for medium, 7.2 for large, and 6.4 for giant breeds. The geriatric stage begins above 75 human years, and each stage comes with a care tip.",
    },
    {
      q: "How accurate is a dog age calculator?",
      a: "It is an estimate. Genetics, breed, health, and diet affect how a dog ages, so two dogs of the same size can differ. Newer research based on DNA changes suggests a different curve for some breeds. Use the result as a guide to life stage and care, and ask your vet for specifics.",
    },
  ],

  "cat-age-calculator": [
    {
      q: "How do I convert my cat's age to human years?",
      a: "A cat reaches about 15 human years at age one and 24 at age two. After that each cat year adds 4 human years, so a 3 year old cat is 28, a 10 year old is 56, and a 15 year old is 76. The tool also reads months, so a 6 month old kitten shows about 10.",
    },
    {
      q: "How old is a kitten in human years?",
      a: "The tool uses a gradual scale for the first two years: 1 month is about 1 human year, 3 months about 4, 6 months about 10, and 12 months about 15. That reflects how fast kittens develop, from weaning to teenage behavior within months. Enter the months field for an exact result.",
    },
    {
      q: "At what age is a cat considered a senior?",
      a: "This tool labels a cat as a kitten up to 6 months, junior to 2 years, prime to 6 years, mature to 10 years, senior from 10 to 14 years, and geriatric after 14. Older cats benefit from vet checks every 6 months to catch kidney and thyroid problems early.",
    },
    {
      q: "Does it matter if my cat lives indoors or outdoors?",
      a: "The age math stays the same, but the tool changes its care tips. Indoor cats get advice on enrichment and weight control, while outdoor cats get reminders about flea, tick, and heartworm prevention and injury checks. Cats kept indoors often live longer, commonly into their mid teens.",
    },
    {
      q: "How long do cats live on average?",
      a: "Indoor cats commonly live 12 to 18 years, and some reach 20 or more, which comes to 96 in human terms by this tool. Outdoor cats tend to live shorter lives because of traffic, fights, and disease. Neutering, vaccination, and regular vet visits all add years.",
    },
    {
      q: "How accurate is a cat years to human years calculator?",
      a: "It is an estimate. The 15, then 24, then plus 4 per year pattern is a common veterinary guideline, not a biological measurement. Breed, health, and diet change how a cat ages, so rely on the life stage and care tip more than on the exact human number.",
    },
  ],
};

// ---------------------------------------------------------------------------------------
let src = fs.readFileSync(FILE, "utf8");

// Index of the "]" that closes the "[" at openIdx, skipping over string literals.
function closingBracket(s, openIdx) {
  let depth = 0, inStr = false, quote = "";
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = true; quote = c; continue; }
    if (c === "[") depth++;
    else if (c === "]" && --depth === 0) return i;
  }
  return -1;
}

const done = [], missing = [];
for (const [slug, items] of Object.entries(FAQS)) {
  const start = src.indexOf(`\n  "${slug}": {`);
  if (start < 0) { missing.push(slug); continue; }
  const rest = src.slice(start + 1);
  const next = rest.slice(1).search(/\n  "[a-z0-9-]+": \{/);
  const end = next < 0 ? src.length : start + 1 + 1 + next;
  const faqAt = src.indexOf("\n    faq: [", start);
  if (faqAt < 0 || faqAt > end) { missing.push(slug + " (no faq array)"); continue; }
  const open = src.indexOf("[", faqAt);
  const close = closingBracket(src, open);
  if (close < 0) { missing.push(slug + " (bracket)"); continue; }
  const body =
    "[\n" +
    items
      .map((f) => `      {\n        q: ${JSON.stringify(f.q)},\n        a: ${JSON.stringify(f.a)},\n      },\n`)
      .join("") +
    "    ]";
  src = src.slice(0, open) + body + src.slice(close + 1);
  done.push(slug);
}

fs.writeFileSync(FILE, src);
console.log(`Updated FAQs for ${done.length} of ${Object.keys(FAQS).length} tools.`);
if (missing.length) console.log("Not found:", missing.join(", "));
console.log("\nVerify with:\nnpm run check:seo -- --slug " + done.join(","));
