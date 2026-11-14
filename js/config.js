/* ==========================================================================
   config.js  ·  EVERYTHING YOU WILL WANT TO EDIT LIVES HERE
   --------------------------------------------------------------------------
   • Text, dates, venue, profiles, story, image paths, music and share message
     are all read from this file when the page loads.
   • The text written inside index.html is only a fallback; this file wins.
   • Anything still written like  [Add Date]  is a placeholder — replace it
     with the real detail and the dashed "placeholder" styling disappears.
   • Nothing has been invented: unknown details are left as placeholders.
   ========================================================================== */

window.WEDDING_CONFIG = {

  /* ----------------------------------------------------------- the couple */
  couple: {
    bride: 'Juliana',
    groom: 'Pedro',
    monogram: 'J & P',      // loader + navigation
    initials: 'J&P'         // wax seal on the envelope
  },

  /* ------------------------------------------------------------ the day
     Change the date or time here and the hero, countdown, calendar file,
     detail cards and closing section all update automatically.            */
  wedding: {
    date: '2027-12-15',            // YYYY-MM-DD
    time: '11:00',                 // 24-hour HH:MM   (11:00 = 11 am)
    utcOffset: '+05:30',           // time zone of the venue (+05:30 = India / Kerala)
    durationMinutes: 180,          // used for the calendar entry only – edit freely
    timeLabel: '',                 // optional override, e.g. '11:00 am'. Leave '' to auto-format
    calendarTitle: 'Wedding Celebration – Juliana & Pedro',
    calendarDescription: 'Join us to celebrate the wedding of Juliana & Pedro.'
  },

  /* ---------------------------------------------------------------- venue */
  venue: {
    name: 'St James Church',
    place: 'Karikkattoor',
    address: '[Full Wedding Address]',
    mapsUrl: 'https://share.google/KC3axPXe4xh5JiDZx'    // “View location” button
  },

  /* ------------------------------------------------------------ the verse */
  verse: {
    text: '[Add Bible Verse Here]',
    reference: '[Add Reference]'
  },

  /* ------------------------------------------------------------- profiles
     Optional extras (instagram, interests, quote, message) stay hidden until
     you fill them in. Instagram can be a full URL or just the @handle.      */
  bride: {
    name: 'Juliana',
    initial: 'J',
    fullName: 'Juliana',
    dob: '[Add Date]',
    place: '[Add Place]',
    education: '[Add Education]',
    profession: '[Add Profession]',
    father: "[Add Father's Name]",
    mother: "[Add Mother's Name]",
    siblings: '[Add Details]',
    intro: 'Grace, kindness and a beautiful heart. The beginning of a new chapter filled with love and happiness.',
    instagram: '',
    interests: '',
    quote: '',
    message: ''
  },

  groom: {
    name: 'Pedro',
    initial: 'P',
    fullName: 'Pedro',
    dob: '[Add Date]',
    place: '[Add Place]',
    education: '[Add Education]',
    profession: '[Add Profession]',
    father: "[Add Father's Name]",
    mother: "[Add Mother's Name]",
    siblings: '[Add Details]',
    intro: 'With dreams in his heart and love in his journey, he is ready to begin forever.',
    instagram: '',
    interests: '',
    quote: '',
    message: ''
  },

  /* ----------------------------------------------------------- love story */
  story: [
    {
      title: 'How We Met',
      date: '[Add Date]',
      text: 'A beautiful beginning to an unexpected journey.',
      image: 'assets/images/story-1.jpg'
    },
    {
      title: 'The Beginning of Forever',
      date: '[Add Date]',
      text: 'Two hearts discovering a lifetime of possibilities.',
      image: 'assets/images/story-2.jpg'
    },
    {
      title: 'Our Wedding Day',
      date: '',                       // '' = use the wedding date automatically
      text: 'The beginning of our forever.',
      image: 'assets/images/story-3.jpg'
    }
  ],

  /* --------------------------------------------------------------- images
     Replace the files in assets/images/ (same names) or change the paths.   */
  images: {
    hero:  'assets/images/hero.jpg',      // full-screen opening photograph  (≈1920×1080)
    bride: 'assets/images/bride.jpg',     // portrait                        (≈1100×1400)
    groom: 'assets/images/groom.jpg',     // portrait                        (≈1100×1400)
    venue: 'assets/images/venue.jpg'      // venue background                (≈1920×1080)
  },

  /* -------------------------------------------------------------- gallery
     Order matters: photo #1 is the large central hero image of the collage.
     12–16 photos work best. Drop in your own files and keep the list order. */
  gallery: [
    { src: 'assets/images/gallery/gallery-01.jpg', alt: 'Wedding photograph 1' },
    { src: 'assets/images/gallery/gallery-02.jpg', alt: 'Wedding photograph 2' },
    { src: 'assets/images/gallery/gallery-03.jpg', alt: 'Wedding photograph 3' },
    { src: 'assets/images/gallery/gallery-04.jpg', alt: 'Wedding photograph 4' },
    { src: 'assets/images/gallery/gallery-05.jpg', alt: 'Wedding photograph 5' },
    { src: 'assets/images/gallery/gallery-06.jpg', alt: 'Wedding photograph 6' },
    { src: 'assets/images/gallery/gallery-07.jpg', alt: 'Wedding photograph 7' },
    { src: 'assets/images/gallery/gallery-08.jpg', alt: 'Wedding photograph 8' },
    { src: 'assets/images/gallery/gallery-09.jpg', alt: 'Wedding photograph 9' },
    { src: 'assets/images/gallery/gallery-10.jpg', alt: 'Wedding photograph 10' },
    { src: 'assets/images/gallery/gallery-11.jpg', alt: 'Wedding photograph 11' },
    { src: 'assets/images/gallery/gallery-12.jpg', alt: 'Wedding photograph 12' },
    { src: 'assets/images/gallery/gallery-13.jpg', alt: 'Wedding photograph 13' },
    { src: 'assets/images/gallery/gallery-14.jpg', alt: 'Wedding photograph 14' },
    { src: 'assets/images/gallery/gallery-15.jpg', alt: 'Wedding photograph 15' }
  ],

  /* ---------------------------------------------------------------- music
     The bundled loop is an original instrumental generated for this project
     (no commercial song, no copyright issues). Replace with any file you
     have the rights to use.                                                 */
  music: {
    src: 'assets/music/wedding-music.mp3',
    volume: 0.45
  },

  /* ---------------------------------------------------------------- share */
  share: {
    title: 'Juliana & Pedro · Wedding Invitation',
    message: "You're invited to celebrate the wedding of Juliana & Pedro on 15 December 2027. We would love to have you with us!",
    url: ''     // '' = share the address of this page. Set your final website URL once it is online.
  }
};
