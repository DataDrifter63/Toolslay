// Copy for the /contact and /thank-you pages. Keep every claim here true: it is a page Google reviewers read.
// Reply time and the Karachi time zone come from the About page. Change REPLY_TIME if your real turnaround differs.
export const REPLY_TIME = "two to three business days";

export const CONTACT = {
  seoTitle: "Contact Us: Report a Bug or Suggest a Tool",
  description:
    "Contact the Toolslay team to report a bug, suggest a free tool, flag a wrong result or ask a privacy question. We read every message and reply by email.",
  h1: "Contact Toolslay",
  intro:
    "Found a bug, want a tool we do not have yet, or spotted a number that looks wrong? Send us a message. It lands in the inbox of the person who builds the tools, so you get a real reply instead of a ticket number.",

  topics: [
    { value: "bug", label: "Report a bug" },
    { value: "tool-request", label: "Suggest a new tool" },
    { value: "wrong-result", label: "Report a wrong result or outdated fact" },
    { value: "privacy-legal", label: "Privacy, copyright or legal request" },
    { value: "other", label: "Something else" },
  ],

  details: [
    {
      icon: "mail",
      title: "Email us directly",
      text: "Best for screenshots and longer reports. Write to the address below and your message reaches the same inbox as the form.",
    },
    {
      icon: "person",
      title: "Who replies",
      text: "Shah Mir Amir builds and runs Toolslay from Karachi, Pakistan (UTC+5) and reads every message himself. If you write during the US day, your reply may arrive the next morning his time.",
    },
    {
      icon: "clock",
      title: "How long it takes",
      text: `We aim to reply within ${REPLY_TIME}. Bug reports and wrong results go to the front of the line.`,
    },
  ],

  reasons: [
    {
      icon: "bug",
      title: "Report a bug",
      text: "Tell us the tool, what you did and what went wrong. The exact numbers you typed help us reproduce the problem in minutes.",
    },
    {
      icon: "idea",
      title: "Suggest a tool",
      text: "Searched for a tool and could not find it? Describe the job you wanted done. Ideas that several people ask for move up our build list.",
    },
    {
      icon: "check",
      title: "Flag a wrong result",
      text: "Formulas and rules change over time. Send us the page link and a source, and we will check the tool and update the explanation.",
    },
    {
      icon: "legal",
      title: "Privacy, copyright or legal",
      text: "Write to us about your data, a copyright concern or anything that needs a formal answer. Include the page address so we find it fast.",
    },
  ],

  tips: [
    "Name the tool, or paste the address of the page.",
    "Say what you expected and what you got instead.",
    "Include the values you typed, but leave out anything private.",
    "Mention your browser and device, such as Chrome on Windows or Safari on an iPhone.",
    "Never send passwords, ID numbers or private files. We do not need them to help.",
  ],

  steps: [
    {
      icon: "read",
      title: "We read it",
      text: "Your message goes to one inbox, and a person reads it. No bot sorts it first.",
    },
    {
      icon: "reply",
      title: "We reply by email",
      text: "If we need more detail, we ask. If we can reproduce your bug, we tell you what we found.",
    },
    {
      icon: "fix",
      title: "We fix or add it",
      text: "Fixes go live on the site. Tool requests join the build list, ranked by how many people ask.",
    },
  ],

  quickLinks: [
    { href: "/about", title: "About Toolslay", text: "Who builds the site, how it stays free and which tools use an outside service." },
    { href: "/privacy-policy", title: "Privacy Policy", text: "What data we handle, plus our cookie and advertising practices." },
    { href: "/terms", title: "Terms of Service", text: "The rules for using the tools and how to treat the results." },
    { href: "/tools", title: "All tools", text: "Browse every tool by category, or search for the one you need." },
  ],

  faq: [
    {
      q: "How do I contact Toolslay?",
      a: "Use the form on this page or email hello@toolslay.com. Both reach the same inbox. The form is quicker to fill in, and email lets you attach a screenshot of the problem you found.",
    },
    {
      q: "How long does a reply take?",
      a: `We aim to reply within ${REPLY_TIME}, and bug reports go first. Shah Mir Amir works from Karachi (UTC+5), so a message sent during the US day often gets its answer the next morning there.`,
    },
    {
      q: "Can I suggest a new tool?",
      a: "Yes. Describe the job you want done and, if you can, the sites you tried. We add tools based on what people ask for and search for, so a request that several visitors repeat moves up the list. We cannot promise a release date.",
    },
    {
      q: "What should I include in a bug report?",
      a: "Give us the tool name or page address, the values you entered, what happened and what you expected. Add your browser and device. With those five details, we can usually reproduce the problem on the first try.",
    },
    {
      q: "Can you give me medical, legal or financial advice?",
      a: "No. Our calculators give estimates for planning and learning, and we cannot answer personal health, money or legal questions. For decisions that matter, ask a qualified professional or check an official source.",
    },
    {
      q: "Can you help with a problem on another website?",
      a: "We only support Toolslay's own tools. We run no user accounts, so there is nothing to reset, and we cannot fix problems on other websites or recover files from them. We are happy to look into anything on this site.",
    },
    {
      q: "What do you do with my name and email?",
      a: "We use them only to reply to you. The form hands your message to a delivery service so it can reach our inbox. We do not sell your information, and sending a message does not sign you up for anything. The Privacy Policy has the details.",
    },
  ],
};

// Copy for the /thank-you page.
export const THANK_YOU = {
  seoTitle: "Thank You",
  description: "Thanks for contacting Toolslay. Here is what happens next with your message.",
  h1: "Thanks, your message is in",
  intro: `We got your message and a person will read it. Expect a reply by email within ${REPLY_TIME}. Bug reports and wrong results go first.`,
  emailNote:
    "If your email app opened, press Send to deliver your message. Nothing reaches us until you do.",
  steps: [
    { title: "We read it", text: "Your message goes straight to the person who builds the tools." },
    { title: "We reply by email", text: "Check your inbox, and your spam folder too, in case our reply lands there." },
    { title: "We fix or add it", text: "Bugs get fixed on the live site. Tool ideas join our build list." },
  ],
};
