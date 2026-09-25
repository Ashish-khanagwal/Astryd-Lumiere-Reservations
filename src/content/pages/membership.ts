import type { ContentPageDefinition } from '../../types';

export const membershipContent: ContentPageDefinition = {
  key: 'membership',
  label: 'Membership',
  description:
    'Your membership page: the headings, the sign-up form and the messages members see. The plans themselves (names, prices, perks) are managed under Membership.',
  previewHash: '#/membership',
  module: 'membership',
  groups: [
    // ---- Variant A - Loyalty/Rewards ----
    {
      id: 'a-intro',
      title: 'Page heading',
      description: 'The text at the top of the page.',
      variants: ['a'],
      fields: [
        { key: 'a_eyebrow', label: 'Small label above the heading', type: 'text' },
        { key: 'a_heading', label: 'Heading', type: 'text' },
        { key: 'a_subheading', label: 'Text under the heading', type: 'textarea' },
      ],
    },
    {
      id: 'a-steps',
      title: 'How it works',
      description: 'The three numbered steps shown under the heading.',
      variants: ['a'],
      fields: [
        {
          key: 'a_steps',
          label: 'Steps',
          type: 'list',
          fixedItems: true,
          itemFields: [
            { key: 'number', label: 'Number shown in the circle', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      id: 'a-join',
      title: 'Sign-up',
      description: 'The form shown after a visitor picks a plan, and the thank-you message.',
      variants: ['a'],
      fields: [
        { key: 'a_joinButton', label: 'Join button', type: 'text' },
        { key: 'a_successHeading', label: 'Thank-you heading', type: 'text' },
        {
          key: 'a_successMessage',
          label: 'Thank-you message',
          type: 'textarea',
          hint: '{email} is replaced with the email address the visitor entered.',
        },
      ],
    },

    // ---- Variant B - Plan Tiers + Check-in ----
    {
      id: 'b-intro',
      title: 'Page heading',
      description: 'The text at the top of the page.',
      variants: ['b'],
      fields: [
        { key: 'b_eyebrow', label: 'Small label above the heading', type: 'text' },
        { key: 'b_heading', label: 'Heading', type: 'text' },
      ],
    },
    {
      id: 'b-plans',
      title: 'Plan cards',
      variants: ['b'],
      fields: [
        { key: 'b_popularBadge', label: 'Badge on the highlighted plan', type: 'text', hint: 'Shown on the second plan.' },
        { key: 'b_planButton', label: 'Plan button', type: 'text' },
      ],
    },
    {
      id: 'b-join',
      title: 'Sign-up',
      description: 'The form shown after a visitor picks a plan, and the thank-you message.',
      variants: ['b'],
      fields: [
        { key: 'b_confirmButton', label: 'Confirm button', type: 'text' },
        { key: 'b_successHeading', label: 'Thank-you heading', type: 'text' },
        {
          key: 'b_successMessage',
          label: 'Thank-you message',
          type: 'textarea',
          hint: '{email} is replaced with the email address the visitor entered.',
        },
      ],
    },
    {
      id: 'b-lookup',
      title: 'Member check-in history',
      description: 'The box at the bottom where existing members look up their visits.',
      variants: ['b'],
      fields: [
        { key: 'b_lookupHeading', label: 'Heading', type: 'text' },
        { key: 'b_lookupButton', label: 'Look-up button', type: 'text' },
        { key: 'b_checkInsOne', label: 'Visit count (one visit)', type: 'text', hint: '{count} is replaced with the number of visits.' },
        { key: 'b_checkInsMany', label: 'Visit count (several visits)', type: 'text', hint: '{count} is replaced with the number of visits.' },
      ],
    },

    // ---- Variant C - VIP/Store Credit Club ----
    {
      id: 'c-intro',
      title: 'Page heading',
      description: 'The text at the top of the page.',
      variants: ['c'],
      fields: [
        { key: 'c_eyebrow', label: 'Small label above the heading', type: 'text' },
        { key: 'c_heading', label: 'Heading', type: 'text' },
      ],
    },
    {
      id: 'c-plans',
      title: 'Plan cards',
      variants: ['c'],
      fields: [
        { key: 'c_badge', label: 'Badge on each plan', type: 'text' },
        { key: 'c_perksHeading', label: 'Heading above the perks list', type: 'text' },
        { key: 'c_planButton', label: 'Plan button', type: 'text' },
      ],
    },
    {
      id: 'c-join',
      title: 'Sign-up',
      description: 'The form shown after a visitor picks a plan, and the thank-you message.',
      variants: ['c'],
      fields: [
        { key: 'c_confirmButton', label: 'Confirm button', type: 'text' },
        { key: 'c_successHeading', label: 'Thank-you heading', type: 'text' },
        {
          key: 'c_successMessage',
          label: 'Thank-you message',
          type: 'textarea',
          hint: '{email} is replaced with the email address the visitor entered.',
        },
      ],
    },
    {
      id: 'c-lookup',
      title: 'Membership status check',
      description: 'The box at the bottom where existing members check their status.',
      variants: ['c'],
      fields: [
        { key: 'c_lookupHeading', label: 'Heading', type: 'text' },
        { key: 'c_lookupButton', label: 'Check button', type: 'text' },
        { key: 'c_statusLine', label: 'Status line', type: 'text', hint: '{status} is replaced with the member\'s status, e.g. active.' },
        { key: 'c_memberSince', label: '"Member since" line', type: 'text', hint: '{date} is replaced with the month and year they joined.' },
      ],
    },

    // ---- Shared micro-labels ----
    {
      id: 'form-labels',
      title: 'Sign-up form labels',
      advanced: true,
      fields: [
        { key: 'joinFormHeading', label: 'Form heading', type: 'text', hint: '{plan} is replaced with the chosen plan name.' },
        { key: 'namePlaceholder', label: 'Name box - example text', type: 'text' },
        { key: 'emailPlaceholder', label: 'Email box - example text', type: 'text' },
        { key: 'phonePlaceholder', label: 'Phone box - example text', type: 'text' },
      ],
    },
    {
      id: 'lookup-labels',
      title: 'Member look-up labels',
      advanced: true,
      variants: ['b', 'c'],
      fields: [
        { key: 'lookupEmailPlaceholder', label: 'Email box - example text', type: 'text' },
        { key: 'lookupNotFound', label: 'No membership found', type: 'text' },
      ],
    },
    {
      id: 'a-messages',
      title: 'Sign-up messages',
      description: 'Pop-up messages shown after the visitor presses Join.',
      advanced: true,
      variants: ['a'],
      fields: [
        { key: 'a_joinSuccessToast', label: 'Signed up', type: 'text' },
        { key: 'a_joinErrorToast', label: 'Sign-up failed', type: 'text' },
      ],
    },
    {
      id: 'b-messages',
      title: 'Sign-up messages',
      description: 'Pop-up messages shown after the visitor confirms.',
      advanced: true,
      variants: ['b'],
      fields: [
        { key: 'b_joinSuccessToast', label: 'Signed up', type: 'text' },
        { key: 'b_joinErrorToast', label: 'Sign-up failed', type: 'text' },
      ],
    },
    {
      id: 'c-messages',
      title: 'Sign-up messages',
      description: 'Pop-up messages shown after the visitor confirms.',
      advanced: true,
      variants: ['c'],
      fields: [
        { key: 'c_joinSuccessToast', label: 'Signed up', type: 'text' },
        { key: 'c_joinErrorToast', label: 'Sign-up failed', type: 'text' },
      ],
    },
  ],
  defaults: {
    a_eyebrow: 'Rewards',
    a_heading: 'A little something extra, every visit.',
    a_subheading: 'Join for free perks, or upgrade to a paid tier for the full experience.',
    a_steps: [
      { id: 'pick', number: '1', title: 'Pick a tier', description: 'Choose the plan that fits how often you visit.' },
      { id: 'signup', number: '2', title: 'Sign up', description: 'Tell us who you are - takes under a minute.' },
      { id: 'enjoy', number: '3', title: 'Enjoy the perks', description: "We'll recognize you next time you visit." },
    ],
    a_joinButton: 'Join now',
    a_successHeading: "You're in!",
    a_successMessage: 'A confirmation has been sent to {email}. See you soon.',

    b_eyebrow: 'Membership',
    b_heading: 'Choose your plan',
    b_popularBadge: 'Most Popular',
    b_planButton: 'Join',
    b_confirmButton: 'Confirm',
    b_successHeading: 'Welcome aboard!',
    b_successMessage: 'A confirmation has been sent to {email}.',
    b_lookupHeading: 'Already a member? Check your visits',
    b_lookupButton: 'Look up',
    b_checkInsOne: '{count} check-in',
    b_checkInsMany: '{count} check-ins',

    c_eyebrow: 'VIP Club',
    c_heading: 'Unlock early access & member perks',
    c_badge: 'VIP',
    c_perksHeading: 'Early access perks',
    c_planButton: 'Become a member',
    c_confirmButton: 'Confirm',
    c_successHeading: "You're on the list!",
    c_successMessage: 'A confirmation has been sent to {email}.',
    c_lookupHeading: 'Already a member?',
    c_lookupButton: 'Check status',
    c_statusLine: '{status} member',
    c_memberSince: 'Member since {date}',

    joinFormHeading: 'Join {plan}',
    namePlaceholder: 'Full name',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Phone',
    lookupEmailPlaceholder: 'Your email',
    lookupNotFound: 'No membership found for that email.',

    a_joinSuccessToast: 'Welcome to the club!',
    a_joinErrorToast: 'Unable to sign you up right now.',
    b_joinSuccessToast: 'Membership activated!',
    b_joinErrorToast: 'Unable to activate membership right now.',
    c_joinSuccessToast: "You're on the list!",
    c_joinErrorToast: 'Unable to sign you up right now.',
  },
};
