-- Two sample posts so you can see the new blog design (and the "Read next" card) right away.
-- Run docs/blog-migration.sql first. Safe to re-run: existing sample rows are updated.
-- Add a featured image later by editing each post in /admin.

insert into posts (title, slug, content, meta_description, category, published, published_at, related_tool)
values (
  'Password vs Passphrase: Which One Is Actually Safer?',
  'password-vs-passphrase',
  $body$Passwords and passphrases both protect your accounts, but they feel very different to use. One is a short, dense jumble. The other is a handful of ordinary words. Which one should you trust with your email, your bank and your laptop?

The short answer: either can be strong. What matters is that it is **long, random and used on one account only**. Here is how to choose.

:::takeaways
- Length and randomness matter far more than clever symbols.
- A passphrase is easier to remember and type. A password fits strict site rules more easily.
- Use a password manager for most accounts and a passphrase for the few secrets you must remember.
:::

## What is the difference?

A **password** is a string of characters: letters, numbers and symbols, such as `7vQ#m2Lx$rT9`. A **passphrase** is several words joined together, such as `lamp-orbit-pepper-cloud-river`. Both are just secrets. The only real difference is how you build them.

:::vs Password | Passphrase
- Short, dense string of mixed characters
- Almost impossible to memorize
- Fits sites with tight length limits
---
- Several random words
- Easy to read, say and type
- Needs more characters for the same strength
:::

## How strong is each one?

Security people measure strength in **bits of entropy**. Every extra bit doubles the number of guesses an attacker needs, so small differences add up fast. These figures assume the characters or words are chosen truly at random.

:::stats
- 105 bits | 16 random characters from 94 symbols
- 65 bits | 5 random words from a 7,776-word list
- 78 bits | 6 random words from the same list
:::

Notice that a six-word passphrase lands in the same league as a random password of about 12 characters. Words are longer to type, but each one carries a lot of unpredictability.

## Side by side

| Feature | Password | Passphrase |
| --- | :---: | :---: |
| Easy to remember | ✗ | ✓ |
| Easy to type on a phone | ✗ | ✓ |
| Fits short length limits | ✓ | ✗ |
| Works well in a password manager | ✓ | ✓ |
| Strong when random and long | ✓ | ✓ |

:::proscons Passphrase pros | Passphrase cons
- Easy to remember and say aloud
- Fewer typing mistakes
- Strong without odd symbols
---
- Longer to type
- Some sites cap the length
- Weak if you pick the words yourself
:::

:::warning Never pick the words yourself
Song lyrics, famous quotes and phrases from your own life are guessable. Let a random generator choose the words, then keep them in that order.
:::

## Which one should you use?

:::steps
1. **Let a password manager handle most accounts.** It creates a long random password for every site, so you never have to remember them.
2. **Use a passphrase for the few you must type.** Your manager's master password, your device login and your email recovery are good fits.
3. **Make it long.** Aim for at least 16 characters, or six or more random words from a large word list.
4. **Turn on two-factor authentication.** Even a strong secret helps less if someone tricks you into typing it on a fake page.
:::

:::tip Match the secret to the job
If a site accepts long input, a passphrase is friendlier. If it limits you to 12 or 16 characters, a random password from a generator is the better choice.
:::

Ready to try both? Generate a passphrase here:

:::tool passphrase-generator

:::note About word lists
The figures above use a 7,776-word list, the size popular dice-based word lists use. The Toolslay passphrase generator uses a smaller built-in list of 112 words, so each word adds about 6.8 bits instead of 12.9. For anything important, raise the word count to eight or more, or use the password generator below instead.
:::

:::tool password-generator

Want to go deeper on length first?

:::post how-long-should-a-password-be

## Common questions

:::faq
### Is a passphrase safer than a password?
It can be, if it is long and random. A passphrase of several random words is easier to remember and type, and its length gives it strong entropy. A passphrase of only two or three words is weak.

### How many words should a passphrase have?
For important accounts, use at least six random words from a large word list, which gives roughly 78 bits. Use more words if the word list is small.

### Do numbers and symbols make a passphrase stronger?
A little. Each extra word adds more strength than one extra symbol, and words are easier to remember. Add a number or symbol only when a site demands it.

### Should I change my passwords regularly?
Current guidance, including NIST's digital identity guidelines, advises against forcing routine changes. Change a password when you suspect it was exposed, and never reuse it elsewhere.
:::
$body$,
  'Password or passphrase? Compare strength, memorability and real-world use, then pick the right one for each account.',
  'Security',
  true,
  now(),
  'passphrase-generator,password-generator'
)
on conflict (slug) do update set
  title = excluded.title, content = excluded.content, meta_description = excluded.meta_description,
  category = excluded.category, related_tool = excluded.related_tool, published = true;

insert into posts (title, slug, content, meta_description, category, published, published_at, related_tool)
values (
  'How Long Should a Password Be?',
  'how-long-should-a-password-be',
  $body$Ask ten people how long a password should be and you will get ten answers. Websites make it worse by accepting eight characters and calling that strong. Here is a simple rule you can actually follow.

:::takeaways
- Length beats complexity: every extra character multiplies the guesses an attacker needs.
- Eight characters is the bare floor in official guidance, not a target.
- Aim for 16 or more on accounts that matter, and use a different password on every site.
:::

## A length guide by account type

| Account type | Suggested minimum | Why |
| --- | :---: | --- |
| Email, banking, work | 16+ characters | These unlock your other accounts |
| Social media, shopping | 12+ characters | Real damage, but limited reach |
| Master password for a manager | 6+ random words | You must remember it yourself |

:::tip Randomness is part of length
A 16-character password built from your pet's name and your birth year is far weaker than its length suggests. Attackers try guessable patterns first, so let a generator choose the characters.
:::

## Why longer wins

Each character you add multiplies the number of possible passwords. A random password drawn from letters, numbers and symbols gains roughly 6.5 bits of strength per character, which means every extra character makes the job about 90 times harder for an attacker.

:::stats
- 8 | characters: the minimum most sites accept
- 12 | characters: a sensible floor for everyday accounts
- 16+ | characters: the target for email and banking
:::

## Quick checklist

:::steps
1. **Generate it, do not invent it.** Random characters beat clever ideas.
2. **Use a unique password per site.** One breach should never open a second door.
3. **Store it in a password manager.** Then length costs you nothing.
:::

:::tool password-generator
$body$,
  'A simple length guide for passwords: what to use for email, banking, social accounts and your password manager.',
  'Security',
  true,
  now() - interval '2 days',
  'password-generator'
)
on conflict (slug) do update set
  title = excluded.title, content = excluded.content, meta_description = excluded.meta_description,
  category = excluded.category, related_tool = excluded.related_tool, published = true;
