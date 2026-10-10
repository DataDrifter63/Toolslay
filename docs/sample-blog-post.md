Passwords and passphrases both protect your accounts, but they feel very different to use. One is a short, dense jumble. The other is a handful of ordinary words. Which one should you trust with your email, your bank and your laptop?

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
