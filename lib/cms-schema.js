const image = 'https://i0.wp.com/thedispatch.com/wp-content/uploads/2026/03/KevinKiley.jpg?w=1400&strip=all&ssl=1';

const rawGroups = [
  ['Site identity', 'The name used in the masthead.', [
    ['publication', 'Publication name', 'The Kiley Record', 'short']
  ]],
  ['Scrolling banner', 'These four messages repeat in order, separated by dots.', [
    ['ticker-one', 'Banner item 1', 'Kiley backed Trump’s Big Lie', 'short'],
    ['ticker-two', 'Banner item 2', 'Voted with Trump’s recommendations', 'short'],
    ['ticker-three', 'Banner item 3', 'Supported cuts to health care and food assistance', 'short'],
    ['ticker-four', 'Banner item 4', 'Opposed abortion-rights protections', 'short']
  ]],
  ['Hero', 'The opening statement and main image.', [
    ['hero-flag', 'Hero label', 'The Kiley Record', 'short'],
    ['hero-title', 'Headline', '“Independent”?<br><span class="pct">He votes with Trump<br><span class="score-stamp">98%</span> of the time.</span>', 'long'],
    ['hero-summary', 'Hero summary', 'From backing Trump’s Big Lie to supporting health-care cuts, opposing abortion-rights protections, and embracing anti-vaccine rhetoric, Kevin Kiley’s record tells a clear story.', 'long'],
    ['hero-meta', 'Hero metadata', '<span>Public record briefing</span><span>California’s 3rd District</span>', 'long'],
    ['dossier-label', 'Photo label', 'Dossier photo', 'short'],
    ['dossier-caption', 'Photo caption', 'Rep. Kevin Kiley', 'short'],
    ['dossier-subtitle', 'Photo caption detail', 'California representative · “Independent”', 'short'],
    ['hero-image', 'Hero image', image, 'image']
  ]],
  ['Paper Trail', 'Five cards in chronological order. Choose one card to highlight; add a link only where it helps.', [
    ['timeline-heading', 'Section heading', 'The Paper Trail', 'short'],
    ['timeline-highlight', 'Highlighted card', 'three', 'select', [['one', 'Card 1'], ['two', 'Card 2'], ['three', 'Card 3'], ['four', 'Card 4'], ['five', 'Card 5']]],
    ['timeline-one-year', 'Card 1 year', '2016', 'short'],
    ['timeline-one-label', 'Card 1 label', 'Republican', 'short'],
    ['timeline-one-copy', 'Card 1 copy', 'Elected to the California State Assembly as a Republican.', 'long'],
    ['timeline-one-link', 'Card 1 optional link', '', 'url'],
    ['timeline-two-year', 'Card 2 year', '2022', 'short'],
    ['timeline-two-label', 'Card 2 label', 'Republican', 'short'],
    ['timeline-two-copy', 'Card 2 copy', 'Elected to the U.S. House on the Republican line.', 'long'],
    ['timeline-two-link', 'Card 2 optional link', '', 'url'],
    ['timeline-three-year', 'Card 3 year', '2026', 'short'],
    ['timeline-three-label', 'Card 3 label', '"Independent"', 'short'],
    ['timeline-three-copy', 'Card 3 copy', 'Switches his party affiliation. The political agenda he supports does not change.', 'long'],
    ['timeline-three-link', 'Card 3 optional link', '', 'url'],
    ['timeline-four-year', 'Card 4 year', '2026', 'short'],
    ['timeline-four-label', 'Card 4 label', 'With Trump', 'short'],
    ['timeline-four-copy', 'Card 4 copy', 'After the switch, his record remains aligned with Trump and the MAGA-led GOP.', 'long'],
    ['timeline-four-link', 'Card 4 optional link', '', 'url'],
    ['timeline-five-year', 'Card 5 year', 'Feb 2026', 'short'],
    ['timeline-five-label', 'Card 5 label', 'Conservative Republican', 'short'],
    ['timeline-five-copy', 'Card 5 copy', 'Kiley posted a video describing himself as a "Conservative Republican Congressman," saying "no one has fought Gavin Newsom harder than Kevin."', 'long'],
    ['timeline-five-link', 'Card 5 optional link', 'https://www.youtube.com/watch?v=uHfb22zDRDw&t=6s', 'url']
  ]],
  ['Score', 'The two comparison bars and their labels.', [
    ['score-heading', 'Section heading', 'The Score', 'short'],
    ['score-one-label', 'First bar label', 'With President Trump', 'short'],
    ['score-one-detail', 'First bar detail', '210 of 214 scored votes', 'short'],
    ['score-one-value', 'First bar value', '98%', 'short'],
    ['score-two-label', 'Second bar label', 'With the MAGA-led GOP', 'short'],
    ['score-two-detail', 'Second bar detail', '203 of 214 scored votes', 'short'],
    ['score-two-value', 'Second bar value', '95%', 'short'],
    ['score-photo-caption', 'Score photo caption', 'The record in focus', 'short'],
    ['score-image', 'Score image', 'score-photo.png', 'image']
  ]],
  ['The Record', 'The lead story, three "core record" cards (reorderable among themselves), and two "also in the record" cards (reorderable among themselves).', [
    ['record-heading', 'Section heading', 'The Record', 'short'],
    ['context-kicker', 'Election label', 'The 2020 election', 'short'],
    ['context-title', 'Election title', "He backed Trump's Big Lie", 'short'],
    ['context-summary', 'Election copy', "For years, Kevin Kiley declined to denounce Trump's false claims that the 2020 election was stolen. That record belongs in any accounting of the politics he chose to embrace.", 'long'],
    ['election-image', 'Election image', image, 'image'],
    ['record-one-order', 'Health care position', '1', 'select', [['1', '1st'], ['2', '2nd'], ['3', '3rd']]],
    ['record-one-kicker', 'Health care label', 'Health care', 'short'],
    ['record-one-title', 'Health care title', 'Cuts with real consequences', 'short'],
    ['record-one-copy', 'Health care copy', 'Kiley supported Trump’s budget bill, which would take health care from nearly 44,000 people and cut food assistance for more than 41,000 households in the old CA-06. He also aligned himself with anti-vaccine MAGA rhetoric and opposed science-based public-health policy.', 'long'],
    ['health-image', 'Health care image', image, 'image'],
    ['record-two-order', 'Retirement security position', '2', 'select', [['1', '1st'], ['2', '2nd'], ['3', '3rd']]],
    ['record-two-kicker', 'Retirement security label', 'Retirement security', 'short'],
    ['record-two-title', 'Retirement security title', 'Higher costs for seniors', 'short'],
    ['record-two-copy', 'Retirement security copy', 'In 2024, Kiley helped shape a Republican budget that would raise Social Security’s retirement age and shift more Medicare costs onto seniors.', 'long'],
    ['seniors-image', 'Retirement security image', image, 'image'],
    ['record-three-order', 'Abortion rights position', '3', 'select', [['1', '1st'], ['2', '2nd'], ['3', '3rd']]],
    ['record-three-kicker', 'Abortion rights label', 'Abortion rights', 'short'],
    ['record-three-title', 'Abortion rights title', 'Opposed Proposition 1', 'short'],
    ['record-three-copy', 'Abortion rights copy', 'Kiley opposed Proposition 1, the 2022 ballot measure that explicitly protected abortion and contraception in California’s constitution.', 'long'],
    ['abortion-image', 'Abortion rights image', image, 'image'],
    ['record-four-order', 'Campaign donors position', '1', 'select', [['1', '1st'], ['2', '2nd']]],
    ['record-four-kicker', 'Campaign donors label', 'Campaign donors', 'short'],
    ['record-four-title', 'Campaign donors title', "Backed by Trump's biggest donors", 'short'],
    ['record-four-copy', 'Campaign donors copy', "Kiley's campaign has drawn support from some of Donald Trump's biggest donors, tying his political fortunes to the same network bankrolling Trump's agenda.", 'long'],
    ['donors-image', 'Campaign donors image', image, 'image'],
    ['record-four-link-one', 'Campaign donors source link 1', 'https://www.sacbee.com/news/politics-government/capitol-alert/article316276393.html', 'url'],
    ['record-four-link-two', 'Campaign donors source link 2', 'https://www.sacbee.com/news/politics-government/capitol-alert/article315566605.html', 'url'],
    ['record-five-order', 'January 6 position', '2', 'select', [['1', '1st'], ['2', '2nd']]],
    ['record-five-kicker', 'January 6 label', 'January 6', 'short'],
    ['record-five-title', 'January 6 title', 'Flip-flopped on the case against Trump', 'short'],
    ['record-five-copy', 'January 6 copy', "Kiley's position on the case against Trump for January 6 has shifted over time, reversing course as he aligned himself more closely with Trump.", 'long'],
    ['jan6-image', 'January 6 image', image, 'image'],
    ['record-five-link', 'January 6 source link', 'https://www.sacbee.com/news/politics-government/capitol-alert/article316167756.html', 'url']
  ]],
  ['Closing', 'The final call to action and footer.', [
    ['closing-title', 'Closing headline', 'Read it. Check it. <span>Share it.</span>', 'short'],
    ['closing-copy', 'Closing copy', 'The record is public. The question is what it adds up to.', 'long'],
    ['closing-button-label', 'Red button text', 'Learn more', 'short'],
    ['closing-button-link', 'Red button link', '', 'url'],
    ['footer-text', 'Footer text', 'Paid for by Dr. Richard Pan for Congress', 'short']
  ]],
  ['Sharing', 'The copy and destination used for social posts.', [
    ['share-button-label', 'Share button label', 'Share his record', 'short'],
    ['share-kicker', 'Share modal label', 'Share the record', 'short'],
    ['share-title', 'Share modal headline', 'Share his record', 'short'],
    ['share-copy', 'Share modal copy', 'Choose a platform to share this page.', 'long'],
    ['share-text', 'Post text', 'Take a look at Kevin Kiley’s record.', 'long'],
    ['share-url', 'Website URL', '', 'url']
  ]],
  ['SEO & AI discovery', 'Search, social-preview, and AI-readable context for the site.', [
    ['seo-title', 'Page title', 'The Kiley Record | Kevin Kiley Accountability', 'short'],
    ['seo-description', 'Search description', 'A public-record briefing on Kevin Kiley’s political record.', 'long'],
    ['seo-keywords', 'Search keywords', 'Kevin Kiley, California, public record', 'short'],
    ['seo-social-image', 'Social sharing image', '', 'image'],
    ['favicon', 'Browser tab icon (favicon)', '', 'image'],
    ['ai-summary', 'AI-readable site summary', 'The Kiley Record is a public-record briefing about Kevin Kiley’s political record, including his support for Trump’s false 2020-election claims, positions on health care and abortion rights, and continued alignment with Trump and the MAGA-led GOP.', 'long']
  ]]
];

export const cmsGroups = rawGroups.map(([title, description, fields]) => ({
  title,
  description,
  fields: fields.map(([key, label, defaultValue, kind, options]) => ({ key, label, defaultValue, kind, options: options || [] }))
}));

export const allFields = cmsGroups.flatMap(group => group.fields);

export function defaultContent() {
  return Object.fromEntries(allFields.map(field => [field.key, field.defaultValue]));
}
